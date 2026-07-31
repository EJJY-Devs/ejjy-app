import { EMPTY_CELL, getFullName } from 'ejjy-global';
import React from 'react';
import { formatDateTime, formatInPeso } from 'utils';
import { ReceiptHeaderV2 } from './ReceiptHeaderV2';

interface Props {
	purchase: any;
}

const rowStyle: React.CSSProperties = {
	borderBottom: '1px solid #000',
	padding: '4px 0',
};

export const PurchaseVoucherDocument = ({ purchase }: Props) => {
	const products = purchase?.purchase_products || [];

	return (
		<div style={{ fontSize: '12px', lineHeight: '1.4' }}>
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
					<tr style={{ borderBottom: '1px solid #000' }}>
						<th style={{ textAlign: 'left', padding: '4px 2px' }}>Qty</th>
						<th style={{ textAlign: 'left', padding: '4px 2px' }}>
							Description
						</th>
						<th style={{ textAlign: 'right', padding: '4px 2px' }}>Price</th>
						<th style={{ textAlign: 'right', padding: '4px 2px' }}>Total</th>
					</tr>
				</thead>
				<tbody>
					{products.map((item: any) => (
						<tr key={item.id}>
							<td style={{ padding: '4px 2px' }}>{item.quantity}</td>
							<td style={{ padding: '4px 2px' }}>{item.product?.name}</td>
							<td style={{ padding: '4px 2px', textAlign: 'right' }}>
								{formatInPeso(item.cost_per_piece)}
							</td>
							<td style={{ padding: '4px 2px', textAlign: 'right' }}>
								{formatInPeso(
									Number(item.quantity) * Number(item.cost_per_piece),
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<hr />

			<table style={{ width: '100%' }}>
				<tbody>
					<tr>
						<td />
						<td style={{ textAlign: 'right', fontWeight: 'bold' }}>
							Total: {formatInPeso(purchase?.total_amount)}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};
