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

interface PrintPurchaseOrderProps {
	purchaseOrder: any;
	isPdf?: boolean;
}

export const printPurchaseOrder = ({
	purchaseOrder,
	isPdf = false,
}: PrintPurchaseOrderProps): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.5' })}
		>
			<div style={{ textAlign: 'center' }}>
				<div>{purchaseOrder.branch?.store_name}</div>
				<div>{purchaseOrder.branch?.store_address}</div>
				<div>{purchaseOrder.branch?.name}</div>
				<div>{purchaseOrder.branch?.tin}</div>
				<br />
				<strong>PURCHASE ORDER</strong>
			</div>
			<br />
			<table style={{ width: '100%', fontSize: '12px', lineHeight: '1' }}>
				<tbody>
					<tr>
						<td>Reference #:</td>
						<td style={{ textAlign: 'right' }}>
							{purchaseOrder.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Supplier:</td>
						<td style={{ textAlign: 'right' }}>
							{purchaseOrder.supplier_name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Authorizer:</td>
						<td style={{ textAlign: 'right' }}>
							{getFullName(purchaseOrder.authorizer) || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Date:</td>
						<td style={{ textAlign: 'right' }}>
							{formatDateTime(purchaseOrder.datetime_created)}
						</td>
					</tr>
					{purchaseOrder.overall_remarks && (
						<tr>
							<td>Remarks:</td>
							<td style={{ textAlign: 'right' }}>
								{purchaseOrder.overall_remarks}
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
					</tr>
				</thead>
				<tbody>
					{purchaseOrder.purchase_order_products?.map((item: any) => (
						<tr key={item.id}>
							<td>{item.product?.name}</td>
							<td style={{ textAlign: 'center' }}>
								{formatQuantity({
									unitOfMeasurement: item.product?.unit_of_measurement,
									quantity: item.quantity,
								})}
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

export const printPurchaseOrderForSupplier = ({
	purchaseOrder,
	isPdf = false,
}: PrintPurchaseOrderProps): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.5' })}
		>
			<div style={{ textAlign: 'center' }}>
				<div>{purchaseOrder.branch?.store_name}</div>
				<div>{purchaseOrder.branch?.store_address}</div>
				<div>{purchaseOrder.branch?.name}</div>
				<div>{purchaseOrder.branch?.tin}</div>
				<br />
				<strong>PURCHASE ORDER</strong>
				<br />
				<br />
				<div>Datetime Requested:</div>
				<div>{formatDateTime(purchaseOrder.datetime_created)}</div>
				<br />
			</div>
			<table style={{ width: '100%', fontSize: '12px', lineHeight: '1' }}>
				<tbody>
					<tr>
						<td>Reference #:</td>
						<td style={{ textAlign: 'right' }}>
							{purchaseOrder.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Vendor:</td>
						<td style={{ textAlign: 'right' }}>
							{purchaseOrder.supplier_name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Customer:</td>
						<td style={{ textAlign: 'right' }}>
							{purchaseOrder.branch?.name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Encoder:</td>
						<td style={{ textAlign: 'right' }}>
							{getFullName(purchaseOrder.authorizer) || EMPTY_CELL}
						</td>
					</tr>
				</tbody>
			</table>
			<br />
			<table
				style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}
			>
				<thead>
					<tr style={{ borderBottom: '1px solid black', paddingBottom: '4px' }}>
						<th style={{ textAlign: 'left', paddingBottom: '4px' }}>
							Product Name
						</th>
						<th style={{ textAlign: 'center', paddingBottom: '4px' }}>
							Quantity
						</th>
						<th style={{ textAlign: 'center', paddingBottom: '4px' }}>Unit</th>
					</tr>
				</thead>
				<tbody>
					{purchaseOrder.purchase_order_products?.map((item: any) => (
						<tr key={item.id}>
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
			{purchaseOrder.overall_remarks && (
				<div style={{ textAlign: 'center', marginTop: '8px' }}>
					<div>Remarks: {purchaseOrder.overall_remarks}</div>
				</div>
			)}
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
