import { PrinterOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Descriptions,
	Modal,
	Row,
	Space,
	Table,
	Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons, ReceiptHeaderV2 } from 'components/Printing';
import { getFullName } from 'ejjy-global';
import { useBranchRetrieve } from 'hooks/useBranches';
import jsPDF from 'jspdf';
import React, { useState } from 'react';
import {
	PDF_WRAPPER_PADDING_PX,
	PDF_WRAPPER_WIDTH_PX,
	renderA4SinglePagePdf,
} from 'screens/Shared/Accounting/printing/renderA4SinglePagePdf';
import { renderReceiptPdf } from 'screens/Shared/Accounting/printing/renderReceiptPdf';
import { formatDate, formatDateTime, formatInPeso } from 'utils';

const { Text } = Typography;

const VIEW_DISBURSEMENT_VOUCHER_MODAL_WIDTH = 900;

const SIGNATURE_LINE_WIDTH = 220;

const RECEIPT_WIDTH_PX = 280;

export interface DisbursementVoucherParticular {
	description: string;
	amount: string;
}

export interface DisbursementVoucher {
	id: number;
	reference_number: string | null;
	datetime_created: string;
	payee: string;
	particulars: DisbursementVoucherParticular[];
	amount: string;
	payment_method: string;
	purchase_reference_number: string | null;
	remarks: string;
	authorizer: { id: number; first_name: string; last_name: string } | null;
	branch: number | null;
	branch_name: string | null;
}

interface Props {
	disbursementVoucher: DisbursementVoucher | null;
	open: boolean;
	onClose: () => void;
}

const particularsColumns: ColumnsType<DisbursementVoucherParticular> = [
	{ title: 'Description', dataIndex: 'description' },
	{
		title: 'Amount',
		dataIndex: 'amount',
		align: 'right',
		width: 150,
		render: (value: string) => formatInPeso(value),
	},
];

const getPaymentMethodLabel = (value: string) => {
	if (value === 'check') return 'Check';
	if (value === 'e_payment') return 'E-Payment';
	return 'Cash';
};

const printDisbursementVoucherA4 = (
	disbursementVoucher: DisbursementVoucher,
	branch?: {
		store_name?: string;
		store_address?: string;
		name?: string;
		tin?: string;
	},
) => {
	const storeNameHtml = branch?.store_name
		? `<div style="font-weight: bold; font-size: 13px;">${branch.store_name}</div>`
		: '';
	const storeAddressHtml = branch?.store_address
		? `<div style="font-size: 12px;">${branch.store_address}</div>`
		: '';
	const branchNameHtml = branch?.name
		? `<div style="font-size: 12px;">${branch.name}</div>`
		: '';
	const tinHtml = branch?.tin
		? `<div style="font-size: 12px;">${branch.tin}</div>`
		: '';

	const particularsTableHtml = (disbursementVoucher.particulars || []).length
		? `<table style="width: 100%; border-collapse: collapse;">
			${(disbursementVoucher.particulars || [])
				.map(
					(item) => `
					<tr>
						<td style="border: 1px solid #000; padding: 4px 8px;">${item.description}</td>
						<td style="border: 1px solid #000; padding: 4px 8px; text-align: right; width: 120px;">${formatInPeso(
							item.amount,
						)}</td>
					</tr>`,
				)
				.join('')}
		</table>`
		: '—';

	const purchaseVoucherRowHtml = disbursementVoucher.purchase_reference_number
		? `
		<tr>
			<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Purchase Voucher</td>
			<td style="border: 1px solid #000; padding: 4px 8px;">${disbursementVoucher.purchase_reference_number}</td>
		</tr>`
		: '';

	return `
	<div style="width: 1100px; font-family: Arial, sans-serif; font-size: 11px; text-align: center;">
		${storeNameHtml}
		${storeAddressHtml}
		${branchNameHtml}
		${tinHtml}
		<div style="margin-bottom: 6px; font-weight: bold; text-transform: uppercase; font-size: 13px;">
			Disbursement Voucher
		</div>
		<table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px;">
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Reference #</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					disbursementVoucher.reference_number || '—'
				}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Datetime</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${formatDateTime(
					disbursementVoucher.datetime_created,
				)}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Payee</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					disbursementVoucher.payee || '—'
				}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Payment Method</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${getPaymentMethodLabel(
					disbursementVoucher.payment_method,
				)}</td>
			</tr>
			${purchaseVoucherRowHtml}
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Particulars</td>
				<td style="border: 1px solid #000; padding: 0;">${particularsTableHtml}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Amount</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${formatInPeso(
					disbursementVoucher.amount,
				)}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Notes</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					disbursementVoucher.remarks || '—'
				}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Authorizer</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					disbursementVoucher.authorizer
						? getFullName(disbursementVoucher.authorizer)
						: '—'
				}</td>
			</tr>
		</table>

		<div style="margin-top: 10px; font-weight: bold; text-align: left; text-transform: uppercase;">Signatures</div>
		<table style="width: 100%; border-collapse: collapse; margin-top: 14px;">
			<tr>
				<td style="width: 50%; text-align: left; vertical-align: top;">
					<div style="border-bottom: 1px solid #000; height: 24px; width: ${SIGNATURE_LINE_WIDTH}px;"></div>
					<div>${disbursementVoucher.payee || '—'}, Supplier</div>
					<div>Date Signed: ${formatDate(disbursementVoucher.datetime_created)}</div>
				</td>
				<td style="width: 50%; text-align: left; vertical-align: top;">
					<div style="border-bottom: 1px solid #000; height: 24px; width: ${SIGNATURE_LINE_WIDTH}px;"></div>
					<div>${
						disbursementVoucher.authorizer
							? getFullName(disbursementVoucher.authorizer)
							: '—'
					}, Authorizer</div>
					<div>Date Signed: ${
						disbursementVoucher.authorizer
							? formatDate(disbursementVoucher.datetime_created)
							: '—'
					}</div>
				</td>
			</tr>
		</table>

		<div style="margin-top: 8px; text-align: left;">
			GDT: ${formatDateTime(disbursementVoucher.datetime_created)}
		</div>
	</div>
`;
};

