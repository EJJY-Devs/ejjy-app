import { EMPTY_CELL, getFullName } from 'ejjy-global';
import dayjs from 'dayjs';
import React from 'react';
import { formatQuantity } from 'utils';
import { ReceiptHeaderV2 } from './ReceiptHeaderV2';

interface Props {
	receivingReport: any;
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

export const ReceivingReportDocument = ({ receivingReport }: Props) => {
	const products = receivingReport?.receiving_voucher_products || [];

	return (
		<div style={{ fontSize: '12px', lineHeight: '1.2' }}>
			<div style={{ textAlign: 'center' }}>
				<ReceiptHeaderV2
					branchHeader={receivingReport?.branch}
					title="RECEIVING REPORT"
				/>
			</div>

			<br />

			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<tbody>
					<tr>
						<td style={rowStyle}>Reference #:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{receivingReport?.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Vendor:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{receivingReport?.supplier_name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Customer:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{receivingReport?.branch?.name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Encoder:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{getFullName(receivingReport?.encoded_by) || EMPTY_CELL}
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
						<th style={{ ...headerCellStyle, textAlign: 'left' }}>
							Product Name
						</th>
						<th style={{ ...headerCellStyle, textAlign: 'center' }}>
							Quantity
						</th>
					</tr>
				</thead>
				<tbody>
					{products.map((item: any) => (
						<tr key={item.id}>
							<td style={cellStyle}>{item.product?.name}</td>
							<td style={{ ...cellStyle, textAlign: 'center' }}>
								{formatQuantity({
									unitOfMeasurement: item.product?.unit_of_measurement,
									quantity: item.quantity,
								})}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<div style={{ textAlign: 'center', marginTop: '12px' }}>
				Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}
			</div>

			<div style={{ textAlign: 'center' }}>
				Remarks: {receivingReport?.overall_remarks || 'N/A'}
			</div>
		</div>
	);
};
