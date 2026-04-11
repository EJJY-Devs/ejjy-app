import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { MAX_PAGE_SIZE } from 'global';
import useChartOfAccounts from 'hooks/useChartOfAccounts';
import React, { useCallback, useMemo, useState } from 'react';
import './CreateTransactionModal.scss';

interface JournalEntryRow {
	debitAccount: string;
	creditAccount: string;
}

interface CreateTransactionValues {
	name: string;
	information: string;
	entries: JournalEntryRow[];
}

interface Props {
	isSubmitting: boolean;
	open: boolean;
	onClose: () => void;
	onCreate: (values: CreateTransactionValues) => Promise<void>;
}

const EMPTY_ENTRY: JournalEntryRow = { debitAccount: '', creditAccount: '' };

export const CreateTransactionModal = ({
	isSubmitting,
	open,
	onClose,
	onCreate,
}: Props) => {
	const [name, setName] = useState('');
	const [information, setInformation] = useState('');
	const [entries, setEntries] = useState<JournalEntryRow[]>([
		{ ...EMPTY_ENTRY },
	]);

	const { data } = useChartOfAccounts({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	const accountOptions = useMemo(
		() =>
			(data?.chartOfAccounts || []).map((account: any) => ({
				label: `${account.account_code} - ${account.account_name}`,
				value: `${account.account_code} - ${account.account_name}`,
			})),
		[data],
	);

	const handleEntryChange = useCallback(
		(index: number, field: keyof JournalEntryRow, value: string) => {
			setEntries((prev) => {
				const updated = [...prev];
				updated[index] = { ...updated[index], [field]: value };
				return updated;
			});
		},
		[],
	);

	const handleAddEntry = useCallback(() => {
		setEntries((prev) => [...prev, { ...EMPTY_ENTRY }]);
	}, []);

	const handleRemoveEntry = useCallback((index: number) => {
		setEntries((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleSubmit = useCallback(async () => {
		const validEntries = entries.filter(
			(e) => e.debitAccount && e.creditAccount,
		);
		if (!name.trim() || !information.trim() || validEntries.length === 0) {
			return;
		}
		await onCreate({
			name: name.trim(),
			information: information.trim(),
			entries: validEntries,
		});
		setName('');
		setInformation('');
		setEntries([{ ...EMPTY_ENTRY }]);
	}, [name, information, entries, onCreate]);

	const isSubmitDisabled = useMemo(() => {
		const hasName = name.trim().length > 0;
		const hasInformation = information.trim().length > 0;
		const hasValidEntry = entries.some(
			(e) => e.debitAccount && e.creditAccount,
		);
		return !hasName || !hasInformation || !hasValidEntry;
	}, [name, information, entries]);

	const handleClose = useCallback(() => {
		setName('');
		setInformation('');
		setEntries([{ ...EMPTY_ENTRY }]);
		onClose();
	}, [onClose]);

	const columns: ColumnsType<JournalEntryRow> = [
		{
			title: 'Debit Account',
			dataIndex: 'debitAccount',
			key: 'debitAccount',
			render: (value: string, record: JournalEntryRow, index: number) => (
				<Select
					className="CreateTransactionModal_accountSelect"
					optionFilterProp="label"
					options={accountOptions.filter(
						(opt) =>
							!record.creditAccount || opt.value !== record.creditAccount,
					)}
					placeholder="Select account"
					value={value || undefined}
					allowClear
					showSearch
					onChange={(val) =>
						handleEntryChange(index, 'debitAccount', val || '')
					}
				/>
			),
		},
		{
			title: 'Credit Account',
			dataIndex: 'creditAccount',
			key: 'creditAccount',
			render: (value: string, record: JournalEntryRow, index: number) => (
				<div className="CreateTransactionModal_creditCell">
					<Select
						className="CreateTransactionModal_accountSelect"
						optionFilterProp="label"
						options={accountOptions.filter(
							(opt) =>
								!record.debitAccount || opt.value !== record.debitAccount,
						)}
						placeholder="Select account"
						value={value || undefined}
						allowClear
						showSearch
						onChange={(val) =>
							handleEntryChange(index, 'creditAccount', val || '')
						}
					/>
					{index > 0 && (
						<button
							className="CreateTransactionModal_rowDeleteBtn"
							type="button"
							onClick={() => handleRemoveEntry(index)}
						>
							<CloseOutlined />
						</button>
					)}
				</div>
			),
		},
	];

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={null}
			open={open}
			title="Create - Transaction"
			width={600}
			destroyOnClose
			onCancel={handleClose}
		>
			<div className="CreateTransactionModal">
				<div className="CreateTransactionModal_field">
					<span className="CreateTransactionModal_label">Transaction Name</span>
					<Input
						placeholder="Input transaction name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
				<div className="CreateTransactionModal_field">
					<span className="CreateTransactionModal_label">
						Transaction Information
					</span>
					<Input
						placeholder="Input information"
						value={information}
						onChange={(e) => setInformation(e.target.value)}
					/>
				</div>
				<Table
					columns={columns}
					dataSource={entries}
					pagination={false}
					rowKey={(_, index) => String(index)}
					tableLayout="fixed"
					bordered
				/>
				<Button
					className="CreateTransactionModal_addBtn"
					icon={<PlusOutlined />}
					type="primary"
					ghost
					onClick={handleAddEntry}
				>
					Add Journal Entry
				</Button>
				<div className="CreateTransactionModal_footer">
					<Button
						disabled={isSubmitDisabled}
						loading={isSubmitting}
						type="primary"
						onClick={handleSubmit}
					>
						Submit
					</Button>
				</div>
			</div>
		</Modal>
	);
};
