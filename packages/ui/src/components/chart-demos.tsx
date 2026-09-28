import {
	AreaChart,
	BarChart,
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	LineChart,
} from "@smart/ui/components/chart";

// Sample data for demos
const areaData = [
	{ month: "Jan", desktop: 186, mobile: 80 },
	{ month: "Feb", desktop: 305, mobile: 200 },
	{ month: "Mar", desktop: 237, mobile: 120 },
	{ month: "Apr", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "Jun", desktop: 214, mobile: 140 },
];

const barData = [
	{ month: "Jan", desktop: 186, mobile: 80 },
	{ month: "Feb", desktop: 305, mobile: 200 },
	{ month: "Mar", desktop: 237, mobile: 120 },
	{ month: "Apr", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "Jun", desktop: 214, mobile: 140 },
];

const lineData = [
	{ month: "Jan", desktop: 186, mobile: 80 },
	{ month: "Feb", desktop: 305, mobile: 200 },
	{ month: "Mar", desktop: 237, mobile: 120 },
	{ month: "Apr", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "Jun", desktop: 214, mobile: 140 },
];

const chartConfig = {
	desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
	mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

export function AreaChartDemo({ className }: { className?: string }) {
	return (
		<ChartContainer
			className={className}
			config={chartConfig}
		>
			<AreaChart
				colors={COLORS}
				data={areaData}
				dataKeys={["desktop", "mobile"]}
				xAxisKey="month"
			/>
			<ChartLegend config={chartConfig} />
		</ChartContainer>
	);
}

export function BarChartDemo({ className }: { className?: string }) {
	return (
		<ChartContainer
			className={className}
			config={chartConfig}
		>
			<BarChart
				colors={COLORS}
				data={barData}
				dataKeys={["desktop", "mobile"]}
				xAxisKey="month"
			/>
			<ChartLegend config={chartConfig} />
		</ChartContainer>
	);
}

export function LineChartDemo({ className }: { className?: string }) {
	return (
		<ChartContainer
			className={className}
			config={chartConfig}
		>
			<LineChart
				colors={COLORS}
				data={lineData}
				dataKeys={["desktop", "mobile"]}
				xAxisKey="month"
			/>
			<ChartLegend config={chartConfig} />
		</ChartContainer>
	);
}
