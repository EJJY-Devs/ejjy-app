import { EMPTY_CELL, getFullName } from 'ejjy-global';
import React from 'react';
import { formatDateTime, formatQuantity } from 'utils';
import { ReceiptHeaderV2 } from './ReceiptHeaderV2';

interface Props {
	requisitionSlip: any;
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

export const RequisitionSlipDocument = ({ requisitionSlip }: Props) => {
	const products = requisitionSlip?.products || [];
	const isSupplier = requisitionSlip?.vendor_type === 'supplier';
	const vendorLabel = isSupplier ? 'Supplier:' : 'Vendor:';
	const vendorName = isSupplier
		? requisitionSlip?.supplier?.name
		: requisitionSlip?.vendor?.name;

	return (
		<div style={{ fontSize: '12px', lineHeight: '1.2' }}>
			<div style={{ textAlign: 'center' }}>
				<ReceiptHeaderV2
					branchHeader={requisitionSlip?.branch}
					branchName={requisitionSlip?.branch?.name}
					title="REQUISITION SLIP"
				/>
			</div>

			<br />

			<div style={{ textAlign: 'center' }}>
				<div>Datetime Requested:</div>
				<div>{formatDateTime(requisitionSlip?.datetime_created)}</div>
			</div>

			<br />

			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<tbody>
					<tr>
						<td style={rowStyle}>Reference #:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{requisitionSlip?.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>{vendorLabel}</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{vendorName || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Customer:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{requisitionSlip?.branch?.name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={rowStyle}>Authorizer:</td>
						<td style={{ ...rowStyle, textAlign: 'right' }}>
							{getFullName(requisitionSlip?.authorizer) || EMPTY_CELL}
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
						<th style={{ ...headerCellStyle, textAlign: 'center' }}>Unit</th>
					</tr>
				</thead>
				<tbody>
					{products.map(({ quantity, product, unit }: any) => (
						<tr key={product?.id}>
							<td style={cellStyle}>{product?.name}</td>
							<td style={{ ...cellStyle, textAlign: 'center' }}>
								{formatQuantity({
									unitOfMeasurement: product?.unit_of_measurement,
									quantity,
								})}
							</td>
							<td style={{ ...cellStyle, textAlign: 'center' }}>
								{unit || EMPTY_CELL}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
