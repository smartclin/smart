import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@smart/ui/components/dropdown-menu";
import type { ReactElement } from "react";
import { useState } from "react";

type Props = {
	trigger: ReactElement;
	defaultOpen?: boolean;
	align?: "start" | "center" | "end";
};

const LanguageDropdown = ({ defaultOpen, align, trigger }: Props) => {
	const [language, setLanguage] = useState("english");

	return (
		<DropdownMenu defaultOpen={defaultOpen}>
			{/*
			 * `render` tells Base UI to merge the trigger's props into the
			 * element you pass, instead of rendering its own <button> and
			 * nesting yours inside. Fixes the "button cannot be a descendant
			 * of button" hydration error.
			 */}
			<DropdownMenuTrigger render={trigger} />
			<DropdownMenuContent
				align={align || "end"}
				className="w-50"
			>
				<DropdownMenuRadioGroup
					onValueChange={setLanguage}
					value={language}
				>
					<DropdownMenuRadioItem value="english">
						English
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="german">
						Deutsch
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="spanish">
						Española
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="portuguese">
						Português
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="korean">
						한국인
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LanguageDropdown;
