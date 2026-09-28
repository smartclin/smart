import Logo from "@smart/ui/assets/svg/logo";
import { Button } from "@smart/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@smart/ui/components/dropdown-menu";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@smart/ui/components/navigation-menu";
import { cn } from "@smart/ui/lib/utils";
import { MenuIcon } from "lucide-react";

export type NavigationSection = {
	title: string;
	href: string;
};

type HeaderProps = {
	navigationData: NavigationSection[];
	className?: string;
};

const Header = ({ navigationData, className }: HeaderProps) => {
	return (
		<header
			className={cn(
				"sticky top-0 z-50 h-16 border-b bg-background",
				className
			)}
		>
			<div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
				{/* Logo */}
				<a href="/#">
					<Logo className="gap-3" />
				</a>

				{/* Navigation */}
				<NavigationMenu className="max-md:hidden">
					<NavigationMenuList className="flex-wrap justify-start gap-0">
						{navigationData.map((navItem) => (
							<NavigationMenuItem key={navItem.title}>
								<NavigationMenuLink
									className="bg-transparent! px-3 py-1.5 font-medium text-base! text-muted-foreground hover:text-primary"
									href={navItem.href}
								>
									{navItem.title}
								</NavigationMenuLink>
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>

				{/* Login Button */}
				<Button
					className="max-md:hidden"
					nativeButton={false}
					render={<a href="/#" />}
					size="lg"
				>
					Login
				</Button>

				{/* Navigation for small screens */}
				<div className="flex gap-4 md:hidden">
					<Button
						nativeButton={false}
						render={<a href="/#" />}
						size="lg"
					>
						Login
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									size="icon-lg"
									variant="outline"
								/>
							}
						>
							<MenuIcon />
							<span className="sr-only">Menu</span>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-56"
						>
							{navigationData.map((item, index) => (
								<DropdownMenuItem key={index}>
									<a href={item.href}>{item.title}</a>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
};

export default Header;
