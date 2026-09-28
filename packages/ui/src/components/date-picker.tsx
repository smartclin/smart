import { Button } from "@smart/ui/components/button";
import { Calendar } from "@smart/ui/components/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@smart/ui/components/popover";
import { cn } from "@smart/ui/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { RefObject } from "react";

export const DatePicker = function DatePickerCmp({
	date,
	setDate,
	ref,
}: {
	date?: Date;
	setDate: (date?: Date) => void;
	ref?: RefObject<HTMLDivElement | null>;
}) {
	return (
		<Popover>
			<PopoverTrigger
				render={
					<Button
						className={cn(
							"w-full justify-start text-left font-normal",
							!date && "text-muted-foreground"
						)}
						variant={"outline"}
					/>
				}
			>
				<CalendarIcon className="mr-2 h-4 w-4" />
				{date ? format(date, "PPP") : <span>Pick a date</span>}
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-0"
				ref={ref}
			>
				<Calendar
					mode="single"
					onSelect={setDate}
					selected={date}
				/>
			</PopoverContent>
		</Popover>
	);
};
