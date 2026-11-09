// Small ESC/POS text-layout helpers for reports that don't have a matching
// native template in ejjy-global (see helper-escpos.js there for the ones
// that do: generateThreeColumnLine, generateItemBlockCommands, printCenter,
// generateReceiptHeaderCommandsV2). These follow the same 40-character
// paper width and padding conventions so native receipts stay visually
// consistent across the app.
const PAPER_CHARACTER_WIDTH = 40;

export const DASHED_DIVIDER = '-'.repeat(PAPER_CHARACTER_WIDTH);

export const generateTwoColumnLine = (
	leftText: string,
	rightText: string,
): string => {
	const rightWidth = Math.max(rightText.length, 6);
	const leftWidth = PAPER_CHARACTER_WIDTH - rightWidth - 1;

	const truncatedLeft =
		leftText.length > leftWidth
			? leftText.substring(0, leftWidth - 1)
			: leftText;

	return `${truncatedLeft.padEnd(leftWidth)} ${rightText.padStart(rightWidth)}`;
};
