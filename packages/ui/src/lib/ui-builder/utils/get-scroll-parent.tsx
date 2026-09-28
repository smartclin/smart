export function getScrollParent(
	element: HTMLElement | null
): HTMLElement | null {
	if (!element) return null;

	const overflowRegex = /(auto|scroll)/;

	let parent: HTMLElement | null = element.parentElement;

	while (parent) {
		const style = getComputedStyle(parent);

		const { overflowX, overflowY } = style;
		if (overflowRegex.test(overflowY) || overflowRegex.test(overflowX)) {
			return parent;
		}

		parent = parent.parentElement;
	}

	return null;
}
