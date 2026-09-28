import { Badge } from "@smart/ui/components/badge";
import { Card, CardContent } from "@smart/ui/components/card";
import { Checkbox } from "@smart/ui/components/checkbox";
import { Label } from "@smart/ui/components/label";
import { Textarea } from "@smart/ui/components/textarea";
import { cn } from "@smart/ui/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

type AgeGroup =
	| "2mo"
	| "4mo"
	| "6mo"
	| "9mo"
	| "12mo"
	| "18mo"
	| "24mo"
	| "3yr"
	| "4yr"
	| "5yr";

interface Milestone {
	description: string;
	id: string;
	isRedFlag?: boolean;
}

const MILESTONES: Record<AgeGroup, { label: string; milestones: Milestone[] }> =
	{
		"2mo": {
			label: "2 Months",
			milestones: [
				{
					id: "2mo-1",
					description: "Calms when spoken to or picked up",
				},
				{ id: "2mo-2", description: "Looks at you or your face" },
				{ id: "2mo-3", description: "Makes sounds other than crying" },
				{ id: "2mo-4", description: "Reacts to loud sounds" },
				{ id: "2mo-5", description: "Holds head up when on tummy" },
				{ id: "2mo-6", description: "Moves both arms and both legs" },
				{
					id: "2mo-7",
					description: "Opens hands briefly",
					isRedFlag: true,
				},
			],
		},
		"4mo": {
			label: "4 Months",
			milestones: [
				{
					id: "4mo-1",
					description: "Smiles on their own to get your attention",
				},
				{
					id: "4mo-2",
					description: "Chuckles when you try to make them laugh",
				},
				{
					id: "4mo-3",
					description:
						"Looks at you, moves, or makes sounds to get your attention",
				},
				{ id: "4mo-4", description: "Makes cooing sounds" },
				{
					id: "4mo-5",
					description: "Holds head steady without support when held",
				},
				{
					id: "4mo-6",
					description: "Holds a toy when you put it in their hand",
				},
				{ id: "4mo-7", description: "Uses their arm to swing at toys" },
				{
					id: "4mo-8",
					description: "Not bringing hands to mouth",
					isRedFlag: true,
				},
			],
		},
		"6mo": {
			label: "6 Months",
			milestones: [
				{ id: "6mo-1", description: "Knows familiar people" },
				{ id: "6mo-2", description: "Likes to look at self in mirror" },
				{ id: "6mo-3", description: "Laughs" },
				{
					id: "6mo-4",
					description: "Takes turns making sounds with you",
				},
				{
					id: "6mo-5",
					description:
						"Blows 'raspberries' (sticks tongue out and blows)",
				},
				{ id: "6mo-6", description: "Rolls from tummy to back" },
				{
					id: "6mo-7",
					description: "Leans on hands for support when sitting",
				},
				{
					id: "6mo-8",
					description: "Doesn't reach for toys",
					isRedFlag: true,
				},
			],
		},
		"9mo": {
			label: "9 Months",
			milestones: [
				{
					id: "9mo-1",
					description: "Smiles or makes sounds to get attention",
				},
				{
					id: "9mo-2",
					description: "Shows several facial expressions",
				},
				{ id: "9mo-3", description: "Looks when you call their name" },
				{
					id: "9mo-4",
					description:
						"Reacts when you leave (looks, reaches, or cries)",
				},
				{
					id: "9mo-5",
					description:
						"Makes a lot of different sounds like 'mamamama'",
				},
				{ id: "9mo-6", description: "Sits without support" },
				{
					id: "9mo-7",
					description: "Moves things from one hand to the other",
				},
				{
					id: "9mo-8",
					description: "Doesn't respond to name",
					isRedFlag: true,
				},
			],
		},
		"12mo": {
			label: "12 Months",
			milestones: [
				{ id: "12mo-1", description: "Plays pat-a-cake" },
				{
					id: "12mo-2",
					description:
						"Puts something in a container, like a block in a cup",
				},
				{
					id: "12mo-3",
					description: "Looks for things they see you hide",
				},
				{ id: "12mo-4", description: "Says 'mama' or 'dada'" },
				{ id: "12mo-5", description: "Pulls up to stand" },
				{ id: "12mo-6", description: "Walks holding on to furniture" },
				{
					id: "12mo-7",
					description: "Picks up small objects with thumb and finger",
				},
				{
					id: "12mo-8",
					description: "Doesn't use gestures like waving",
					isRedFlag: true,
				},
			],
		},
		"18mo": {
			label: "18 Months",
			milestones: [
				{
					id: "18mo-1",
					description:
						"Moves away from you but looks to make sure you're close",
				},
				{
					id: "18mo-2",
					description: "Points to show you something interesting",
				},
				{
					id: "18mo-3",
					description: "Puts hands out for you to wash them",
				},
				{
					id: "18mo-4",
					description: "Looks at a few pages in a book with you",
				},
				{ id: "18mo-5", description: "Follows one-step directions" },
				{ id: "18mo-6", description: "Says at least 3 words" },
				{ id: "18mo-7", description: "Walks alone" },
				{
					id: "18mo-8",
					description: "Walks up a few stairs with or without help",
				},
				{
					id: "18mo-9",
					description: "No pointing to show interest",
					isRedFlag: true,
				},
			],
		},
		"24mo": {
			label: "2 Years",
			milestones: [
				{
					id: "24mo-1",
					description: "Notices when others are hurt or upset",
				},
				{
					id: "24mo-2",
					description:
						"Looks at your face to see how to react in a new situation",
				},
				{ id: "24mo-3", description: "Says at least 2 words together" },
				{
					id: "24mo-4",
					description: "Points to things in a book when you ask",
				},
				{ id: "24mo-5", description: "Uses simple 2-step directions" },
				{ id: "24mo-6", description: "Kicks a ball" },
				{ id: "24mo-7", description: "Runs" },
				{ id: "24mo-8", description: "Eats with a spoon" },
				{
					id: "24mo-9",
					description: "Doesn't use 2-word phrases",
					isRedFlag: true,
				},
			],
		},
		"3yr": {
			label: "3 Years",
			milestones: [
				{
					id: "3yr-1",
					description: "Calms down within 10 minutes after you leave",
				},
				{
					id: "3yr-2",
					description:
						"Notices other children and joins them to play",
				},
				{
					id: "3yr-3",
					description:
						"Talks with you using 2 or more back-and-forth exchanges",
				},
				{
					id: "3yr-4",
					description: "Asks who, what, where, or why questions",
				},
				{ id: "3yr-5", description: "Says first name when asked" },
				{
					id: "3yr-6",
					description:
						"Talks well enough for others to understand most of the time",
				},
				{
					id: "3yr-7",
					description: "Draws a circle when you show them how",
				},
				{
					id: "3yr-8",
					description: "Avoids eye contact",
					isRedFlag: true,
				},
			],
		},
		"4yr": {
			label: "4 Years",
			milestones: [
				{
					id: "4yr-1",
					description: "Pretends to be something else during play",
				},
				{
					id: "4yr-2",
					description: "Comforts others who are hurt or sad",
				},
				{ id: "4yr-3", description: "Avoids danger" },
				{
					id: "4yr-4",
					description: "Says sentences with 4 or more words",
				},
				{
					id: "4yr-5",
					description:
						"Says some words from a song, story, or nursery rhyme",
				},
				{
					id: "4yr-6",
					description:
						"Tells you what they think will happen next in a book",
				},
				{
					id: "4yr-7",
					description: "Catches a large ball most of the time",
				},
				{
					id: "4yr-8",
					description:
						"Serves themselves food or pours water with adult supervision",
				},
				{
					id: "4yr-9",
					description: "Can't jump in place",
					isRedFlag: true,
				},
			],
		},
		"5yr": {
			label: "5 Years",
			milestones: [
				{
					id: "5yr-1",
					description:
						"Follows rules or takes turns when playing games",
				},
				{ id: "5yr-2", description: "Sings, dances, or acts for you" },
				{ id: "5yr-3", description: "Does simple chores at home" },
				{
					id: "5yr-4",
					description:
						"Tells a story they heard with at least 2 events",
				},
				{ id: "5yr-5", description: "Answers questions about a story" },
				{ id: "5yr-6", description: "Counts to 10" },
				{
					id: "5yr-7",
					description: "Names some numbers when you point to them",
				},
				{ id: "5yr-8", description: "Hops on one foot" },
				{
					id: "5yr-9",
					description: "Not able to speak clearly",
					isRedFlag: true,
				},
			],
		},
	};

