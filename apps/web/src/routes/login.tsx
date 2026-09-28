import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [showSignIn, setShowSignIn] = useState(false);

	const handleShowSignUp = useCallback(() => {
		setShowSignIn(false);
	}, []);

	const handleShowSignIn = useCallback(() => {
		setShowSignIn(true);
	}, []);

	return showSignIn ? (
		<SignInForm onSwitchToSignUp={handleShowSignUp} />
	) : (
		<SignUpForm onSwitchToSignIn={handleShowSignIn} />
	);
}
