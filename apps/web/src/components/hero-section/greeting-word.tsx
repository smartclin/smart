// Third-party Imports
import { AnimatePresence, motion } from "motion/react";
// React Imports
import { useEffect, useState } from "react";

// const GREETINGS = ["Hello", "مرحباً", "Bonjour", "Guten Tag"];
const GREETINGS = [
	{ word: "Hello", className: "text-teal-600" },
	{ word: "مرحباً", className: "text-amber-600" },
	{ word: "Bonjour", className: "text-rose-600" },
	{ word: "Guten Tag", className: "text-violet-600" },
] as const;

const INTERVAL_MS = 2200;

const GreetingWord = () => {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setIndex((prev) => (prev + 1) % GREETINGS.length);
		}, INTERVAL_MS);
		return () => clearInterval(timer);
	}, []);
	const current = GREETINGS[index];

	return (
		<span className="mr-2 inline-grid overflow-hidden align-bottom">
			{/* Invisible sizers reserve space for the widest greeting so surrounding text doesn't shift */}
			{GREETINGS.map((g) => (
				<span
					aria-hidden="true"
					className="invisible col-start-1 row-start-1 whitespace-nowrap"
					key={g.word}
				>
					{g.word}
				</span>
			))}

			<AnimatePresence
				initial={false}
				mode="popLayout"
			>
				<motion.span
					animate={{ y: "0%", opacity: 1 }}
					className={`${current?.className} col-start-1 row-start-1 whitespace-nowrap`}
					exit={{ y: -8, opacity: 0 }}
					initial={{ y: 8, opacity: 0 }}
					key={current?.word}
					transition={{ duration: 0.5, ease: "easeInOut" }}
				>
					{current?.word}
				</motion.span>
			</AnimatePresence>
		</span>
	);
};

export default GreetingWord;
