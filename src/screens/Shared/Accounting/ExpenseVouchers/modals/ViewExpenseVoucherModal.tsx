import { PrinterOutlined } from '@ant-design/icons';
import { Button, Col, Modal, Row, Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	ExpenseVoucherDocument,
	PdfButtons,
	ReceiptFooter,
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
import React from 'react';
import ReactDOM from 'react-dom/server';
import { formatDate, formatDateTime, formatInPeso } from 'utils';
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
	{ title: 'Description', dataIndex: 'description' },
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
	siteSettings?: any,
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
			{siteSettings && (
				<div
					style={{ textAlign: 'center', fontSize: '12px', marginTop: '16px' }}
				>
					<div>{siteSettings.software_developer}</div>
					<div style={{ whiteSpace: 'pre-line' }}>
						{siteSettings.software_developer_address}
					</div>
					<div>{siteSettings.software_developer_tin}</div>
					<div>Acc No: {siteSettings.pos_accreditation_number}</div>
					<div>Date Issued: {siteSettings.pos_accreditation_date}</div>
					<br />
					<div>PTU No: {siteSettings.ptu_number}</div>
					<div>Date Issued: {siteSettings.ptu_date}</div>
				</div>
			)}
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

	const { data: siteSettings } = useSiteSettings();

	const { isLoadingPdf, previewPdf, downloadPdf, pdfPreviewModal } = usePdf({
		title: `ExpenseVoucher_${
			expenseVoucher?.reference_number || expenseVoucher?.id
		}.pdf`,
		paper: 'a4HalfLengthwise',
		previewInModal: true,
		print: () =>
			printExpenseVoucher(
				expenseVoucher as ExpenseVoucher,
				branchData,
				siteSettings,
				true,
			),
	});

	const handlePrint = () => {
		if (!expenseVoucher) return;
		printExpenseVoucher(expenseVoucher, branchData, siteSettings);
	};

	if (!expenseVoucher) return null;

	const notes = (expenseVoucher.remarks || '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

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
				summary={() => (
					<Table.Summary.Row>
						<Table.Summary.Cell colSpan={2} index={0}>
							<b>Total</b>
						</Table.Summary.Cell>
						<Table.Summary.Cell align="right" index={2}>
							<b>{formatInPeso(expenseVoucher.amount)}</b>
						</Table.Summary.Cell>
					</Table.Summary.Row>
				)}
				bordered
			/>

			<Space
				align="center"
				className="w-100 text-center"
				direction="vertical"
				size={0}
			>
				<br />
				<Text style={{ whiteSpace: 'pre-line' }}>
					Total Amount: {formatInPeso(expenseVoucher.amount)}
				</Text>
			</Space>

			<br />

			<Text style={{ textTransform: 'uppercase' }} strong>
				Notes
			</Text>
			<ul className="mt-2">
				{notes.length > 0 ? (
					notes.map((line) => <li key={line}>{line}</li>)
				) : (
					<li>—</li>
				)}
			</ul>

			<br />

			<Text style={{ textTransform: 'uppercase' }} strong>
				Signatures
			</Text>
			<Row className="mt-4" gutter={[24, 16]}>
				<Col span={12}>
					<div style={{ borderBottom: '1px solid #000', height: 32 }} />
					<div>{expenseVoucher.payee || '—'}, Employee</div>
					<div>Date Signed: {formatDate(expenseVoucher.datetime_created)}</div>
				</Col>
				<Col span={12}>
					<div style={{ borderBottom: '1px solid #000', height: 32 }} />
					<div>
						{expenseVoucher.authorizer
							? getFullName(expenseVoucher.authorizer)
							: '—'}
						, Authorizer
					</div>
					<div>
						Date Signed:{' '}
						{expenseVoucher.authorizer
							? formatDate(expenseVoucher.datetime_created)
							: '—'}
					</div>
				</Col>
			</Row>

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

			<br />

			<ReceiptFooter />

			{pdfPreviewModal}
		</Modal>
	);
};