interface DevelopmentalMilestonesProps {
	ageGroup?: AgeGroup;
	className?: string;
	onChange?: (data: {
		ageGroup: AgeGroup;
		achieved: string[];
		redFlags: string[];
		notes: string;
	}) => void;
	showNotes?: boolean;
	showRedFlags?: boolean;
}

export function DevelopmentalMilestones({
	className,
	ageGroup = "12mo",
	showRedFlags = true,
	showNotes = true,
	onChange,
}: DevelopmentalMilestonesProps) {
	const [achieved, setAchieved] = useState<string[]>([]);
	const [notes, setNotes] = useState("");

	const { milestones, redFlags } = useMemo(() => {
		const group = MILESTONES[ageGroup];
		return {
			milestones: group.milestones.filter((m) => !m.isRedFlag),
			redFlags: group.milestones.filter((m) => m.isRedFlag),
		};
	}, [ageGroup]);

	const handleToggle = useCallback(
		(id: string) => {
			const updated = achieved.includes(id)
				? achieved.filter((a) => a !== id)
				: [...achieved, id];
			setAchieved(updated);
			onChange?.({
				ageGroup,
				achieved: updated,
				redFlags: redFlags.map((r) => r.id),
				notes,
			});
		},
		[achieved, ageGroup, redFlags, notes, onChange]
	);

	const handleNotesChange = useCallback(
		(value: string) => {
			setNotes(value);
			onChange?.({
				ageGroup,
				achieved,
				redFlags: redFlags.map((r) => r.id),
				notes: value,
			});
		},
		[achieved, ageGroup, redFlags, onChange]
	);

	const progress = Math.round((achieved.length / milestones.length) * 100);

	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="space-y-4 p-4">
				<div className="flex items-center justify-between">
					<h4 className="font-semibold text-sm">
						Developmental Milestones - {MILESTONES[ageGroup].label}
					</h4>
					<Badge variant="secondary">{progress}%</Badge>
				</div>

				{/* Progress bar */}
				<div className="h-2 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-primary transition-all"
						style={{ width: `${progress}%` }}
					/>
				</div>

				{/* Milestones checklist */}
				<div className="space-y-2">
					{milestones.map((milestone) => (
						<div
							className="flex items-start gap-2 rounded p-2 hover:bg-muted/50"
							key={milestone.id}
						>
							<Checkbox
								checked={achieved.includes(milestone.id)}
								id={milestone.id}
								onCheckedChange={() =>
									handleToggle(milestone.id)
								}
							/>
							<Label
								className="flex-1 cursor-pointer text-sm"
								htmlFor={milestone.id}
							>
								{milestone.description}
							</Label>
						</div>
					))}
				</div>

				{/* Red flags */}
				{showRedFlags && redFlags.length > 0 && (
					<div className="border-t pt-2">
						<div className="mb-2 flex items-center gap-2">
							<AlertTriangle className="h-4 w-4 text-destructive" />
							<span className="font-medium text-destructive text-sm">
								Red Flags to Monitor
							</span>
						</div>
						<div className="space-y-1">
							{redFlags.map((flag) => (
								<div
									className="flex items-start gap-2 rounded bg-destructive/10 p-2"
									key={flag.id}
								>
									<AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
									<span className="text-destructive text-sm">
										{flag.description}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Notes */}
				{showNotes && (
					<div className="space-y-1 border-t pt-2">
						<Label className="text-xs">Clinical Notes</Label>
						<Textarea
							onChange={(e) => handleNotesChange(e.target.value)}
							placeholder="Additional observations, concerns, or recommendations..."
							rows={3}
							value={notes}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
