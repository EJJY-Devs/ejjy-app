import { EMPTY_CELL, getFullName } from 'ejjy-global';
import React from 'react';
import { computeVatBreakdown, formatDateTime, formatInPeso } from 'utils';
import { ReceiptHeaderV2 } from './ReceiptHeaderV2';

interface Props {
	expenseVoucher: any;
	branch?: any;
}

const rowStyle: React.CSSProperties = {
	padding: '1px 0',
};

const cellStyle: React.CSSProperties = {
	border: '1px solid #999',
	padding: '4px 8px',
};

const headerCellStyle: React.CSSProperties = {
	...cellStyle,
	background: '#f5f5f5',
	fontWeight: 'bold',
};

export const ExpenseVoucherDocument = ({ expenseVoucher, branch }: Props) => {
	const particulars = expenseVoucher?.particulars || [];

	const { vatExempt, vatableSales, vatAmount } = computeVatBreakdown(
		particulars.map((item: any) => ({
			amount: Number(item.amount),
			isVatExempt: item.type === 'VE',
		})),
	);

	return (
		<div style={{ fontSize: '12px', lineHeight: '1.2' }}>
			<div style={{ textAlign: 'center' }}>
				<ReceiptHeaderV2 branchHeader={branch} title="EXPENSE VOUCHER" />
			</div>

			<br />

			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<tbody>
					<tr>
						<td style={rowStyle}>Voucher No.:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{expenseVoucher?.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Date:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{formatDateTime(expenseVoucher?.datetime_created)}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Payee:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{expenseVoucher?.payee || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Invoice #:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{expenseVoucher?.invoice_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Type:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{expenseVoucher?.payment_type === 'on_account'
								? 'On Account'
								: 'Pay'}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Authorizer:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{expenseVoucher?.authorizer
								? getFullName(expenseVoucher.authorizer)
								: EMPTY_CELL}
						</td>
					</tr>
				</tbody>
			</table>

			<br />

			<table
				style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}
			>
				<thead>
					<tr>
						<th
							style={{ ...headerCellStyle, textAlign: 'center', width: '70px' }}
						>
							Item #
						</th>
						<th style={{ ...headerCellStyle, textAlign: 'left' }}>
							Particulars
						</th>
						<th
							style={{ ...headerCellStyle, textAlign: 'center', width: '80px' }}
						>
							Type
						</th>
						<th style={{ ...headerCellStyle, textAlign: 'right' }}>Amount</th>
					</tr>
				</thead>
				<tbody>
					{particulars.map((item: any, index: number) => (
						// eslint-disable-next-line react/no-array-index-key
						<tr key={index}>
							<td style={{ ...cellStyle, textAlign: 'center' }}>{index + 1}</td>
							<td style={cellStyle}>{item.description}</td>
							<td style={{ ...cellStyle, textAlign: 'center' }}>
								{item.type === 'VE' ? 'VAT Exempt' : 'Vatable'}
							</td>
							<td style={{ ...cellStyle, textAlign: 'right' }}>
								{formatInPeso(item.amount, 'P')}
							</td>
						</tr>
					))}
					<tr>
						<td
							colSpan={3}
							style={{ ...cellStyle, textAlign: 'right', fontWeight: 'bold' }}
						>
							Total
						</td>
						<td
							style={{ ...cellStyle, textAlign: 'right', fontWeight: 'bold' }}
						>
							{formatInPeso(expenseVoucher?.amount, 'P')}
						</td>
					</tr>
				</tbody>
			</table>

			<div
				style={{ textAlign: 'center', marginTop: '12px', fontWeight: 'bold' }}
			>
				Total Amount: {formatInPeso(expenseVoucher?.amount, 'P')}
			</div>

			<div style={{ textAlign: 'center', marginTop: '4px' }}>
				<div>VAT Exempt: {formatInPeso(vatExempt, 'P')}</div>
				<div>VATable Sales: {formatInPeso(vatableSales, 'P')}</div>
				<div>VAT Amount: {formatInPeso(vatAmount, 'P')}</div>
			</div>
		</div>
	);
};
