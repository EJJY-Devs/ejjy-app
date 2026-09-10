// TODO: Remove once already implemented in backend
export const getComputedDiscount = (transactionData) => {
	return transactionData.discount_option.is_special_discount
		? Number(transactionData.overall_discount) -
				Number(transactionData.invoice.vat_amount)
		: transactionData.overall_discount;
};

// Same 12%-inclusive VAT formula used elsewhere in this codebase
// (`gross / 1.12`, `gross - gross / 1.12`) — see accounting/views.py's
// CashDisbursementsViewSet for the backend equivalent.
const VAT_RATE = 1.12;

export interface VatBreakdownLine {
	amount: number;
	isVatExempt: boolean;
}

export interface VatBreakdown {
	vatExempt: number;
	vatableSales: number;
	vatAmount: number;
}

export const computeVatBreakdown = (
	lines: VatBreakdownLine[],
): VatBreakdown => {
	const vatExempt = lines
		.filter((line) => line.isVatExempt)
		.reduce((total, line) => total + Number(line.amount || 0), 0);

	const vatableGross = lines
		.filter((line) => !line.isVatExempt)
		.reduce((total, line) => total + Number(line.amount || 0), 0);

	const vatableSales = vatableGross / VAT_RATE;
	const vatAmount = vatableGross - vatableSales;

	return { vatExempt, vatableSales, vatAmount };
};
