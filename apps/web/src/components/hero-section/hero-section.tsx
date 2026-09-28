import { Badge } from "@smart/ui/components/badge";
import { Button } from "@smart/ui/components/button";
import IdCard from "@smart/ui/components/id-card";
import { Marquee } from "@smart/ui/components/marquee";
import {
	ArrowRightIcon,
	AwardIcon,
	CalendarIcon,
	StethoscopeIcon,
} from "lucide-react";

import GreetingWord from "./greeting-word";

// Updated to point to your new exported portrait image
const PROFILE_IMAGE_URL = "/images/portrait.webp";

// Centralize copy → swap here for i18n / CMS later.
const CONTENT = {
	badge: "Accepting New Patients",
	name: "I am Dr. Hazem 👋🏻",
	title: "Certified Pediatrician & IBCLC",
	bio: "Board-certified pediatrician and International Board Certified Lactation Consultant based in Cairo. I don't just treat children — I partner with families through every stage, from a newborn's first feed to a toddler's first steps.",
	primaryCta: { label: "Book Appointment", href: "#book" },
	secondaryCta: { label: "Explore Services", href: "#services" },
	trust: [
		{ icon: StethoscopeIcon, label: "10+ Years Experience" },
		{ icon: AwardIcon, label: "IBCLC Certified" },
	],
} as const;

type BrandLogo = {
	image: string;
	name: string;
};

type HeroSectionProps = {
	brandLogos: BrandLogo[];
};

const HeroSection = ({ brandLogos }: HeroSectionProps) => {
	return (
		<section className="lg:relative">
			<div className="max-sm:pt-20 sm:py-16 lg:pt-32 lg:pb-24">
				<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					<div className="space-y-6 lg:max-w-lg">
						<Badge
							className="h-6.5 gap-1 overflow-visible rounded-full bg-card text-green-600 dark:text-green-400"
							variant="outline"
						>
							<span className="relative inline-flex size-1.5">
								<span className="absolute -inset-0.5 animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-green-600/40 opacity-75 dark:bg-green-400/40" />
								<span className="relative inline-flex size-1.5 rounded-full bg-green-600 dark:bg-green-400" />
							</span>
							{CONTENT.badge}
						</Badge>

						<h1 className="mb-2 font-semibold text-4xl tracking-tight sm:text-5xl lg:font-bold lg:text-[64px]">
							<GreetingWord />
							{CONTENT.name}
						</h1>

						<p className="font-medium text-muted-foreground text-xl sm:text-2xl lg:text-3xl">
							{CONTENT.title}
						</p>

						<p className="mb-8 max-w-2xl text-base text-muted-foreground">
							{CONTENT.bio}
						</p>

						<div className="flex flex-wrap items-center gap-2.5 pt-2">
							<Button
								nativeButton={false}
								render={
									<a
										className="flex h-11 items-center rounded-full px-4 text-base"
										href={CONTENT.primaryCta.href}
									>
										<CalendarIcon className="me-2 size-4" />
										{CONTENT.primaryCta.label}
									</a>
								}
								variant="outline"
							/>

							<Button
								nativeButton={false}
								render={
									<a
										className="group flex h-11 items-center gap-2.5 rounded-full bg-card ps-4! pe-4! text-base shadow-sm transition-[padding] duration-300 hover:bg-card hover:ps-2!"
										href={CONTENT.secondaryCta.href}
									>
										<span className="relative flex size-2.5 items-center justify-center overflow-hidden rounded-full bg-primary transition-all duration-300 group-hover:size-6.5">
											<ArrowRightIcon className="absolute size-4.5 -translate-x-3 text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rtl:translate-x-3 rtl:group-hover:-translate-x-0" />
										</span>
										{CONTENT.secondaryCta.label}
									</a>
								}
								variant="outline"
							/>
						</div>

						{/* Trust indicators — pediatric context: experience + IBCLC credential */}
						<ul className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 text-muted-foreground text-sm">
							{CONTENT.trust.map(({ icon: Icon, label }) => (
								<li
									className="flex items-center gap-2"
									key={label}
								>
									<Icon className="size-5 text-primary" />
									<span>{label}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<IdCard
				className="mx-auto mt-8 aspect-4/5 w-full max-w-80 max-lg:hidden lg:absolute lg:start-0 lg:end-0 lg:-top-31 lg:z-10 lg:mt-0 lg:aspect-auto lg:h-182 lg:max-w-none"
				frontImage={PROFILE_IMAGE_URL}
			/>

			<div className="relative mx-auto mt-10 mb-10 w-full max-w-5xl">
				<div className="pointer-events-none absolute inset-y-0 start-0 z-1 w-16 bg-linear-to-r from-background to-transparent sm:w-35" />
				<div className="pointer-events-none absolute inset-y-0 end-0 z-1 w-16 bg-linear-to-l from-background to-transparent sm:w-35" />
				<div className="mx-auto w-full max-w-5xl overflow-hidden">
					<Marquee
						duration={25}
						gap={2}
						pauseOnHover
					>
						{brandLogos.map((logo, logoIndex) => (
							<div
								className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted"
								key={`${logo.image}-${logoIndex}`}
							>
								<img
									alt={logo.name}
									className="size-10 object-contain grayscale"
									height="auto"
									loading="lazy"
									src={logo.image}
									width="auto"
								/>
							</div>
						))}
					</Marquee>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
