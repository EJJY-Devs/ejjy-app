import { PrinterOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal } from 'antd';
import {
	PdfButtons,
	ReceiptFooter,
	ReceiptHeaderV2,
} from 'components/Printing';
import { VIEW_PRINTING_MODAL_WIDTH, getFullName } from 'ejjy-global';
import { usePdf } from 'hooks';
import { useBranchRetrieve } from 'hooks/useBranches';
import React from 'react';
import { formatDateTime, formatInPeso } from 'utils';
import { Expense } from '../index';

interface Props {
	expense: Expense | null;
	open: boolean;
	onClose: () => void;
}

const printDisbursementVoucher = (
	expense: Expense,
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

	return `
	<div style="font-family: Arial, sans-serif; font-size: 11px; text-align: center;">
		${storeNameHtml}
		${storeAddressHtml}
		${branchNameHtml}
		${tinHtml}
		<div style="margin-bottom: 8px; font-weight: bold; text-transform: uppercase; font-size: 13px;">
			Disbursement Voucher
		</div>
		<table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 24px;">
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Reference #</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					expense.reference_number || '—'
				}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; width: 40%; font-weight: bold;">Datetime</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${formatDateTime(
					expense.datetime_created,
				)}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">Payee</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${expense.payee}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">Particulars</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					expense.particulars || '—'
				}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">Amount</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${formatInPeso(
					expense.amount,
				)}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">Authorizer</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					expense.authorizer ? getFullName(expense.authorizer) : '—'
				}</td>
			</tr>
			<tr>
				<td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">Received By</td>
				<td style="border: 1px solid #000; padding: 4px 8px;">${
					expense.received_by || '—'
				}</td>
			</tr>
		</table>
		<div style="margin-top: 8px; text-align: left;">
			GDT: ${formatDateTime(expense.datetime_created)}
		</div>
	</div>
`;
};

export const ViewDisbursementVoucherModal = ({
	expense,
	open,
	onClose,
}: Props) => {
	const { data: branchData } = useBranchRetrieve({
		id: expense?.branch ?? undefined,
		options: { enabled: !!expense?.branch },
	});

	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `DisbursementVoucher_${
			expense?.reference_number || expense?.id
		}.pdf`,
		print: () => printDisbursementVoucher(expense as Expense, branchData),
	});

	const handlePrint = () => {
		if (!expense) return;
		printDisbursementVoucher(expense, branchData);
	};

	if (!expense) return null;

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
			title="[View] Disbursement Voucher"
			width={VIEW_PRINTING_MODAL_WIDTH}
			centered
			closable
			onCancel={onClose}
		>
			<ReceiptHeaderV2 branchHeader={branchData} title="DISBURSEMENT VOUCHER" />

			<br />
			<br />

			<Descriptions
				className="w-100"
				column={1}
				labelStyle={{ width: 200 }}
				bordered
			>
				<Descriptions.Item label="Reference #">
					{expense.reference_number || '—'}
				</Descriptions.Item>
				<Descriptions.Item label="Datetime">
					{formatDateTime(expense.datetime_created)}
				</Descriptions.Item>
				<Descriptions.Item label="Payee">{expense.payee}</Descriptions.Item>
				<Descriptions.Item label="Particulars">
					{expense.particulars || '—'}
				</Descriptions.Item>
				<Descriptions.Item label="Amount">
					{formatInPeso(expense.amount)}
				</Descriptions.Item>
				<Descriptions.Item label="Authorizer">
					{expense.authorizer ? getFullName(expense.authorizer) : '—'}
				</Descriptions.Item>
				<Descriptions.Item label="Received By">
					{expense.received_by || '—'}
				</Descriptions.Item>
			</Descriptions>

			<div>GDT: {formatDateTime(expense.datetime_created)}</div>

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
