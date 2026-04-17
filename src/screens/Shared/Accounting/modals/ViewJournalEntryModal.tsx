import { Button, Descriptions, Modal } from 'antd';
import React from 'react';

interface JournalEntry {
	id: number;
	entryType: string;
	datetime: string;
	branch?: string;
	referenceNumber: string;
	debitAccount: string;
	creditAccount: string;
	amount: string;
	remarks: string;
	description: string;
}

interface Props {
	entry: JournalEntry | null;
	isHeadOffice: boolean;
	onClose: () => void;
	onViewTransaction?: (transactionId: number, description: string) => void;
	open: boolean;
}

export const ViewJournalEntryModal = ({
	entry,
	isHeadOffice,
	onClose,
	onViewTransaction,
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
					{(() => {
						if (entry.entryType === 'transaction') {
							const match = entry.remarks.match(/^(.+)\s*\(TXN-(\d+)\)$/);
							if (match) {
								const txnName = match[1].trim();
								const txnId = Number(match[2]);
								return (
									<>
										<div>Transaction Name: {txnName}</div>
										<div>
											Transaction Id:{' '}
											<Button
												style={{ padding: 0, height: 'auto' }}
												type="link"
												onClick={() => {
													onClose();
													onViewTransaction?.(txnId, entry.description);
												}}
											>
												{txnId}
											</Button>
										</div>
										{entry.description && (
											<div>Remarks: {entry.description}</div>
										)}
									</>
								);
							}
						}
						return entry.remarks || '-';
					})()}
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
