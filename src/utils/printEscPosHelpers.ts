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

export const generateFourColumnLine = (
	col1Text: string,
	col2Text: string,
	col3Text: string,
	col4Text: string,
): string => {
	const col1Width = 8;
	const col3Width = 10;
	const col4Width = 10;
	const col2Width = PAPER_CHARACTER_WIDTH - col1Width - col3Width - col4Width;

	const truncatedCol2 =
		col2Text.length > col2Width
			? col2Text.substring(0, col2Width - 1)
			: col2Text;

	return (
		col1Text.padEnd(col1Width) +
		truncatedCol2.padEnd(col2Width) +
		col3Text.padStart(col3Width) +
		col4Text.padStart(col4Width)
	);
};
