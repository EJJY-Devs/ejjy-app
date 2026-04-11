import { Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useMemo } from 'react';
import { formatInPeso } from 'utils';
import './ViewTransactionModal.scss';

interface AccountEntry {
	debitAccount: string;
	creditAccount: string;
	amount?: number | string;
}

export interface Transaction {
	id: number;
	name: string;
	information: string;
	entries?: AccountEntry[];
}

interface Props {
	transaction: Transaction | null;
	remarks?: string;
	open: boolean;
	onClose: () => void;
}

export const ViewTransactionModal = ({
	transaction,
	remarks,
	open,
	onClose,
}: Props) => {
	const hasAmounts = useMemo(
		() =>
			(transaction?.entries || []).some(
				(e) => e.amount !== undefined && e.amount !== null,
			),
		[transaction],
	);

	const columns: ColumnsType<AccountEntry> = useMemo(() => {
		const cols: ColumnsType<AccountEntry> = [
			{
				title: 'Debit Account',
				dataIndex: 'debitAccount',
				key: 'debitAccount',
			},
			{
				title: 'Credit Account',
				dataIndex: 'creditAccount',
				key: 'creditAccount',
			},
		];
		if (hasAmounts) {
			cols.push({
				title: 'Amount',
				dataIndex: 'amount',
				key: 'amount',
				render: (value: number | string | undefined) =>
					value !== undefined && value !== null
						? formatInPeso(value, '₱ ')
						: '-',
			});
		}
		return cols;
	}, [hasAmounts]);

	if (!transaction) {
		return null;
	}

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={null}
			open={open}
			title="View - Transaction"
			destroyOnClose
			onCancel={onClose}
		>
			<div className="ViewTransactionModal">
				<div className="ViewTransactionModal_field">
					<span className="ViewTransactionModal_label">Transaction Name</span>
					<div className="ViewTransactionModal_value">
						{transaction.name || '-'}
					</div>
				</div>
				<div className="ViewTransactionModal_field">
					<span className="ViewTransactionModal_label">
						Transaction Information
					</span>
					<div className="ViewTransactionModal_value">
						{transaction.information || '-'}
					</div>
				</div>
				<Table
					columns={columns}
					dataSource={transaction.entries || []}
					pagination={false}
					rowKey={(_, index) => String(index)}
					bordered
				/>
				{remarks && (
					<div className="ViewTransactionModal_field">
						<span className="ViewTransactionModal_label">Remarks</span>
						<div className="ViewTransactionModal_value">{remarks}</div>
					</div>
				)}
			</div>
		</Modal>
	);
};
