import { Descriptions, Modal } from 'antd';
import React from 'react';

interface JournalEntry {
	id: number;
	datetime: string;
	branch?: string;
	referenceNumber: string;
	debitAccount: string;
	creditAccount: string;
	amount: string;
	remarks: string;
}

interface Props {
	entry: JournalEntry | null;
	isHeadOffice: boolean;
	onClose: () => void;
	open: boolean;
}

export const ViewJournalEntryModal = ({
	entry,
	isHeadOffice,
	onClose,
	open,
}: Props) => {
	if (!entry) {
		return null;
	}

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={null}
			open={open}
			title="View - Journal Entry"
			destroyOnClose
			onCancel={onClose}
		>
			<Descriptions
				column={2}
				labelStyle={{ fontWeight: 600, width: 190, whiteSpace: 'nowrap' }}
				bordered
			>
				<Descriptions.Item label="Datetime">
					{entry.datetime || '-'}
				</Descriptions.Item>
				<Descriptions.Item label="Reference Number">
					{entry.referenceNumber || '-'}
				</Descriptions.Item>
				<Descriptions.Item label="Debit Account">
					{entry.debitAccount || '-'}
				</Descriptions.Item>
				<Descriptions.Item label="Credit Account">
					{entry.creditAccount || '-'}
				</Descriptions.Item>
				<Descriptions.Item label="Amount">
					{entry.amount || '-'}
				</Descriptions.Item>
				<Descriptions.Item label="Remarks">
					{entry.remarks || '-'}
				</Descriptions.Item>
				{isHeadOffice && (
					<Descriptions.Item label="Branch">
						{entry.branch || '-'}
					</Descriptions.Item>
				)}
			</Descriptions>
		</Modal>
	);
};
