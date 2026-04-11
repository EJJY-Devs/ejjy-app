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

interface SummaryForPrint {
	label: string;
	value: string;
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
	summary,
}: {
	entry: GeneralLedgerEntryForPrint | null;
	summary: SummaryForPrint;
}) => {
	if (!entry) {
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
	const summaryText = `${summary.label} - ${summary.value}`;

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>View - T Accounts</title>
			<style>
				body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
				h1 { margin: 0 0 24px; font-size: 22px; }
				h2 { margin: 0 0 18px; text-align: center; font-size: 36px; }
				table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
				th, td { border: 1px solid #d9d9d9; padding: 10px 12px; text-align: left; }
				th { background: #fafafa; }
				.summary { text-align: center; font-size: 44px; font-weight: 700; margin-top: 18px; }
			</style>
		</head>
		<body>
			<h1>View - T Accounts</h1>
			<h2>${escapeHtml(accountTitle)}</h2>
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
			</table>
			<div class="summary">${escapeHtml(summaryText)}</div>
		</body>
		</html>
	`;
};
