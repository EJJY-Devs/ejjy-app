interface GeneralLedgerDetailForPrint {
	debitDate: string;
	debitAmount: string;
	debitRefNum: string;
	creditDate: string;
	creditAmount: string;
	creditRefNum: string;
}

interface GeneralLedgerEntryForPrint {
	accountCode: number;
	accountName: string;
	entries: GeneralLedgerDetailForPrint[];
}

interface BalanceForPrint {
	label: string;
	value: string;
	asOf: string;
}

interface BalancesForPrint {
	beginning: BalanceForPrint;
	ending: BalanceForPrint;
	totalDebit: string;
	totalCredit: string;
}

const escapeHtml = (value: string) =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

export const printGeneralLedgerTAccounts = ({
	entry,
	balances,
}: {
	entry: GeneralLedgerEntryForPrint | null;
	balances: BalancesForPrint | null;
}) => {
	if (!entry || !balances) {
		return '';
	}

	const rowsHtml = (entry.entries || [])
		.map(
			(detail) => `
			<tr>
				<td>${escapeHtml(detail.debitDate || '')}</td>
				<td>${escapeHtml(detail.debitAmount || '')}</td>
				<td>${escapeHtml(detail.debitRefNum || '')}</td>
				<td></td>
				<td>${escapeHtml(detail.creditDate || '')}</td>
				<td>${escapeHtml(detail.creditAmount || '')}</td>
				<td>${escapeHtml(detail.creditRefNum || '')}</td>
			</tr>
		`,
		)
		.join('');

	const accountTitle = `${
		entry.accountCode
	} - ${entry.accountName.toUpperCase()}`;
	const beginningText = `Beginning Balance (as of ${balances.beginning.asOf}): ${balances.beginning.label} - ${balances.beginning.value}`;
	const endingLabelText = `Ending Balance (as of ${balances.ending.asOf})`;
	const endingText = `${balances.ending.label} - ${balances.ending.value}`;

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>View - T Accounts</title>
			<style>
				body { font-family: Arial, sans-serif; padding: 0; color: #222; }
				h1 { margin: 0 0 10px; font-size: 16px; }
				h2 { margin: 0 0 12px; text-align: center; font-size: 15px; }
				table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
				th, td { border: 1px solid #d9d9d9; padding: 5px 6px; text-align: left; font-size: 10px; }
				th { background: #fafafa; font-weight: 700; }
				tfoot td { font-weight: 700; background: #fafafa; }
				.beginning { font-size: 11px; font-weight: 700; margin-bottom: 8px; }
				.summary-label { text-align: center; font-size: 11px; margin-top: 12px; }
				.summary { text-align: center; font-size: 15px; font-weight: 700; margin-top: 4px; }
			</style>
		</head>
		<body>
			<h1>View - T Accounts</h1>
			<h2>${escapeHtml(accountTitle)}</h2>
			<div class="beginning">${escapeHtml(beginningText)}</div>
			<table>
				<thead>
					<tr>
						<th>Datetime</th>
						<th>Debit Amount</th>
						<th>Reference Number</th>
						<th></th>
						<th>Datetime</th>
						<th>Credit Amount</th>
						<th>Reference Number</th>
					</tr>
				</thead>
				<tbody>
					${rowsHtml}
				</tbody>
				<tfoot>
					<tr>
						<td>Total</td>
						<td>${escapeHtml(balances.totalDebit)}</td>
						<td></td>
						<td></td>
						<td>Total</td>
						<td>${escapeHtml(balances.totalCredit)}</td>
						<td></td>
					</tr>
				</tfoot>
			</table>
			<div class="summary-label">${escapeHtml(endingLabelText)}</div>
			<div class="summary">${escapeHtml(endingText)}</div>
		</body>
		</html>
	`;
};
