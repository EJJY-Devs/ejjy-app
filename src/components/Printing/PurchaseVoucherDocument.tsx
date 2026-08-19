import { EMPTY_CELL, getFullName } from 'ejjy-global';
import React from 'react';
import { formatDateTime, formatInPeso } from 'utils';
import { ReceiptHeaderV2 } from './ReceiptHeaderV2';

interface Props {
	purchase: any;
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

export const PurchaseVoucherDocument = ({ purchase }: Props) => {
	const products = purchase?.purchase_products || [];

	return (
		<div style={{ fontSize: '12px', lineHeight: '1.2' }}>
			<div style={{ textAlign: 'center' }}>
				<ReceiptHeaderV2
					branchHeader={purchase?.branch}
					branchName={purchase?.branch?.name}
					title="PURCHASE VOUCHER"
				/>
			</div>

			<br />

			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<tbody>
					<tr>
						<td style={rowStyle}>Voucher No.:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{purchase?.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Date:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{formatDateTime(purchase?.datetime_created)}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>To:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{purchase?.supplier_name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Check No.:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>{EMPTY_CELL}</td>
					</tr>
					{purchase?.authorizer && (
						<tr>
							<td style={rowStyle}>Authorizer:</td>
							<td style={{ ...rowStyle, textAlign: 'right' }}>
								{getFullName(purchase.authorizer)}
							</td>
						</tr>
					)}
					{purchase?.purchase_order?.reference_number && (
						<tr>
							<td style={rowStyle}>PO #:</td>
							<td style={{ ...rowStyle, textAlign: 'right' }}>
								{purchase.purchase_order.reference_number}
							</td>
						</tr>
					)}
					<tr>
						<td style={rowStyle}>Type:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{purchase?.payment_type === 'on_account' ? 'On Account' : 'Pay'}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Remarks:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{purchase?.overall_remarks || 'N/A'}
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
						<th style={{ ...headerCellStyle, textAlign: 'center' }}>
							Quantity
						</th>
						<th style={{ ...headerCellStyle, textAlign: 'left' }}>
							Description
						</th>
						<th style={{ ...headerCellStyle, textAlign: 'right' }}>
							Unit Price
						</th>
						<th style={{ ...headerCellStyle, textAlign: 'right' }}>Total</th>
					</tr>
				</thead>
				<tbody>
					{products.map((item: any) => (
						<tr key={item.id}>
							<td style={{ ...cellStyle, textAlign: 'center' }}>
								{item.quantity}
							</td>
							<td style={cellStyle}>{item.product?.name}</td>
							<td style={{ ...cellStyle, textAlign: 'right' }}>
								{formatInPeso(item.cost_per_piece, 'P')}
							</td>
							<td style={{ ...cellStyle, textAlign: 'right' }}>
								{formatInPeso(
									Number(item.quantity) * Number(item.cost_per_piece),
									'P',
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div
				style={{ textAlign: 'center', marginTop: '12px', fontWeight: 'bold' }}
			>
				Total Amount: {formatInPeso(purchase?.total_amount, 'P')}
			</div>
		</div>
	);
};
