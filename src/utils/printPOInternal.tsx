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
import { DASHED_DIVIDER } from 'utils/printEscPosHelpers';

interface PrintPOInternalProps {
	requisitionSlip: any;
	siteSettings?: any;
	isPdf?: boolean;
}

const renderHtml = ({
	requisitionSlip,
	siteSettings,
}: PrintPOInternalProps): string =>
	ReactDOM.renderToStaticMarkup(
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
			<table style={{ width: '100%', fontSize: '12px', lineHeight: '1.4' }}>
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
								padding: '0 4px 4px',
							}}
						>
							Qty
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
					{(requisitionSlip.products || []).map((item: any) => (
						<tr key={item.product?.id}>
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
		</div>,
	);

// Native (ESC/POS) renderer for dot-matrix / thermal printers running in
// "Native" printing mode (see AppSettingsModal's Printing Type setting).
// Mirrors the layout conventions ejjy-global's own native templates use
// (generateThreeColumnLine, generateItemBlockCommands, printCenter) since
// this report has no ejjy-global equivalent to delegate to directly.
const renderNative = ({
	requisitionSlip,
	siteSettings,
}: PrintPOInternalProps): string[] => {
	const branchHeader = {
		store_name: requisitionSlip.branch?.store_name || siteSettings?.store_name,
		store_address:
			requisitionSlip.branch?.store_address || siteSettings?.address,
		name: requisitionSlip.branch?.name,
		tin: requisitionSlip.branch?.tin || siteSettings?.tin,
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
				value:
					requisitionSlip.po_reference_number ||
					requisitionSlip.reference_number ||
					EMPTY_CELL,
			},
			{ label: 'Supplier:', value: requisitionSlip.vendor?.name || EMPTY_CELL },
			{
				label: 'Authorizer:',
				value: getFullName(requisitionSlip.authorizer) || EMPTY_CELL,
			},
			{
				label: 'Date:',
				value: formatDateTime(requisitionSlip.datetime_created),
			},
		]),
	);

	if (requisitionSlip.overall_remarks) {
		commands.push(
			...generateItemBlockCommands([
				{ label: 'Remarks:', value: requisitionSlip.overall_remarks },
			]),
		);
	}

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(generateThreeColumnLine('Product', 'Qty', 'Unit'));
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(printCenter(DASHED_DIVIDER));
	commands.push(EscPosCommands.LINE_BREAK);

	(requisitionSlip.products || []).forEach((item: any) => {
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
	commands.push(EscPosCommands.LINE_BREAK);

	return commands;
};

export const printPOInternal = ({
	requisitionSlip,
	siteSettings,
	isPdf = false,
}: PrintPOInternalProps): string | undefined => {
	if (isPdf) {
		return appendHtmlElement(renderHtml({ requisitionSlip, siteSettings }));
	}

	const printingType = getAppReceiptPrintingType();

	if (printingType === printingTypes.NATIVE) {
		print(
			renderNative({ requisitionSlip, siteSettings }),
			'Purchase Order',
			undefined,
			printingType,
		);
		return undefined;
	}

	const data = renderHtml({ requisitionSlip, siteSettings });
	print(appendHtmlElement(data), 'Purchase Order', undefined, printingType);
	return data;
};
