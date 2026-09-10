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
import { usePdf } from 'hooks';
import { useBranchRetrieve } from 'hooks/useBranches';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { computeVatBreakdown, formatDateTime, formatInPeso } from 'utils';
import { ExpenseVoucher, ExpenseVoucherParticular } from '../index';

const { Text } = Typography;

interface Props {
	expenseVoucher: ExpenseVoucher | null;
	open: boolean;
	onClose: () => void;
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
): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.2' })}
		>
			<ExpenseVoucherDocument branch={branch} expenseVoucher={expenseVoucher} />
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
}: Props) => {
	const { data: branchData } = useBranchRetrieve({
		id: expenseVoucher?.branch ?? undefined,
		options: { enabled: !!expenseVoucher?.branch },
	});

	const { isLoadingPdf, previewPdf, downloadPdf, pdfPreviewModal } = usePdf({
		title: `ExpenseVoucher_${
			expenseVoucher?.reference_number || expenseVoucher?.id
		}.pdf`,
		paper: 'a4HalfLengthwise',
		previewInModal: true,
		print: () =>
			printExpenseVoucher(expenseVoucher as ExpenseVoucher, branchData, true),
	});

	const handlePrint = () => {
		if (!expenseVoucher) return;
		printExpenseVoucher(expenseVoucher, branchData);
	};

	if (!expenseVoucher) return null;

	const { vatExempt, vatableSales, vatAmount } = computeVatBreakdown(
		(expenseVoucher.particulars || []).map((item) => ({
			amount: Number(item.amount),
			isVatExempt: item.type === 'VE',
		})),
	);

	return (
		<Modal
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
			open={open}
			title="[View] Expense Voucher"
			width={VIEW_PRINTING_MODAL_WIDTH}
			centered
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
							{expenseVoucher.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Date:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{formatDateTime(expenseVoucher.datetime_created)}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Payee:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{expenseVoucher.payee || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Invoice #:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{expenseVoucher.invoice_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Type:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{expenseVoucher.payment_type === 'on_account'
								? 'On Account'
								: 'Pay'}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Authorizer:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{expenseVoucher.authorizer
								? getFullName(expenseVoucher.authorizer)
								: EMPTY_CELL}
						</td>
					</tr>
				</tbody>
			</table>

			<Table
				className="mt-6"
				columns={particularsColumns}
				dataSource={expenseVoucher.particulars || []}
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
					Total Amount: {formatInPeso(expenseVoucher.amount)}
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
