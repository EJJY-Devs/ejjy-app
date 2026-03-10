interface TrialBalanceDetailForPrint {
	accountName: string;
	debitAmount: string;
	creditAmount: string;
}

interface TrialBalanceEntryForPrint {
	referenceNumber: string;
	snapshotDate: string;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	entries: TrialBalanceDetailForPrint[];
}

const escapeHtml = (value: string) =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

export const printTrialBalance = ({
	entry,
}: {
	entry: TrialBalanceEntryForPrint | null;
}) => {
	if (!entry) {
		return '';
	}

	const rowsHtml = (entry.entries || [])
		.map(
			(detail) => `
			<tr class="${detail.accountName === 'BALANCES' ? 'balances-row' : ''}">
				<td>${escapeHtml(detail.accountName || '-')}</td>
				<td>${escapeHtml(detail.debitAmount || '')}</td>
				<td>${escapeHtml(detail.creditAmount || '')}</td>
			</tr>
		`,
		)
		.join('');

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Trial Balance</title>
			<style>
				body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
				.header { margin-bottom: 14px; line-height: 1.35; font-size: 16px; text-align: center; }
				.title { text-align: center; margin-bottom: 14px; }
				.title h1 { margin: 0; font-size: 24px; }
				.title h2 { margin: 4px 0 0; font-size: 20px; font-weight: 600; }
				.table-wrap { width: 780px; max-width: 100%; margin: 0 auto 16px; }
				table { width: 100%; border-collapse: collapse; }
				th, td { border: 1px solid #d9d9d9; padding: 8px 10px; text-align: left; font-size: 14px; }
				th { background: #fafafa; font-weight: 700; }
				td:nth-child(2), td:nth-child(3), th:nth-child(2), th:nth-child(3) { text-align: right; }
				.balances-row td { font-weight: 700; }
			</style>
		</head>
		<body>
			<div class="header">
				<div>${escapeHtml(entry.storeName || '-')}</div>
				<div>${escapeHtml(entry.storeAddress || '-')}</div>
				<div>${escapeHtml(entry.branchName || '-')}</div>
				<div>${escapeHtml(entry.storeTin || '-')}</div>
			</div>
			<div class="title">
				<h1>TRIAL BALANCE</h1>
				<h2>AS OF ${escapeHtml(entry.snapshotDate || '-')}</h2>
			</div>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Account</th>
							<th>Debit</th>
							<th>Credit</th>
						</tr>
					</thead>
					<tbody>
						${rowsHtml}
					</tbody>
				</table>
			</div>
		</body>
		</html>
	`;
};