const printDisbursementVoucherReceipt = (
	disbursementVoucher: DisbursementVoucher,
	branch?: {
		store_name?: string;
		store_address?: string;
		name?: string;
		tin?: string;
	},
) => {
	const storeNameHtml = branch?.store_name
		? `<div style="font-weight: bold; font-size: 12px;">${branch.store_name}</div>`
		: '';
	const storeAddressHtml = branch?.store_address
		? `<div style="font-size: 10px;">${branch.store_address}</div>`
		: '';
	const branchNameHtml = branch?.name
		? `<div style="font-size: 10px;">${branch.name}</div>`
		: '';
	const tinHtml = branch?.tin
		? `<div style="font-size: 10px;">${branch.tin}</div>`
		: '';

	const particularsRowsHtml = (disbursementVoucher.particulars || [])
		.map(
			(item) => `
			<div style="display: flex; justify-content: space-between; gap: 8px;">
				<span>${item.description}</span>
				<span>${formatInPeso(item.amount)}</span>
			</div>`,
		)
		.join('');

	return `
	<div style="width: 280px; padding-bottom: 20px; font-family: Arial, sans-serif; font-size: 10px; text-align: center;">
		${storeNameHtml}
		${storeAddressHtml}
		${branchNameHtml}
		${tinHtml}
		<div style="margin: 6px 0; font-weight: bold; text-transform: uppercase; font-size: 11px;">
			Disbursement Voucher
		</div>

		<div style="border-top: 1px dashed #000; margin: 4px 0;"></div>

		<div style="text-align: left;">
			<div>Reference #: ${disbursementVoucher.reference_number || '—'}</div>
			<div>Datetime: ${formatDateTime(disbursementVoucher.datetime_created)}</div>
			<div>Payee: ${disbursementVoucher.payee || '—'}</div>
			<div>Payment Method: ${getPaymentMethodLabel(
				disbursementVoucher.payment_method,
			)}</div>
			${
				disbursementVoucher.purchase_reference_number
					? `<div>Purchase Voucher: ${disbursementVoucher.purchase_reference_number}</div>`
					: ''
			}
		</div>

		<div style="border-top: 1px dashed #000; margin: 4px 0;"></div>

		<div style="text-align: left; font-weight: bold;">Particulars</div>
		<div style="text-align: left; margin-top: 2px;">
			${particularsRowsHtml || '—'}
		</div>

		<div style="border-top: 1px dashed #000; margin: 4px 0;"></div>

		<div style="display: flex; justify-content: space-between; font-weight: bold; text-align: left;">
			<span>Total</span>
			<span>${formatInPeso(disbursementVoucher.amount)}</span>
		</div>

		<div style="border-top: 1px dashed #000; margin: 4px 0;"></div>

		<div style="text-align: left;">
			<div>Notes: ${disbursementVoucher.remarks || '—'}</div>
		</div>

		<div style="border-top: 1px dashed #000; margin: 4px 0;"></div>

		<div style="margin-top: 20px;">
			<div style="border-bottom: 1px solid #000; height: 24px; width: 200px; margin: 0 auto;"></div>
			<div>${disbursementVoucher.payee || '—'}, Supplier</div>
			<div>Date Signed: ${formatDate(disbursementVoucher.datetime_created)}</div>
		</div>

		<div style="margin-top: 28px;">
			<div style="border-bottom: 1px solid #000; height: 24px; width: 200px; margin: 0 auto;"></div>
			<div>${
				disbursementVoucher.authorizer
					? getFullName(disbursementVoucher.authorizer)
					: '—'
			}, Authorizer</div>
			<div>Date Signed: ${
				disbursementVoucher.authorizer
					? formatDate(disbursementVoucher.datetime_created)
					: '—'
			}</div>
		</div>

		<div style="margin-top: 20px;">
			GDT: ${formatDateTime(disbursementVoucher.datetime_created)}
		</div>
	</div>
`;
};

