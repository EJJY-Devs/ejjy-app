import dayjs from 'dayjs';
import { EMPTY_CELL, getFullName, printingTypes } from 'ejjy-global';
import {
	appendHtmlElement,
	getPageStyleObject,
	print,
} from 'ejjy-global/dist/print/helper-receipt';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { ReceiptHeaderV2 } from 'components/Printing';
import { formatDateTime, formatInPeso } from 'utils';

interface PrintPurchaseProps {
	purchase: any;
	siteSettings?: any;
	isPdf?: boolean;
}

export const printPurchase = ({
	purchase,
	isPdf = false,
}: PrintPurchaseProps): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.5' })}
		>
			<div style={{ textAlign: 'center' }}>
				<ReceiptHeaderV2
					branchHeader={purchase.branch}
					branchName={purchase.branch?.name}
					title="PURCHASES"
				/>
			</div>
			<br />
			<table style={{ width: '100%', fontSize: '12px', lineHeight: '1' }}>
				<tbody>
					<tr>
						<td>Reference #:</td>
						<td style={{ textAlign: 'right' }}>
							{purchase.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Supplier:</td>
						<td style={{ textAlign: 'right' }}>
							{purchase.supplier_name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Authorizer:</td>
						<td style={{ textAlign: 'right' }}>
							{purchase.authorizer
								? `${purchase.authorizer.first_name} ${purchase.authorizer.last_name}`
								: EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Date:</td>
						<td style={{ textAlign: 'right' }}>
							{formatDateTime(purchase.datetime_created)}
						</td>
					</tr>
				</tbody>
			</table>
			<hr />
			<table
				style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}
			>
				<thead>
					<tr
						style={{
							borderBottom: '1px solid black',
							paddingBottom: '4px',
						}}
					>
						<th style={{ textAlign: 'left', paddingBottom: '4px' }}>Product</th>
						<th style={{ textAlign: 'right', paddingBottom: '4px' }}>Qty</th>
						<th style={{ textAlign: 'right', paddingBottom: '4px' }}>Cost</th>
						<th style={{ textAlign: 'right', paddingBottom: '4px' }}>Amount</th>
					</tr>
				</thead>
				<tbody>
					{purchase.purchase_products?.map((item: any) => (
						<tr key={item.id}>
							<td>{item.product?.name}</td>
							<td style={{ textAlign: 'right' }}>{item.quantity}</td>
							<td style={{ textAlign: 'right' }}>
								{formatInPeso(item.cost_per_piece)}
							</td>
							<td style={{ textAlign: 'right' }}>
								{formatInPeso(
									Number(item.quantity) * Number(item.cost_per_piece),
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<hr />
			<table style={{ width: '100%', fontSize: '12px' }}>
				<tbody>
					<tr>
						<td />
						<td style={{ textAlign: 'right', fontWeight: 'bold' }}>
							Total: {formatInPeso(purchase.total_amount)}
						</td>
					</tr>
				</tbody>
			</table>
			<br />
			<div style={{ textAlign: 'center' }}>
				<div>Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}</div>
			</div>
			{purchase.overall_remarks && (
				<div style={{ textAlign: 'center', marginTop: '8px' }}>
					<div>Remarks: {purchase.overall_remarks}</div>
				</div>
			)}
		</div>,
	);

	if (isPdf) {
		return appendHtmlElement(data);
	}

	print(appendHtmlElement(data), 'Purchase', undefined, printingTypes.HTML);
	return data;
};

export const printPurchaseForSupplier = ({
	purchase,
	isPdf = false,
}: PrintPurchaseProps): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.5' })}
		>
			<div style={{ textAlign: 'center' }}>
				<ReceiptHeaderV2
					branchHeader={purchase.branch}
					branchName={purchase.branch?.name}
					title="PURCHASE ORDER"
				/>
				<br />
				<strong>PURCHASE ORDER</strong>
				<br />
				<br />
				<div>Datetime Requested:</div>
				<div>{formatDateTime(purchase.datetime_created)}</div>
				<br />
			</div>
			<table style={{ width: '100%', fontSize: '12px', lineHeight: '1' }}>
				<tbody>
					<tr>
						<td>Reference #:</td>
						<td style={{ textAlign: 'right' }}>
							{purchase.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Vendor:</td>
						<td style={{ textAlign: 'right' }}>
							{purchase.supplier_name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Customer:</td>
						<td style={{ textAlign: 'right' }}>
							{purchase.branch?.name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td>Encoder:</td>
						<td style={{ textAlign: 'right' }}>
							{getFullName(purchase.authorizer) || EMPTY_CELL}
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
					{purchase.purchase_products?.map((item: any) => (
						<tr key={item.id}>
							<td>{item.product?.name}</td>
							<td style={{ textAlign: 'center' }}>{item.quantity}</td>
							<td style={{ textAlign: 'center' }}>
								{item.product?.unit_of_measurement || EMPTY_CELL}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<br />
			<div style={{ textAlign: 'center' }}>
				<div>Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}</div>
			</div>
			{purchase.overall_remarks && (
				<div style={{ textAlign: 'center', marginTop: '8px' }}>
					<div>Remarks: {purchase.overall_remarks}</div>
				</div>
			)}
		</div>,
	);

	if (isPdf) {
		return appendHtmlElement(data);
	}

	print(appendHtmlElement(data), 'Purchase', undefined, printingTypes.HTML);
	return data;
};
