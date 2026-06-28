import { Button, Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
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

	const remarksCell = (() => {
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
						{entry.description && <div>Remarks: {entry.description}</div>}
					</>
				);
			}
		}
		return entry.remarks || '-';
	})();

	const columns: ColumnsType<JournalEntry> = [
		{
			title: 'Datetime',
			dataIndex: 'datetime',
			key: 'datetime',
			render: (value: string) => value || '-',
		},
		{
			title: 'RefNum',
			dataIndex: 'referenceNumber',
			key: 'referenceNumber',
			render: (value: string) => value || '-',
		},
		{
			title: 'Debit',
			dataIndex: 'debitAccount',
			key: 'debitAccount',
			render: (value: string) => value || '-',
		},
		{
			title: 'Credit',
			dataIndex: 'creditAccount',
			key: 'creditAccount',
			render: (value: string) => value || '-',
		},
		{
			title: 'Amount',
			dataIndex: 'amount',
			key: 'amount',
			align: 'right',
			render: (value: string) => value || '-',
		},
		{
			title: 'Remarks',
			dataIndex: 'remarks',
			key: 'remarks',
			render: () => remarksCell,
		},
		...(isHeadOffice
			? [
					{
						title: 'Branch',
						dataIndex: 'branch',
						key: 'branch',
						render: (value: string) => value || '-',
					},
			  ]
			: []),
	];

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={null}
			open={open}
			title="View - Journal Entry"
			destroyOnClose
			onCancel={onClose}
		>
			<Table
				columns={columns}
				dataSource={[entry]}
				pagination={false}
				rowKey="id"
				size="small"
				bordered
			/>
		</Modal>
	);
};