export const ViewDisbursementVoucherModal = ({
	disbursementVoucher,
	open,
	onClose,
}: Props) => {
	const { data: branchData } = useBranchRetrieve({
		id: disbursementVoucher?.branch ?? undefined,
		options: { enabled: !!disbursementVoucher?.branch },
	});

	const [isLoadingPdfA4, setIsLoadingPdfA4] = useState(false);
	const [isLoadingPdfReceipt, setIsLoadingPdfReceipt] = useState(false);

	const pdfTitleA4 = `DisbursementVoucher_${
		disbursementVoucher?.reference_number || disbursementVoucher?.id
	}_A4.pdf`;
	const pdfTitleReceipt = `DisbursementVoucher_${
		disbursementVoucher?.reference_number || disbursementVoucher?.id
	}_Receipt.pdf`;

	const buildA4Pdf = async () => {
		if (!disbursementVoucher) return null;

		const dataHtml = printDisbursementVoucherA4(
			disbursementVoucher,
			branchData,
		);
		const wrappedHtml = `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box;">${dataHtml}</div>`;

		return renderA4SinglePagePdf({ html: wrappedHtml, title: pdfTitleA4 });
	};

	const buildReceiptPdf = async () => {
		if (!disbursementVoucher) return null;

		const dataHtml = printDisbursementVoucherReceipt(
			disbursementVoucher,
			branchData,
		);

		return renderReceiptPdf({
			html: dataHtml,
			title: pdfTitleReceipt,
			widthPx: RECEIPT_WIDTH_PX,
		});
	};

	const runWithLoading = async (
		setLoading: (value: boolean) => void,
		build: () => Promise<jsPDF | null>,
		onReady: (pdf: jsPDF) => void,
	) => {
		setLoading(true);

		try {
			const pdf = await build();
			if (pdf) {
				onReady(pdf);
			}
		} catch (error) {
			console.error('Failed to generate PDF', error);
		} finally {
			setLoading(false);
		}
	};

	const previewPdfA4 = () =>
		runWithLoading(setIsLoadingPdfA4, buildA4Pdf, (pdf) => {
			window.open(pdf.output('bloburl').toString());
		});

	const downloadPdfA4 = () =>
		runWithLoading(setIsLoadingPdfA4, buildA4Pdf, (pdf) => {
			pdf.save(pdfTitleA4);
		});

	const previewPdfReceipt = () =>
		runWithLoading(setIsLoadingPdfReceipt, buildReceiptPdf, (pdf) => {
			window.open(pdf.output('bloburl').toString());
		});

	const downloadPdfReceipt = () =>
		runWithLoading(setIsLoadingPdfReceipt, buildReceiptPdf, (pdf) => {
			pdf.save(pdfTitleReceipt);
		});

	if (!disbursementVoucher) return null;

	return (
		<Modal
			className="Modal__hasFooter"
			footer={[
				<Space key="printing-actions" size={24}>
					<Space size={8}>
						<Text strong>A4:</Text>
						<Button
							disabled={isLoadingPdfA4}
							icon={<PrinterOutlined />}
							onClick={previewPdfA4}
						>
							Print
						</Button>
						<PdfButtons
							downloadPdf={downloadPdfA4}
							isDisabled={isLoadingPdfA4}
							isLoading={isLoadingPdfA4}
							previewPdf={previewPdfA4}
						/>
					</Space>
					<Space size={8}>
						<Text strong>Receipt:</Text>
						<Button
							disabled={isLoadingPdfReceipt}
							icon={<PrinterOutlined />}
							onClick={previewPdfReceipt}
						>
							Print
						</Button>
						<PdfButtons
							downloadPdf={downloadPdfReceipt}
							isDisabled={isLoadingPdfReceipt}
							isLoading={isLoadingPdfReceipt}
							previewPdf={previewPdfReceipt}
						/>
					</Space>
				</Space>,
			]}
			open={open}
			title="[View] Disbursement Voucher"
			width={VIEW_DISBURSEMENT_VOUCHER_MODAL_WIDTH}
			centered
			closable
			onCancel={onClose}
		>
			<ReceiptHeaderV2 branchHeader={branchData} title="DISBURSEMENT VOUCHER" />

			<br />

			<Descriptions
				className="w-100"
				column={1}
				labelStyle={{ width: 200 }}
				bordered
			>
				<Descriptions.Item label="Reference #">
					{disbursementVoucher.reference_number || '—'}
				</Descriptions.Item>
				<Descriptions.Item label="Datetime">
					{formatDateTime(disbursementVoucher.datetime_created)}
				</Descriptions.Item>
				<Descriptions.Item label="Payee">
					{disbursementVoucher.payee || '—'}
				</Descriptions.Item>
				<Descriptions.Item label="Payment Method">
					{getPaymentMethodLabel(disbursementVoucher.payment_method)}
				</Descriptions.Item>
				{disbursementVoucher.purchase_reference_number && (
					<Descriptions.Item label="Purchase Voucher">
						{disbursementVoucher.purchase_reference_number}
					</Descriptions.Item>
				)}
				<Descriptions.Item label="Particulars">
					<Table
						columns={particularsColumns}
						dataSource={disbursementVoucher.particulars || []}
						pagination={false}
						rowKey="description"
						showHeader={false}
						size="small"
						bordered
					/>
				</Descriptions.Item>
				<Descriptions.Item label="Amount">
					{formatInPeso(disbursementVoucher.amount)}
				</Descriptions.Item>
				<Descriptions.Item label="Notes">
					{disbursementVoucher.remarks || '—'}
				</Descriptions.Item>
				<Descriptions.Item label="Authorizer">
					{disbursementVoucher.authorizer
						? getFullName(disbursementVoucher.authorizer)
						: '—'}
				</Descriptions.Item>
			</Descriptions>

			<br />

			<br />

			<Text style={{ textTransform: 'uppercase' }} strong>
				Signatures
			</Text>
			<Row className="mt-4" gutter={[24, 16]}>
				<Col span={12}>
					<div
						style={{
							borderBottom: '1px solid #000',
							height: 32,
							width: SIGNATURE_LINE_WIDTH,
						}}
					/>
					<div>{disbursementVoucher.payee || '—'}, Supplier</div>
					<div>
						Date Signed: {formatDate(disbursementVoucher.datetime_created)}
					</div>
				</Col>
				<Col span={12}>
					<div
						style={{
							borderBottom: '1px solid #000',
							height: 32,
							width: SIGNATURE_LINE_WIDTH,
						}}
					/>
					<div>
						{disbursementVoucher.authorizer
							? getFullName(disbursementVoucher.authorizer)
							: '—'}
						, Authorizer
					</div>
					<div>
						Date Signed:{' '}
						{disbursementVoucher.authorizer
							? formatDate(disbursementVoucher.datetime_created)
							: '—'}
					</div>
				</Col>
			</Row>

			<br />

			<div>GDT: {formatDateTime(disbursementVoucher.datetime_created)}</div>

			<br />
		</Modal>
	);
};
