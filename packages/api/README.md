# `@smart/api` — oRPC API Package

A type-safe, modular RPC API layer powering the Smart Pediatric Clinic platform. Built on [oRPC](https://orpc.unnoq.com/) with first-class [TanStack Query](https://tanstack.com/query/latest) integration, Zod validation, Drizzle ORM, and PowerSync-compatible sync endpoints.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Package Structure](#package-structure)
- [Core Concepts](#core-concepts)
  - [Context](#context)
  - [Procedures](#procedures)
  - [Routers](#routers)
  - [Serialization](#serialization)
- [Routers Reference](#routers-reference)
- [Client Integration](#client-integration)
  - [TanStack Query](#tanstack-query)
  - [Hydration & SSR](#hydration--ssr)
- [Logging](#logging)
- [Error Handling](#error-handling)
- [PowerSync Sync Layer](#powersync-sync-layer)
- [Utilities](#utilities)
- [Development](#development)
- [Scripts](#scripts)
- [Conventions & Best Practices](#conventions--best-practices)
- [Related Packages](#related-packages)

---

## Overview

`@smart/api` is the **single source of truth** for all server-side business logic in the Smart Pediatric Clinic monorepo. It exposes an oRPC router consumed by the web app (and any future clients) via HTTP RPC, and it is designed for:

- **End-to-end type safety** — from Zod input schemas to TanStack Query hooks on the client.
- **Role-based access control** — procedures are composed from reusable middleware (`publicProcedure`, `protectedProcedure`, `adminProcedure`, `doctorProcedure`, `staffProcedure`).
- **Multi-tenant isolation** — every clinic-scoped query enforces `clinicId` derived from the authenticated session.
- **Offline-first sync** — a PowerSync router handles bi-directional batch CRUD and delta queries against the Drizzle schema.
- **Observability** — structured Pino logging with trace context, redaction, and performance timing.
- **Composability** — repositories from `@smart/db/repositories` are the only persistence layer; routers never touch the DB directly except in the PowerSync sync path.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    apps/web (TanStack Start)                │
│  ┌────────────────────┐   ┌──────────────────────────────┐  │
│  │  TanStack Query    │◄──┤  createTanstackQueryUtils    │  │
│  │  (queries/mutations│   │  (orpc.*.queryOptions, etc.) │  │
│  └────────────────────┘   └──────────────────────────────┘  │
│                    │                ▲                       │
│                    ▼                │                       │
│            RPCLink / HTTP RPC       │  SSR dehydration      │
└─────────────────────────────────────┼───────────────────────┘
                                      │
┌─────────────────────────────────────┼───────────────────────┐
│                    packages/api     │                       │
│  ┌──────────────────────────────────┴────────────────────┐  │
│  │  appRouter (routers/index.ts)                         │  │
│  │  ├── auth          ├── encounter   ├── prescription   │  │
│  │  ├── patient       ├── vitals      ├── dashboard      │  │
│  │  ├── staff         ├── growth      ├── powerSync      │  │
│  │  ├── appointment   ├── immunization├── lab            │  │
│  │  └── healthCheck                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  Procedures  │ │ Repositories │ │  Logger / Errors  │   │
│  │  (RBAC)      │ │  (@smart/db) │ │  (Pino)           │   │
│  └──────────────┘ └──────────────┘ └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────┐
│  packages/db  (Drizzle ORM + PostgreSQL)                    │
│  packages/auth (Better Auth session)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation

This package is part of the monorepo and consumed via workspace protocol:

```jsonc
// apps/web/package.json
{
  "dependencies": {
    "@smart/api": "workspace:*"
  }
}
```

Install dependencies from the repo root:

```bash
bun install
```

---

## Package Structure

```
packages/api/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # oRPC base, procedures (RBAC middleware)
    ├── context.ts            # Context type (session, db, user, clinicId)
    ├── schema.ts             # Public OpenAPI-facing schema re-exports
    ├── serializer.ts         # Shared StandardRPCJsonSerializer
    ├── repositories.ts       # RepositoryFactory singleton
    ├── logger/
    │   ├── client.ts         # Browser Pino logger + identity
    │   └── server.ts         # Server Pino, trace, redaction, manager
    ├── routers/
    │   ├── index.ts          # appRouter composition
    │   ├── auth.ts
    │   ├── patient.ts
    │   ├── staff.ts
    │   ├── appointment.ts
    │   ├── encounter.ts
    │   ├── vitals.ts
    │   ├── growth.ts
    │   ├── immunization.ts
    │   ├── lab.ts
    │   ├── prescription.ts
    │   ├── dashboard.ts
    │   ├── powersync.ts
    │   └── llm.router.ts     # (LM Studio / local LLM helpers)
    └── utils/
        ├── error.ts          # handleDatabaseError (PG code → ORPCError)
        ├── power.ts          # getRequiredString, getRequiredDate
        ├── timing.ts         # AsyncLocalStorage timing store
        └── index.ts
```

---

## Core Concepts

### Context

Every procedure receives a typed `Context`:

```ts
export type Context = {
  session: Session | null;
  db: Database;
  request: Request;
  user: User | null;
  clinicId?: string;
};
```

- `user` / `session` are populated by the HTTP handler from `@smart/auth`.
- `clinicId` is the tenant scope; **all** clinic-scoped repository calls use `getClinicId(context)` which throws `FORBIDDEN` if missing.

### Procedures

Procedures are oRPC builders with cumulative middleware. Import from `@smart/api`:

| Procedure               | Requires                        | Typical use                     |
| ----------------------- | ------------------------------- | ------------------------------- |
| `publicProcedure`       | —                               | Login, register, health check   |
| `protectedProcedure`    | Valid session                   | Patient self-service reads      |
| `staffProcedure`        | Any valid clinic role           | Lists, searches, dashboards     |
| `doctorProcedure`       | `admin` or `doctor`             | Clinical writes (Rx, encounters)|
| `adminProcedure`        | `admin`                         | Destructive ops, user management|

```ts
import { doctorProcedure, getClinicId } from "@smart/api";

export const patientRouter = {
  create: doctorProcedure
    .input(createPatientSchema)
    .handler(async ({ input, context }) => {
      return patientRepository.create(input, {
        clinicId: getClinicId(context),
      });
    }),
};
```

### Routers

Routers are plain objects whose keys become RPC paths. They are composed in `routers/index.ts`:

```ts
export const appRouter = {
  auth: authRouter,
  patient: patientRouter,
  staff: staffRouter,
  appointment: appointmentRouter,
  encounter: encounterRouter,
  vitals: vitalRouter,
  growth: growthRouter,
  immunization: immunizationRouter,
  lab: labRouter,
  prescription: prescriptionRouter,
  dashboard: dashboardRouter,
  powerSync: powerSyncRouter,
  privateData: protectedProcedure.handler(({ context }) => ({ ... })),
  healthCheck: publicProcedure.handler(() => "OK"),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
```

Clients consume `AppRouterClient` to get fully typed `.patient.list()`, `.appointment.create()`, etc.

### Serialization

A single `StandardRPCJsonSerializer` instance is exported for use by the RPC link, QueryClient, and SSR hydrate/dehydrate pipelines. It natively handles `Date`, `undefined`, `bigint`, `URL`, `RegExp`, `Map`, `Set`, and `Infinity`. Add custom serializers here only for exotic types (Temporal, Decimal, etc.).

```ts
import { serializer } from "@smart/api/serializer";
```

---

## Routers Reference

### `auth`

Public and authenticated identity operations.

- **Public**: `login`, `register`, `resetPassword`, `confirmResetPassword`, `verifyEmail`, `logout`
- **Authenticated**: `changePassword`, `updateUser`, `getSession`, `setupTwoFactor`, `verifyTwoFactor`, `disableTwoFactor`
- **Admin**: `listUsers`, `getUserById`, `updateUserRole`, `suspendUser`, `activateUser`, `deleteUser`, `getAuditLogs`

### `patient`

Full patient lifecycle with tenant scoping.

- `list`, `search`, `getAll`, `count`
- `getById`, `getByMRN`, `getFullData`
- `getEncounters`, `getGrowthData`, `getImmunizations`, `getPrescriptions`, `getLabOrders`, `getVitals`
- `create` (with guardians, allergies, chronic conditions), `update`, `delete`
- `merge` (admin), `getStats` (admin)

### `staff`

Clinic staff directory and aggregates.

- `getById`, `getByEmail`, `findAll`, `getActive`, `getByRole`, `getCount`, `getStats`
- `getWithPatients`, `getWithEncounters`, `getWithPrescriptions`
- `create`, `createBatch`, `update`, `toggleActive`, `delete`

### `appointment`

Scheduling with status lifecycle.

- `getById`, `findAll`, `findByPatientId`, `findByStaffId`, `findByDate`, `getUpcoming`, `getStats`
- `create`, `createBatch`, `update`, `updateStatus`
- `checkIn`, `start`, `complete`, `cancel`, `markNoShow`, `noShow`, `delete`

### `encounter`

Clinical documentation (SOAP).

- `getById`, `findByPatientId`, `search`, `getRecent`, `getStats`
- `create`, `createBatch`, `update`
- `addVitals`, `addDiagnosis`, `addTreatmentPlan`, `sign`, `delete`

### `vitals`

- `getById`, `findAll`, `getByPatientId`, `getByEncounterId`, `getLatest`, `getAbnormal`, `getByDateRange`, `getCount`
- `create`, `update`, `delete`

### `growth`

Patient growth measurements plus WHO reference data.

- Patient: `getById`, `getByPatientId`, `getLatest`, `getChartData`, `getStats`, `getPercentiles`
- WHO: `getWHOData`, `getWHOPercentileCurve`, `getWHOLMSParameters`, `getWHOAgeRange`
- Mutations: `create`, `createBatch`, `update`, `delete`

### `immunization`

- `getById`, `getByPatientId`, `getOverdue`, `getUpcoming`, `getAllOverdue`, `getComplianceRate`, `getCount`
- `create`, `createBatch`, `update`, `administer`, `defer`, `refuse`, `recordAdverseReaction`, `delete`

### `lab`

Lab orders and results.

- `getById`, `getByOrderNumber`, `findAll`, `getByPatientId`, `getPending`, `getStats`, `getAbnormalResults`
- `create`, `createBatch`, `update`, `updateStatus`, `addResults`, `submitResults`, `collectSample`, `cancel`, `delete`

### `prescription`

- `getById`, `getByRxNumber`, `findAll`, `getByPatientId`, `getActive`, `getStats`
- `create`, `createBatch`, `update`, `updateStatus`, `discontinue`, `fill`, `renew`, `delete`

### `dashboard`

Aggregated clinic KPIs, schedule, activity feed, and alerts.

- `getDashboard`, `getSummary`, `getStats`
- `getTodaySchedule`, `getRecentActivity`
- `getAlerts`, `resolveAlert`

### `powerSync`

See [PowerSync Sync Layer](#powersync-sync-layer).

### `healthCheck`

`publicProcedure` returning `"OK"` — used by uptime checks.

---

## Client Integration

### TanStack Query

`@smart/api` exposes types compatible with `@orpc/tanstack-query`. In `apps/web`:

```ts
// apps/web/src/utils/orpc.ts
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@smart/api";

const link = new RPCLink({
  url: `${import.meta.env.VITE_API_URL}/rpc`,
  headers: () => ({ /* auth headers */ }),
});

export const client: AppRouterClient = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
```

Then, in components:

```tsx
const { data } = useQuery(orpc.patient.list.queryOptions({ input: { limit: 20 } }));
const createPatient = useMutation(orpc.patient.create.mutationOptions());
```

Invalidate related queries after a mutation:

```ts
queryClient.invalidateQueries({ queryKey: orpc.patient.key() });
```

### Hydration & SSR

Extend the default `QueryClient` with the shared serializer so Dates, undefined, and other rich types survive dehydration:

```ts
import { serializer } from "@smart/api/serializer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn(queryKey) {
        const [json, meta] = serializer.serialize(queryKey);
        return JSON.stringify({ json, meta });
      },
      staleTime: 60 * 1000,
    },
    dehydrate: {
      serializeData(data) {
        const [json, meta] = serializer.serialize(data);
        return { json, meta };
      },
    },
    hydrate: {
      deserializeData(data) {
        return serializer.deserialize(data.json, data.meta);
      },
    },
  },
});
```

---

## Logging

Two loggers ship with the package:

- **Server** (`logger/server.ts`): Pino with redaction, trace context, a `LoggerManager` that reads/writes per-logger levels, and a `createStructuredLogger` adapter.
- **Client** (`logger/client.ts`): browser-safe Pino with optional `navigator.sendBeacon` transport, identity context (`setIdentity`/`clearIdentity`), and error level inference.

```ts
import { logger } from "@smart/api/logger/server";

logger.info({ msg: "Patient created", patientId, userId });
logger.error({ msg: "Failed to sync", error: err.message });
```

Sensitive fields (`password`, `token`, `authorization`, `*.email`, `*.phone`, `*.address`) are redacted automatically.

---

## Error Handling

- **`ORPCError`** is thrown everywhere. Codes map to HTTP statuses.
- **`handleDatabaseError`** translates PostgreSQL error codes (`23505` unique, `23503` FK, `23502` not-null, `22P02` invalid syntax, `22001` too long) into appropriate oRPC codes.
- On the client, use `isDefinedError` from `@orpc/client` for type-safe branching.

```ts
import { isDefinedError } from "@orpc/client";

const mutation = useMutation(orpc.patient.create.mutationOptions({
  onError(error) {
    if (isDefinedError(error)) {
      // error.code and error.data are typed
    }
  },
}));
```

---

## PowerSync Sync Layer

The `powerSync` router provides offline-first sync primitives against the Drizzle schema:

| Procedure        | Purpose                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `getToken`       | Issues a short-lived RS256 JWT (55 min) for PowerSync auth.        |
| `syncBatch`      | Applies up to 1000 `PUT`/`PATCH`/`DELETE` ops in a single tx.      |
| `getChanges`     | Delta query across supported tables since a timestamp.             |
| `getRecord`      | Fetch a single record by table + id, tenant-scoped.                |
| `getAllRecords`  | Paginated table dump with optional `patientId` filter.             |

Supported tables are declared in `queryModels` and `TABLE_CONFIGS` — add new tables there to extend the sync surface. Dynamic queries use Drizzle's `db.query.*` builders behind a narrow `DrizzleQueryBuilder` interface.

---

## Utilities

- **`getRequiredString(value, field)`** — coercion-safe string validator.
- **`getRequiredDate(value, field)`** — parses string/number/Date into a valid `Date`.
- **`timingStore`** — `AsyncLocalStorage` for per-request Drizzle timing collection.

---

## Development

### Type checking

```bash
bun run --filter @smart/api typecheck
```

### Linting & formatting

Biome is the single tool for both:

```bash
bun run --filter @smart/api lint
bun run --filter @smart/api format
```

### Build

```bash
bun run --filter @smart/api build
```

### Tests

```bash
bun run --filter @smart/api test
```

---

## Scripts

| Script      | Description                                   |
| ----------- | --------------------------------------------- |
| `build`     | Compiles the package with `tsc`.              |
| `dev`       | Watch mode compilation.                       |
| `typecheck` | `tsc --noEmit` against `tsconfig.json`.       |
| `lint`      | Biome check.                                  |
| `format`    | Biome format with write.                      |
| `test`      | Runs the package test suite.                  |

> Adjust names to match `packages/api/package.json`.

---

## Conventions & Best Practices

1. **One router per domain.** Keep files in `routers/` aligned with Drizzle schema domains.
2. **Validate at the boundary.** Every procedure declares `.input(zodSchema)` — no implicit `any`.
3. **Never trust `clinicId` from input.** Always derive it via `getClinicId(context)` and pass as repository option.
4. **Repositories own persistence.** Routers call `@smart/db/repositories`; only `powerSync` uses `db` directly for dynamic sync.
5. **Pick the least-privileged procedure.** Default to `staffProcedure`; escalate only when required.
6. **Throw `ORPCError` with a message.** Codes are the contract; messages are for humans.
7. **Log once per handler on failure** — include `userId`, entity ids, and the error message, not the raw error object.
8. **Add new sync tables** to both `queryModels` and `TABLE_CONFIGS` in `routers/powersync.ts`.
9. **Keep `serializer.ts` the single shared instance.** Import it from `@smart/api/serializer` on both server and client.
10. **Type-only exports.** `AppRouterClient` is what clients import; never import runtime code across the network boundary.

---

## Related Packages

| Package             | Role                                                        |
| ------------------- | ----------------------------------------------------------- |
| `@smart/auth`       | Session, user types, Better Auth integration.               |
| `@smart/db`         | Drizzle schema, Zod validators, repositories.               |
| `@smart/env`        | Runtime-validated environment variables (server/native/web).|
| `@smart/ui`         | Shared React component library (shadcn-based).              |
| `@smart/utils`      | Framework-agnostic utilities (dates, growth, WHO, etc.).    |
| `apps/web`          | TanStack Start front-end consuming this API.                |

---

## License

Private — part of the Smart Pediatric Clinic monorepo. Not for external distribution.
