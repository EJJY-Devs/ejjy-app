import dayjs from 'dayjs';
import {
	EMPTY_CELL,
	getAppReceiptPrintingType,
	getFullName,
	printingTypes,
} from 'ejjy-global';
import {
	generateItemBlockCommands,
	generateReceiptHeaderCommandsV2,
	generateThreeColumnLine,
	printCenter,
} from 'ejjy-global/dist/print/helper-escpos';
import {
	appendHtmlElement,
	getPageStyleObject,
	print,
} from 'ejjy-global/dist/print/helper-receipt';
import { EscPosCommands } from 'ejjy-global/dist/print/utils/escpos.enum';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { formatDateTime, formatQuantity } from 'utils';
import {
	DASHED_DIVIDER,
	generateTwoColumnLine,
} from 'utils/printEscPosHelpers';

interface PrintPurchaseOrderProps {
	purchaseOrder: any;
	isPdf?: boolean;
}

const renderHtml = ({ purchaseOrder }: PrintPurchaseOrderProps): string =>
	ReactDOM.renderToStaticMarkup(
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
			<table style={{ width: '100%', fontSize: '12px', lineHeight: '1.4' }}>
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
			<br />
			<table
				style={{
					width: '100%',
					fontSize: '12px',
					lineHeight: '1.4',
					borderCollapse: 'collapse',
				}}
			>
				<thead>
					<tr>
						<th
							style={{
								textAlign: 'left',
								borderBottom: '1px solid black',
								padding: '0 4px 4px 0',
							}}
						>
							Product
						</th>
						<th
							style={{
								textAlign: 'center',
								borderBottom: '1px solid black',
								padding: '0 0 4px 4px',
							}}
						>
							Qty
						</th>
					</tr>
				</thead>
				<tbody>
					{purchaseOrder.purchase_order_products?.map((item: any) => (
						<tr key={item.id}>
							<td style={{ padding: '2px 4px 2px 0' }}>{item.product?.name}</td>
							<td style={{ textAlign: 'center', padding: '2px 0 2px 4px' }}>
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

// Native (ESC/POS) renderer — see printPOInternal.tsx for why this report
// builds its own commands instead of delegating to ejjy-global.
const renderNative = ({ purchaseOrder }: PrintPurchaseOrderProps): string[] => {
	const branchHeader = {
		store_name: purchaseOrder.branch?.store_name,
		store_address: purchaseOrder.branch?.store_address,
		name: purchaseOrder.branch?.name,
		tin: purchaseOrder.branch?.tin,
	};

	const commands: string[] = [
		...generateReceiptHeaderCommandsV2({
			branchHeader,
			title: 'PURCHASE ORDER',
		}),
		EscPosCommands.LINE_BREAK,
		EscPosCommands.LINE_BREAK,
	];

	commands.push(
		...generateItemBlockCommands([
			{
				label: 'Reference #:',
				value: purchaseOrder.reference_number || EMPTY_CELL,
			},
			{ label: 'Supplier:', value: purchaseOrder.supplier_name || EMPTY_CELL },
			{
				label: 'Authorizer:',
				value: getFullName(purchaseOrder.authorizer) || EMPTY_CELL,
			},
			{ label: 'Date:', value: formatDateTime(purchaseOrder.datetime_created) },
		]),
	);

	if (purchaseOrder.overall_remarks) {
		commands.push(
			...generateItemBlockCommands([
				{ label: 'Remarks:', value: purchaseOrder.overall_remarks },
			]),
		);
	}

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(generateTwoColumnLine('Product', 'Qty'));
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(printCenter(DASHED_DIVIDER));
	commands.push(EscPosCommands.LINE_BREAK);

	(purchaseOrder.purchase_order_products || []).forEach((item: any) => {
		commands.push(
			generateTwoColumnLine(
				item.product?.name || '',
				formatQuantity({
					unitOfMeasurement: item.product?.unit_of_measurement,
					quantity: item.quantity,
				}),
			),
		);
		commands.push(EscPosCommands.LINE_BREAK);
	});

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(
		printCenter(`Print Details: ${dayjs().format('MM/DD/YYYY h:mmA')}`),
	);
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(EscPosCommands.LINE_BREAK);

	return commands;
};

export const printPurchaseOrder = ({
	purchaseOrder,
	isPdf = false,
}: PrintPurchaseOrderProps): string | undefined => {
	if (isPdf) {
		return appendHtmlElement(renderHtml({ purchaseOrder }));
	}

	const printingType = getAppReceiptPrintingType();

	if (printingType === printingTypes.NATIVE) {
		print(
			renderNative({ purchaseOrder }),
			'Purchase Order',
			undefined,
			printingType,
		);
		return undefined;
	}

	const data = renderHtml({ purchaseOrder });
	print(appendHtmlElement(data), 'Purchase Order', undefined, printingType);
	return data;
};

const renderForSupplierHtml = ({
	purchaseOrder,
}: PrintPurchaseOrderProps): string =>
	ReactDOM.renderToStaticMarkup(
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
			<table style={{ width: '100%', fontSize: '12px', lineHeight: '1.4' }}>
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
				style={{
					width: '100%',
					fontSize: '12px',
					lineHeight: '1.4',
					borderCollapse: 'collapse',
				}}
			>
				<thead>
					<tr>
						<th
							style={{
								textAlign: 'left',
								borderBottom: '1px solid black',
								padding: '0 4px 4px 0',
							}}
						>
							Product Name
						</th>
						<th
							style={{
								textAlign: 'center',
								borderBottom: '1px solid black',
								padding: '0 4px 4px',
							}}
						>
							Quantity
						</th>
						<th
							style={{
								textAlign: 'center',
								borderBottom: '1px solid black',
								padding: '0 0 4px 4px',
							}}
						>
							Unit
						</th>
					</tr>
				</thead>
				<tbody>
					{purchaseOrder.purchase_order_products?.map((item: any) => (
						<tr key={item.id}>
							<td style={{ padding: '2px 4px 2px 0' }}>{item.product?.name}</td>
							<td style={{ textAlign: 'center', padding: '2px 4px' }}>
								{formatQuantity({
									unitOfMeasurement: item.product?.unit_of_measurement,
									quantity: item.quantity,
								})}
							</td>
							<td style={{ textAlign: 'center', padding: '2px 0 2px 4px' }}>
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

const renderForSupplierNative = ({
	purchaseOrder,
}: PrintPurchaseOrderProps): string[] => {
	const branchHeader = {
		store_name: purchaseOrder.branch?.store_name,
		store_address: purchaseOrder.branch?.store_address,
		name: purchaseOrder.branch?.name,
		tin: purchaseOrder.branch?.tin,
	};

	const commands: string[] = [
		...generateReceiptHeaderCommandsV2({
			branchHeader,
			title: 'PURCHASE ORDER',
		}),
		EscPosCommands.LINE_BREAK,
		EscPosCommands.LINE_BREAK,
	];

	commands.push(
		...generateItemBlockCommands([
			{
				label: 'Datetime Requested:',
				value: formatDateTime(purchaseOrder.datetime_created),
			},
			{
				label: 'Reference #:',
				value: purchaseOrder.reference_number || EMPTY_CELL,
			},
			{ label: 'Vendor:', value: purchaseOrder.supplier_name || EMPTY_CELL },
			{
				label: 'Customer:',
				value: purchaseOrder.branch?.name || EMPTY_CELL,
			},
			{
				label: 'Encoder:',
				value: getFullName(purchaseOrder.authorizer) || EMPTY_CELL,
			},
		]),
	);

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(generateThreeColumnLine('Product Name', 'Quantity', 'Unit'));
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(printCenter(DASHED_DIVIDER));
	commands.push(EscPosCommands.LINE_BREAK);

	(purchaseOrder.purchase_order_products || []).forEach((item: any) => {
		commands.push(
			generateThreeColumnLine(
				item.product?.name || '',
				formatQuantity({
					unitOfMeasurement: item.product?.unit_of_measurement,
					quantity: item.quantity,
				}),
				item.unit || item.product?.unit_of_measurement || EMPTY_CELL,
			),
		);
		commands.push(EscPosCommands.LINE_BREAK);
	});

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(
		printCenter(`Print Details: ${dayjs().format('MM/DD/YYYY h:mmA')}`),
	);
	commands.push(EscPosCommands.LINE_BREAK);

	if (purchaseOrder.overall_remarks) {
		commands.push(printCenter(`Remarks: ${purchaseOrder.overall_remarks}`));
		commands.push(EscPosCommands.LINE_BREAK);
	}

	commands.push(EscPosCommands.LINE_BREAK);

	return commands;
};

export const printPurchaseOrderForSupplier = ({
	purchaseOrder,
	isPdf = false,
}: PrintPurchaseOrderProps): string | undefined => {
	if (isPdf) {
		return appendHtmlElement(renderForSupplierHtml({ purchaseOrder }));
	}

	const printingType = getAppReceiptPrintingType();

	if (printingType === printingTypes.NATIVE) {
		print(
			renderForSupplierNative({ purchaseOrder }),
			'Purchase Order',
			undefined,
			printingType,
		);
		return undefined;
	}

	const data = renderForSupplierHtml({ purchaseOrder });
	print(appendHtmlElement(data), 'Purchase Order', undefined, printingType);
	return data;
};
