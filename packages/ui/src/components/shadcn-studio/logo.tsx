import LogoSvg from "@smart/ui/assets/svg/logo";

// Util Imports
import { cn } from "@smart/ui/lib/utils";

const Logo = ({ className }: { className?: string }) => (
	<div className={cn("flex items-center gap-2.5", className)}>
		<LogoSvg className="size-8.5" />
		<span className="font-bold text-xl">shadcn/studio</span>
	</div>
);

export default Logo;
