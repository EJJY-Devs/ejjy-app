import { PrinterOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ExpenseVoucherDocument,
	PdfButtons,
	ReceiptHeaderV2,
} from 'components/Printing';
import dayjs from 'dayjs';
import {
	EMPTY_CELL,
	VIEW_PRINTING_MODAL_WIDTH,
	getFullName,
	printingTypes,
} from 'ejjy-global';
import {
	appendHtmlElement,
	getPageStyleObject,
	print,
} from 'ejjy-global/dist/print/helper-receipt';
import { usePdf, useSiteSettings } from 'hooks';
import { useBranchRetrieve } from 'hooks/useBranches';
import { useExpenseVoucherById } from 'hooks/useExpenseVouchers';
import React from 'react';
import ReactDOM from 'react-dom/server';
import {
	computeVatBreakdown,
	formatDateTime,
	formatInPeso,
	isPurchaseVatApplicable,
} from 'utils';
import { ExpenseVoucher, ExpenseVoucherParticular } from '../index';

const { Text } = Typography;

interface Props {
	expenseVoucher: ExpenseVoucher | null;
	open: boolean;
	onClose: () => void;
	asReferencePanel?: boolean;
}

const particularsColumns: ColumnsType<ExpenseVoucherParticular> = [
	{
		title: 'Item #',
		width: 70,
		align: 'center',
		render: (_value, _record, index) => index + 1,
	},
	{ title: 'Particulars', dataIndex: 'description' },
	{
		title: 'Type',
		dataIndex: 'type',
		width: 100,
		align: 'center',
	},
	{
		title: 'Amount',
		dataIndex: 'amount',
		align: 'right',
		width: 150,
		render: (value: string) => formatInPeso(value),
	},
];

const printExpenseVoucher = (
	expenseVoucher: ExpenseVoucher,
	branch?: any,
	isPdf = false,
	siteSettings?: any,
): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.2' })}
		>
			<ExpenseVoucherDocument
				branch={branch}
				expenseVoucher={expenseVoucher}
				siteSettings={siteSettings}
			/>
			<br />
			<div style={{ textAlign: 'center', fontSize: '12px' }}>
				<div>Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}</div>
			</div>
		</div>,
	);

	if (isPdf) {
		return appendHtmlElement(data);
	}

	print(
		appendHtmlElement(data),
		'Expense Voucher',
		undefined,
		printingTypes.HTML,
	);
	return data;
};

export const ViewExpenseVoucherModal = ({
	expenseVoucher,
	open,
	onClose,
	asReferencePanel,
}: Props) => {
	const { data: branchData } = useBranchRetrieve({
		id: expenseVoucher?.branch ?? undefined,
		options: { enabled: !!expenseVoucher?.branch },
	});
	const { data: siteSettings } = useSiteSettings();
	// Fetched fresh by id rather than trusting the list-cached `expenseVoucher`
	// prop, which can be stale right after the EWT Calculator step writes a
	// CashDisbursementDetail for it (list refetch can race the EWT save) -
	// same role usePurchaseById plays for ViewPurchaseModal.
	const { data: fullExpenseVoucher } = useExpenseVoucherById(
		expenseVoucher?.id,
	);
	const data = fullExpenseVoucher || expenseVoucher;

	const { isLoadingPdf, previewPdf, downloadPdf, pdfPreviewModal } = usePdf({
		title: `ExpenseVoucher_${data?.reference_number || data?.id}.pdf`,
		paper: 'a4HalfLengthwise',
		previewInModal: true,
		print: () =>
			printExpenseVoucher(
				data as ExpenseVoucher,
				branchData,
				true,
				siteSettings,
			),
	});

	const handlePrint = () => {
		if (!data) return;
		printExpenseVoucher(data, branchData, false, siteSettings);
	};

	if (!data) return null;

	const vatApplicable = isPurchaseVatApplicable(
		siteSettings,
		data.supplier_account,
	);
	const { vatExempt, vatableSales, vatAmount } = computeVatBreakdown(
		(data.particulars || []).map((item) => ({
			amount: Number(item.amount),
			isVatExempt: !vatApplicable || item.type === 'VE',
		})),
	);
	// Same override reflected in the itemized table below, so a viewer
	// doesn't see "V" rows next to totals that treat everything as VE.
	const particularsDataSource = (data.particulars || []).map((item) => ({
		...item,
		type: !vatApplicable ? 'VE' : item.type,
	}));

	return (
		<Modal
			centered={!asReferencePanel}
			className="Modal__hasFooter"
			footer={[
				<Button
					key="print"
					disabled={isLoadingPdf}
					icon={<PrinterOutlined />}
					type="primary"
					onClick={handlePrint}
				>
					Print
				</Button>,
				<PdfButtons
					key="pdf"
					downloadPdf={downloadPdf}
					isDisabled={isLoadingPdf}
					isLoading={isLoadingPdf}
					previewPdf={previewPdf}
				/>,
			]}
			mask={!asReferencePanel}
			open={open}
			title="[View] Expense Voucher"
			width={VIEW_PRINTING_MODAL_WIDTH}
			wrapClassName={asReferencePanel ? 'VoucherReferencePanel' : undefined}
			closable
			onCancel={onClose}
		>
			<ReceiptHeaderV2 branchHeader={branchData} title="EXPENSE VOUCHER" />

			<table
				className="mt-6 w-100"
				style={{ borderCollapse: 'collapse', fontSize: 14 }}
			>
				<tbody>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Voucher No.:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Date:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{formatDateTime(data.datetime_created)}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Payee:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data.payee || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Invoice #:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data.invoice_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Type:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data.payment_type === 'on_account' ? 'On Account' : 'Pay'}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Authorizer:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data.authorizer ? getFullName(data.authorizer) : EMPTY_CELL}
						</td>
					</tr>
				</tbody>
			</table>

			<Table
				className="mt-6"
				columns={particularsColumns}
				dataSource={particularsDataSource}
				pagination={false}
				rowKey="description"
				size="small"
				bordered
			/>

			<Space
				align="center"
				className="w-100 text-center"
				direction="vertical"
				size={0}
			>
				<br />
				<Text style={{ whiteSpace: 'pre-line' }} strong>
					Total Amount: {formatInPeso(data.amount)}
				</Text>
				<Text style={{ whiteSpace: 'pre-line' }}>
					VAT Exempt: {formatInPeso(vatExempt)}
				</Text>
				<Text style={{ whiteSpace: 'pre-line' }}>
					VATable Sales: {formatInPeso(vatableSales)}
				</Text>
				<Text style={{ whiteSpace: 'pre-line' }}>
					VAT Amount: {formatInPeso(vatAmount)}
				</Text>
				{Number(data.ewt_percentage) > 0 && (
					<Text style={{ whiteSpace: 'pre-line' }}>
						EWT: {formatInPeso(data.ewt_amount)} ({data.ewt_percentage}%)
					</Text>
				)}
			</Space>

			<Space
				align="center"
				className="w-100 text-center"
				direction="vertical"
				size={0}
			>
				<br />
				<Text style={{ whiteSpace: 'pre-line' }}>
					Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}
				</Text>
			</Space>

			{pdfPreviewModal}
		</Modal>
	);
};
