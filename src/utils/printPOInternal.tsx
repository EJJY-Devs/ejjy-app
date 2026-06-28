import dayjs from 'dayjs';
import { EMPTY_CELL, getFullName, printingTypes } from 'ejjy-global';
import {
	appendHtmlElement,
	getPageStyleObject,
	print,
} from 'ejjy-global/dist/print/helper-receipt';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { formatDateTime, formatQuantity } from 'utils';

interface PrintPOInternalProps {
	requisitionSlip: any;
	siteSettings?: any;
	isPdf?: boolean;
}

export const printPOInternal = ({
	requisitionSlip,
	siteSettings,
	isPdf = false,
}: PrintPOInternalProps): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.5' })}
		>
			<div style={{ textAlign: 'center' }}>
				<div>
					{requisitionSlip.branch?.store_name || siteSettings?.store_name}
				</div>
				<div>
					{requisitionSlip.branch?.store_address || siteSettings?.address}
				</div>
				<div>{requisitionSlip.branch?.name}</div>
				<div>{requisitionSlip.branch?.tin || siteSettings?.tin}</div>
				<br />
				<strong>PURCHASE ORDER</strong>
			</div>
			<br />
			<table style={{ width: '100%', fontSize: '12px', lineHeight: '1' }}>
				<tbody>
					<tr>
						<td>Reference #:</td>
						<td style={{ textAlign: 'right' }}>
							{requisitionSlip.po_reference_number ||
								requisitionSlip.reference_number ||
								EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Supplier:</td>
						<td style={{ textAlign: 'right' }}>
							{requisitionSlip.vendor?.name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Authorizer:</td>
						<td style={{ textAlign: 'right' }}>
							{getFullName(requisitionSlip.authorizer) || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Date:</td>
						<td style={{ textAlign: 'right' }}>
							{formatDateTime(requisitionSlip.datetime_created)}
						</td>
					</tr>
					{requisitionSlip.overall_remarks && (
						<tr>
							<td>Remarks:</td>
							<td style={{ textAlign: 'right' }}>
								{requisitionSlip.overall_remarks}
							</td>
						</tr>
					)}
				</tbody>
			</table>
			<hr />
			<table
				style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}
			>
				<thead>
					<tr style={{ borderBottom: '1px solid black', paddingBottom: '4px' }}>
						<th style={{ textAlign: 'left', paddingBottom: '4px' }}>Product</th>
						<th style={{ textAlign: 'center', paddingBottom: '4px' }}>Qty</th>
						<th style={{ textAlign: 'center', paddingBottom: '4px' }}>Unit</th>
					</tr>
				</thead>
				<tbody>
					{(requisitionSlip.products || []).map((item: any) => (
						<tr key={item.product?.id}>
							<td>{item.product?.name}</td>
							<td style={{ textAlign: 'center' }}>
								{formatQuantity({
									unitOfMeasurement: item.product?.unit_of_measurement,
									quantity: item.quantity,
								})}
							</td>
							<td style={{ textAlign: 'center' }}>
								{item.unit || item.product?.unit_of_measurement || EMPTY_CELL}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<br />
			<div style={{ textAlign: 'center' }}>
				<div>Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}</div>
			</div>
		</div>,
	);

	if (isPdf) {
		return appendHtmlElement(data);
	}

	print(
		appendHtmlElement(data),
		'Purchase Order',
		undefined,
		printingTypes.HTML,
	);
	return data;
};
