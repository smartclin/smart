// packages/api/src/context.ts
import type { Session, User } from "@smart/auth";
import type { Database } from "@smart/db";

export type Context = {
	session: Session | null;
	db: Database;
	request: Request;
	user: User | null;
	clinicId?: string;
};
