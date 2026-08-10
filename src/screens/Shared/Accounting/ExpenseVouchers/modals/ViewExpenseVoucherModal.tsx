import { PrinterOutlined } from '@ant-design/icons';
import { Button, Col, Descriptions, Modal, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	PdfButtons,
	ReceiptFooter,
	ReceiptHeaderV2,
} from 'components/Printing';
import { getFullName } from 'ejjy-global';
import { usePdf } from 'hooks';
import { useBranchRetrieve } from 'hooks/useBranches';
import React from 'react';
import { formatDate, formatDateTime, formatInPeso } from 'utils';
import { ExpenseVoucher, ExpenseVoucherParticular } from '../index';

const { Text } = Typography;

const VIEW_EXPENSE_VOUCHER_MODAL_WIDTH = 900;

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

	const particularsRowsHtml = (expenseVoucher.particulars || [])
		.map(
			(item, index) => `
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${
					index + 1
				}</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${item.description}</td>
				<td style="border: 1px solid #000; padding: 4px 8px; text-align: right;">${formatInPeso(
					item.amount,
				)}</td>
			</tr>`,
		)
		.join('');

	const notesHtml = (expenseVoucher.remarks || '')
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => `<li>${line}</li>`)
		.join('');

	return `
	<div style="width: 1100px; font-family: Arial, sans-serif; font-size: 11px; text-align: center;">
		${storeNameHtml}
		${storeAddressHtml}
		${branchNameHtml}
		${tinHtml}
		<div style="margin-bottom: 6px; font-weight: bold; text-transform: uppercase; font-size: 13px;">
			Expense Voucher
		</div>
		<table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px;">
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Reference #</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					expenseVoucher.reference_number || '—'
				}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Datetime</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${formatDateTime(
					expenseVoucher.datetime_created,
				)}</td>
			</tr>
		</table>

		<div style="margin-top: 10px; font-weight: bold; text-align: left; text-transform: uppercase;">Bill To</div>
		<table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 4px;">
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Name</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					expenseVoucher.payee || '—'
				}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">Address</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">—</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">Email</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">—</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">Phone</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">—</td>
			</tr>
		</table>

		<div style="margin-top: 10px; font-weight: bold; text-align: left; text-transform: uppercase;">Payment Method</div>
		<div style="margin-top: 4px; text-align: left;">Payment Type: ${
			expenseVoucher.payment_type === 'on_account' ? 'On Account' : 'Pay'
		}</div>

		<div style="margin-top: 10px; font-weight: bold; text-align: left; text-transform: uppercase;">Details</div>
		<table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 4px;">
			<tr>
				<th style="border: 1px solid #000; padding: 4px 8px; background: #f5f5f5; text-align: center;">Item #</th>
				<th style="border: 1px solid #000; padding: 4px 8px; background: #f5f5f5;">Description</th>
				<th style="border: 1px solid #000; padding: 4px 8px; background: #f5f5f5; text-align: right;">Amount</th>
			</tr>
			${particularsRowsHtml}
			<tr>
				<td colspan="2" style="border: 1px solid #000; padding: 4px 8px; font-weight: bold; text-align: right;">Total</td>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold; text-align: right;">${formatInPeso(
					expenseVoucher.amount,
				)}</td>
			</tr>
		</table>

		<div style="margin-top: 10px; font-weight: bold; text-align: left; text-transform: uppercase;">Notes</div>
		<ul style="margin-top: 4px; text-align: left; padding-left: 18px;">
			${notesHtml || '<li>—</li>'}
		</ul>

		<div style="margin-top: 10px; font-weight: bold; text-align: left; text-transform: uppercase;">Signatures</div>
		<table style="width: 100%; border-collapse: collapse; margin-top: 14px;">
			<tr>
				<td style="width: 50%; text-align: left; vertical-align: top;">
					<div style="border-bottom: 1px solid #000; height: 24px;"></div>
					<div>${expenseVoucher.payee || '—'}, Employee</div>
					<div>Date Signed: ${formatDate(expenseVoucher.datetime_created)}</div>
				</td>
				<td style="width: 50%; text-align: left; vertical-align: top;">
					<div style="border-bottom: 1px solid #000; height: 24px;"></div>
					<div>${
						expenseVoucher.authorizer
							? getFullName(expenseVoucher.authorizer)
							: '—'
					}, Authorizer</div>
					<div>Date Signed: ${
						expenseVoucher.authorizer
							? formatDate(expenseVoucher.datetime_created)
							: '—'
					}</div>
				</td>
			</tr>
		</table>

		<div style="margin-top: 8px; text-align: left;">
			GDT: ${formatDateTime(expenseVoucher.datetime_created)}
		</div>
	</div>
`;
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

	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `ExpenseVoucher_${
			expenseVoucher?.reference_number || expenseVoucher?.id
		}.pdf`,
		jsPdfSettings: {
			orientation: 'l',
			unit: 'px',
			format: [1200, 850],
		},
		print: () =>
			printExpenseVoucher(expenseVoucher as ExpenseVoucher, branchData),
	});

	const handlePrint = () => {
		if (!expenseVoucher) return;
		printExpenseVoucher(expenseVoucher, branchData);
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
			width={VIEW_EXPENSE_VOUCHER_MODAL_WIDTH}
			centered
			closable
			onCancel={onClose}
		>
			<ReceiptHeaderV2 branchHeader={branchData} title="EXPENSE VOUCHER" />

			<br />

			<Descriptions
				className="w-100"
				column={1}
				labelStyle={{ width: 200 }}
				bordered
			>
				<Descriptions.Item label="Reference #">
					{expenseVoucher.reference_number || '—'}
				</Descriptions.Item>
				<Descriptions.Item label="Datetime">
					{formatDateTime(expenseVoucher.datetime_created)}
				</Descriptions.Item>
			</Descriptions>

			<br />

			<Text style={{ textTransform: 'uppercase' }} strong>
				Bill To
			</Text>
			<Descriptions
				className="w-100 mt-2"
				column={1}
				labelStyle={{ width: 200 }}
				bordered
			>
				<Descriptions.Item label="Name">
					{expenseVoucher.payee || '—'}
				</Descriptions.Item>
				<Descriptions.Item label="Address">—</Descriptions.Item>
				<Descriptions.Item label="Email">—</Descriptions.Item>
				<Descriptions.Item label="Phone">—</Descriptions.Item>
			</Descriptions>

			<br />

			<Text style={{ textTransform: 'uppercase' }} strong>
				Payment Method
			</Text>
			<div className="mt-2">
				Payment Type:{' '}
				{expenseVoucher.payment_type === 'on_account' ? 'On Account' : 'Pay'}
			</div>

			<br />

			<Text style={{ textTransform: 'uppercase' }} strong>
				Details
			</Text>
			<Table
				className="mt-2"
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

			<br />

			<div>GDT: {formatDateTime(expenseVoucher.datetime_created)}</div>

			<br />

			<ReceiptFooter />

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{ display: 'none' }}
			/>
		</Modal>
	);
};
