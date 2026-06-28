import { message, Modal, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import React, { useEffect, useState } from 'react';
import { JournalEntriesService } from 'services';
import { formatDateTime, formatInPeso, getLocalApiUrl } from 'utils';

interface JournalEntryRow {
	id: number;
	referenceNumber: string;
	datetime: string;
	debitAccount: string;
	creditAccount: string;
	amount: string;
	remarks: string;
}

const columns: ColumnsType<JournalEntryRow> = [
	{
		title: 'Datetime',
		dataIndex: 'datetime',
		key: 'datetime',
		render: (value: string) => formatDateTime(value) || '-',
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
		render: (value: string) => formatInPeso(value),
	},
];

interface Props {
	purchase: any | null;
	open: boolean;
	onClose: () => void;
}

export const ViewPurchaseJournalEntriesModal = ({
	purchase,
	open,
	onClose,
}: Props) => {
	const [entries, setEntries] = useState<JournalEntryRow[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!open || !purchase) return;

		const load = async () => {
			setIsLoading(true);
			try {
				const baseURL = getLocalApiUrl();
				const response = await JournalEntriesService.list(
					{ purchase_id: purchase.id, page_size: 100 },
					baseURL,
				);
				const results: JournalEntryRow[] = (response.data?.results ?? []).map(
					(je: any) => ({
						id: je.id,
						referenceNumber: je.reference_number,
						datetime: je.datetime_created,
						debitAccount: je.debit_account,
						creditAccount: je.credit_account,
						amount: je.amount,
						remarks: je.remarks,
					}),
				);

				if (results.length === 0 && purchase.journal_entry) {
					const single = await JournalEntriesService.retrieve(
						purchase.journal_entry,
						baseURL,
					);
					const je = single.data;
					setEntries([
						{
							id: je.id,
							referenceNumber: je.reference_number,
							datetime: je.datetime_created,
							debitAccount: je.debit_account,
							creditAccount: je.credit_account,
							amount: je.amount,
							remarks: je.remarks,
						},
					]);
				} else {
					setEntries(results);
				}
			} catch {
				message.error('Failed to load journal entries');
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [open, purchase]);

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={null}
			open={open}
			title={`Journal Entries - Purchases : ${
				purchase?.reference_number ?? ''
			}`}
			destroyOnClose
			onCancel={onClose}
		>
			<Spin spinning={isLoading}>
				<Table
					columns={columns}
					dataSource={entries}
					pagination={false}
					rowKey="id"
					size="small"
					bordered
				/>
			</Spin>
		</Modal>
	);
};
