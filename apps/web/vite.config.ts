import path from "node:path";
import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const isAnalyze = process.env.ANALYZE === "true";

export default defineConfig({
	server: {
		port: 3001,
	},
	resolve: {
		tsconfigPaths: true,
		alias: {
			"@": path.resolve(root, "./src"),
		},
		dedupe: [
			"react",
			"react-dom",
			"react/jsx-runtime",
			"react/jsx-dev-runtime",
			"@tanstack/react-router",
		],
	},
	ssr: {
		noExternal: [
			"cmdk",
			"lucide-react",
			"@tanstack/react-router",
			"@tanstack/react-query",
			"sonner",
			/@base-ui.*/,
			/@tiptap.*/,
			/@tanstack.*/,
			/@react-three.*/,
			"@smart/api",
			"@smart/auth",
			"@smart/db",
			"@smart/utils",
		],
	},
	plugins: [
		devtools({
			// https://tanstack.com/devtools/latest/docs/vite-plugin#console-piping
			consolePiping: { enabled: false },
		}),
		babel({
			presets: [reactCompilerPreset()],
			exclude: [/[/\\]node_modules[/\\]/, /lanyard-glb-data/],
		}),
		nitro({
			rollupConfig: {
				external: [
					/^@sentry\//,
					"@opentelemetry/api",
					"better-auth",
					/^better-auth\//,
				],
			},

			prerender: {
				routes: ["/"],
				crawlLinks: false,
				failOnError: true, // ← makes this build hard-fail, so you see the stack
			},

			compatibilityDate: "latest",
			preset: "bun",
		}),
		tailwindcss(),
		tanstackStart({
			prerender: {
				enabled: false,
				filter: ({ path }) => !path.startsWith("/app"),
			},
		}),
		viteReact(),
		isAnalyze &&
			visualizer({
				filename: "stats.html",
				gzipSize: true,
				brotliSize: true,
				open: true,
			}),
	].filter(Boolean),
	environments: {
		ssr: { build: { rollupOptions: { input: "./src/server.ts" } } },
	},
	build: {
		chunkSizeWarningLimit: 7000,
		rolldownOptions: {
			checks: {
				bundlerTimings: false, // silences PLUGIN_TIMINGS + group-name warnings
				moduleLevelDirective: false,
			},
			output: {
				codeSplitting: {
					groups: [
						// React — always needed, keep together, small
						{
							name: "react",
							debugName: "react",
							test: /node_modules\/(react|react-dom|scheduler)\//,
						},

						// Better Auth — big, only needed on auth-related routes
						{
							name: "better-auth",
							debugName: "better-auth",
							test: /node_modules\/better-auth/,
						},

						// oRPC — API client
						{
							name: "orpc",
							debugName: "orpc",
							test: /node_modules\/@orpc/,
						},

						// TanStack Router — routing core
						{
							name: "tanstack-router",
							debugName: "tanstack-router",
							test: /node_modules\/@tanstack\/(react-)?router/,
						},

						// TanStack Query — data client
						{
							name: "tanstack-query",
							debugName: "tanstack-query",
							test: /node_modules\/@tanstack\/react-query/,
						},

						// Base UI primitives (shadcn's underlying layer) — used everywhere
						{
							name: "base-ui",
							debugName: "base-ui",
							test: /node_modules\/@base-ui/,
						},

						// Charts — only needed on chart routes
						{
							name: "charts",
							debugName: "charts",
							test: /node_modules\/@tanstack\/charts/,
						},

						// Drizzle — DB layer
						{
							name: "drizzle",
							debugName: "drizzle",
							test: /node_modules\/drizzle-orm/,
						},

						// Zod — validation, used everywhere but big
						{
							name: "zod",
							debugName: "zod",
							test: /node_modules\/zod/,
						},

						// Lucide — icons, huge number of modules
						{
							name: "lucide",
							debugName: "lucide",
							test: /node_modules\/lucide-react/,
						},

						// Three.js — 3D, only on routes that need it
						{
							name: "three",
							debugName: "three",
							test: /node_modules\/three/,
						},

						// Everything else
						{
							name: "vendor",
							debugName: "vendor",
							test: /node_modules\/(?!.*(?:react|react-dom|scheduler|better-auth|@orpc|@tanstack\/(?:react-)?router|@tanstack\/react-query|@base-ui|@tanstack\/charts|drizzle-orm|zod|lucide-react|three))/,
						},
					],
				},
			},
		},
	},
});
