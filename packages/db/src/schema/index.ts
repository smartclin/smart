export * from "./auth";
// export your others here
export * from "./clinic";
export * from "./enums";
export * from "./template";
export * from "./types";

import * as auth from "./auth";
import * as clinic from "./clinic";
import { templates } from "./template";
export const schema = {
	...auth,
	...clinic,
	...templates,
};
