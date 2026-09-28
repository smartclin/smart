import type * as z from "zod";
import type { Dependency, EnumValues } from "./types";
import { DEPENDENCY_TYPE } from "./types";

export default function resolveDependencies<
	SchemaType extends z.infer<z.ZodObject<any, any>>,
>(
	dependencies: Dependency<SchemaType>[],
	currentFieldName: keyof SchemaType,
	watch: (name?: string) => unknown
) {
	let isDisabled = false;
	let isHidden = false;
	let isRequired = false;
	let overrideOptions: EnumValues | undefined;

	const currentFieldValue = watch(currentFieldName as string);

	const currentFieldDependencies = dependencies.filter(
		(dependency) => dependency.targetField === currentFieldName
	);
	for (const dependency of currentFieldDependencies) {
		const watchedValue = watch(dependency.sourceField as string);

		const conditionMet = dependency.when(watchedValue, currentFieldValue);

		switch (dependency.type) {
			case DEPENDENCY_TYPE.DISABLES:
				if (conditionMet) {
					isDisabled = true;
				}
				break;
			case DEPENDENCY_TYPE.REQUIRES:
				if (conditionMet) {
					isRequired = true;
				}
				break;
			case DEPENDENCY_TYPE.HIDES:
				if (conditionMet) {
					isHidden = true;
				}
				break;
			case DEPENDENCY_TYPE.SETS_OPTIONS:
				if (conditionMet) {
					overrideOptions = dependency.options;
				}
				break;
			default:
				break;
		}
	}

	return {
		isDisabled,
		isHidden,
		isRequired,
		overrideOptions,
	};
}
