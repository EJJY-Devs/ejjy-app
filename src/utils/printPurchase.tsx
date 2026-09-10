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
import { PurchaseVoucherDocument, ReceiptHeaderV2 } from 'components/Printing';
import { computeVatBreakdown, formatDateTime, formatInPeso } from 'utils';
import {
	DASHED_DIVIDER,
	generateFourColumnLine,
} from 'utils/printEscPosHelpers';

interface PrintPurchaseProps {
	purchase: any;
	siteSettings?: any;
	isPdf?: boolean;
}

const renderHtml = ({ purchase }: PrintPurchaseProps): string =>
	ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.2' })}
		>
			<PurchaseVoucherDocument purchase={purchase} />
			<br />
			<div style={{ textAlign: 'center', fontSize: '12px' }}>
				<div>Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}</div>
			</div>
		</div>,
	);

// Native (ESC/POS) renderer — see printPOInternal.tsx for why this report
// builds its own commands instead of delegating to ejjy-global. Mirrors
// PurchaseVoucherDocument's fields/ordering.
const renderNative = ({ purchase }: PrintPurchaseProps): string[] => {
	const products = purchase?.purchase_products || [];

	const commands: string[] = [
		...generateReceiptHeaderCommandsV2({
			branchHeader: purchase?.branch,
			title: 'PURCHASE VOUCHER',
		}),
		EscPosCommands.LINE_BREAK,
		EscPosCommands.LINE_BREAK,
	];

	const items = [
		{ label: 'Voucher No.:', value: purchase?.reference_number || EMPTY_CELL },
		{ label: 'Date:', value: formatDateTime(purchase?.datetime_created) },
		{ label: 'To:', value: purchase?.supplier_name || EMPTY_CELL },
	];
	if (purchase?.authorizer) {
		items.push({
			label: 'Authorizer:',
			value: getFullName(purchase.authorizer),
		});
	}
	if (purchase?.purchase_order?.reference_number) {
		items.push({
			label: 'PO #:',
			value: purchase.purchase_order.reference_number,
		});
	}
	items.push({
		label: 'Type:',
		value: purchase?.payment_type === 'on_account' ? 'On Account' : 'Pay',
	});
	items.push({
		label: 'Remarks:',
		value: purchase?.overall_remarks || 'N/A',
	});
	commands.push(...generateItemBlockCommands(items));

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(
		generateFourColumnLine('Qty', 'Particulars', 'Unit Cost', 'Amount'),
	);
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(printCenter(DASHED_DIVIDER));
	commands.push(EscPosCommands.LINE_BREAK);

	// Receipt paper is too narrow for a true 5th "Type" column, so it's
	// tucked into the particulars text instead (e.g. "Item Name (VE)");
	// the PDF/HTML render (PurchaseVoucherDocument) has room for a real
	// column since it can expand.
	products.forEach((item: any) => {
		const typeLabel = item.product?.is_vat_exempted ? 'VE' : 'V';
		commands.push(
			generateFourColumnLine(
				String(item.quantity),
				`${item.product?.name || ''} (${typeLabel})`,
				formatInPeso(item.cost_per_piece, 'P'),
				formatInPeso(Number(item.quantity) * Number(item.cost_per_piece), 'P'),
			),
		);
		commands.push(EscPosCommands.LINE_BREAK);
	});

	const { vatExempt, vatableSales, vatAmount } = computeVatBreakdown(
		products.map((item: any) => ({
			amount: Number(item.quantity) * Number(item.cost_per_piece),
			isVatExempt: !!item.product?.is_vat_exempted,
		})),
	);

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(
		printCenter(`Total Amount: ${formatInPeso(purchase?.total_amount, 'P')}`),
	);
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(printCenter(`VAT Exempt: ${formatInPeso(vatExempt, 'P')}`));
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(
		printCenter(`VATable Sales: ${formatInPeso(vatableSales, 'P')}`),
	);
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(printCenter(`VAT Amount: ${formatInPeso(vatAmount, 'P')}`));
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(
		printCenter(`Print Details: ${dayjs().format('MM/DD/YYYY h:mmA')}`),
	);
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(EscPosCommands.LINE_BREAK);

	return commands;
};

export const printPurchase = ({
	purchase,
	isPdf = false,
}: PrintPurchaseProps): string | undefined => {
	if (isPdf) {
		return appendHtmlElement(renderHtml({ purchase }));
	}

	const printingType = getAppReceiptPrintingType();

	if (printingType === printingTypes.NATIVE) {
		print(renderNative({ purchase }), 'Purchase', undefined, printingType);
		return undefined;
	}

	const data = renderHtml({ purchase });
	print(appendHtmlElement(data), 'Purchase', undefined, printingType);
	return data;
};

const renderForSupplierHtml = ({ purchase }: PrintPurchaseProps): string =>
	ReactDOM.renderToStaticMarkup(
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

const renderForSupplierNative = ({
	purchase,
}: PrintPurchaseProps): string[] => {
	const commands: string[] = [
		...generateReceiptHeaderCommandsV2({
			branchHeader: purchase.branch,
			title: 'PURCHASE ORDER',
		}),
		EscPosCommands.LINE_BREAK,
		EscPosCommands.LINE_BREAK,
	];

	commands.push(
		...generateItemBlockCommands([
			{
				label: 'Datetime Requested:',
				value: formatDateTime(purchase.datetime_created),
			},
			{ label: 'Reference #:', value: purchase.reference_number || EMPTY_CELL },
			{ label: 'Vendor:', value: purchase.supplier_name || EMPTY_CELL },
			{ label: 'Customer:', value: purchase.branch?.name || EMPTY_CELL },
			{
				label: 'Encoder:',
				value: getFullName(purchase.authorizer) || EMPTY_CELL,
			},
		]),
	);

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(generateThreeColumnLine('Product Name', 'Quantity', 'Unit'));
	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(printCenter(DASHED_DIVIDER));
	commands.push(EscPosCommands.LINE_BREAK);

	(purchase.purchase_products || []).forEach((item: any) => {
		commands.push(
			generateThreeColumnLine(
				item.product?.name || '',
				String(item.quantity),
				item.product?.unit_of_measurement || EMPTY_CELL,
			),
		);
		commands.push(EscPosCommands.LINE_BREAK);
	});

	commands.push(EscPosCommands.LINE_BREAK);
	commands.push(
		printCenter(`Print Details: ${dayjs().format('MM/DD/YYYY h:mmA')}`),
	);
	commands.push(EscPosCommands.LINE_BREAK);

	if (purchase.overall_remarks) {
		commands.push(printCenter(`Remarks: ${purchase.overall_remarks}`));
		commands.push(EscPosCommands.LINE_BREAK);
	}

	commands.push(EscPosCommands.LINE_BREAK);

	return commands;
};

export const printPurchaseForSupplier = ({
	purchase,
	isPdf = false,
}: PrintPurchaseProps): string | undefined => {
	if (isPdf) {
		return appendHtmlElement(renderForSupplierHtml({ purchase }));
	}

	const printingType = getAppReceiptPrintingType();

	if (printingType === printingTypes.NATIVE) {
		print(
			renderForSupplierNative({ purchase }),
			'Purchase',
			undefined,
			printingType,
		);
		return undefined;
	}

	const data = renderForSupplierHtml({ purchase });
	print(appendHtmlElement(data), 'Purchase', undefined, printingType);
	return data;
};
