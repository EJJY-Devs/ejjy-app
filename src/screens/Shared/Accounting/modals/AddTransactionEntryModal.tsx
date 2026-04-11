import { Button, Input, InputNumber, Modal, Select } from 'antd';
import { DEFAULT_PAGE, MAX_PAGE_SIZE } from 'global';
import useAccountingTransactions from 'hooks/useAccountingTransactions';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { formatNumberWithCommas } from 'utils';
import './AddTransactionEntryModal.scss';

interface EntryRow {
	debitAccount: string;
	creditAccount: string;
	amount: number | null;
}

export interface AddTransactionEntryValues {
	transactionId: number;
	transactionName: string;
	entries: EntryRow[];
	remarks: string;
}

interface Props {
	open: boolean;
	onClose: () => void;
	onSubmit: (values: AddTransactionEntryValues) => Promise<void> | void;
}

export const AddTransactionEntryModal = ({
	open,
	onClose,
	onSubmit,
}: Props) => {
	const [selectedTransactionId, setSelectedTransactionId] = useState<
		number | null
	>(null);
	const [entries, setEntries] = useState<EntryRow[]>([]);
	const [remarks, setRemarks] = useState('');
	const firstAmountRef = useRef<any>(null);

	const { data } = useAccountingTransactions({
		params: {
			page: DEFAULT_PAGE,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const transactions = useMemo(
		() =>
			(data?.accountingTransactions || []).map((t: any) => ({
				id: t.id,
				name: t.name,
				entries: (t.entries || []).map((e: any) => ({
					debitAccount: e.debit_account,
					creditAccount: e.credit_account,
				})),
			})),
		[data],
	);

	const transactionOptions = useMemo(
		() =>
			transactions.map((t: any) => ({
				label: t.name,
				value: t.id,
			})),
		[transactions],
	);

	const handleTransactionSelect = useCallback(
		(transactionId: number) => {
			setSelectedTransactionId(transactionId);
			const txn = transactions.find((t: any) => t.id === transactionId);
			if (txn) {
				setEntries(
					txn.entries.map((e: any) => ({
						debitAccount: e.debitAccount,
						creditAccount: e.creditAccount,
						amount: null,
					})),
				);
				setTimeout(() => {
					firstAmountRef.current?.focus?.();
				}, 0);
			}
		},
		[transactions],
	);

	const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());

	const handleAmountChange = useCallback(
		(index: number, value: number | null) => {
			setEntries((prev) => {
				const updated = [...prev];
				updated[index] = { ...updated[index], amount: value };
				return updated;
			});
		},
		[],
	);

	const lockAmount = useCallback(
		(index: number) => {
			const amount = entries[index]?.amount;
			if (typeof amount === 'number' && amount > 0) {
				const rounded = Math.round(amount * 100) / 100;
				setEntries((prev) => {
					const updated = [...prev];
					updated[index] = { ...updated[index], amount: rounded };
					return updated;
				});
				setLockedRows((prev) => new Set(prev).add(index));
			}
		},
		[entries],
	);

	const resetModalState = useCallback(() => {
		setSelectedTransactionId(null);
		setEntries([]);
		setRemarks('');
		setLockedRows(new Set());
	}, []);

	const handleClose = useCallback(() => {
		resetModalState();
		onClose();
	}, [onClose, resetModalState]);

	const handleSubmit = useCallback(async () => {
		if (!selectedTransactionId) return;
		const txn = transactions.find((t: any) => t.id === selectedTransactionId);
		await onSubmit({
			transactionId: selectedTransactionId,
			transactionName: txn?.name || '',
			entries,
			remarks,
		});
		resetModalState();
	}, [
		selectedTransactionId,
		transactions,
		entries,
		remarks,
		onSubmit,
		resetModalState,
	]);

	return (
		<Modal
			className="AddTransactionEntryModal"
			footer={null}
			maskClosable={false}
			open={open}
			title="Add Transaction Entry"
			width={760}
			centered
			closable
			destroyOnClose
			keyboard
			onCancel={handleClose}
		>
			<div className="AddTransactionEntryModal_form">
				<div className="AddTransactionEntryModal_searchItem">
					<Select
						className="w-100"
						disabled={selectedTransactionId !== null}
						optionFilterProp="label"
						options={transactionOptions}
						placeholder="Select a transaction"
						value={selectedTransactionId}
						allowClear
						showSearch
						onChange={(val) => {
							if (val) {
								handleTransactionSelect(val);
							} else {
								setSelectedTransactionId(null);
								setEntries([]);
							}
						}}
					/>
				</div>

				{entries.length > 0 && (
					<>
						<div className="AddTransactionEntryModal_gridLabels">
							<span>DEBIT</span>
							<span>CREDIT</span>
							<span>AMOUNT</span>
						</div>

						{entries.map((entry, index) => (
							<div key={index} className="AddTransactionEntryModal_gridInputs">
								<Input
									title={entry.debitAccount}
									value={entry.debitAccount}
									disabled
									readOnly
								/>
								<Input
									title={entry.creditAccount}
									value={entry.creditAccount}
									disabled
									readOnly
								/>
								<InputNumber
									key={lockedRows.has(index) ? 'locked' : 'unlocked'}
									ref={index === 0 ? firstAmountRef : undefined}
									className="w-100"
									controls={false}
									disabled={lockedRows.has(index)}
									formatter={(value) => {
										if (!value) return '₱ ';
										if (lockedRows.has(index)) {
											return `₱ ${formatNumberWithCommas(
												Number(value).toFixed(2),
											)}`;
										}
										return `₱ ${formatNumberWithCommas(value)}`;
									}}
									min={0}
									parser={(value) =>
										Number((value || '').replace(/₱\s?|,/g, '')) as any
									}
									precision={2}
									value={entry.amount}
									onBlur={() => lockAmount(index)}
									onChange={(val) => handleAmountChange(index, val)}
									onKeyDown={(e) => {
										const allowedKeys = [
											'Backspace',
											'Delete',
											'Tab',
											'ArrowLeft',
											'ArrowRight',
											'Home',
											'End',
										];
										if (allowedKeys.includes(e.key) || /^[0-9.]$/.test(e.key)) {
											return;
										}
										e.preventDefault();
									}}
									onPressEnter={() => lockAmount(index)}
								/>
							</div>
						))}
					</>
				)}

				<div className="AddTransactionEntryModal_remarksLabel">Remarks</div>
				<Input value={remarks} onChange={(e) => setRemarks(e.target.value)} />

				<div className="ModalCustomFooter">
					<Button htmlType="button" onClick={resetModalState}>
						Clear
					</Button>
					<Button type="primary" onClick={handleSubmit}>
						Submit
					</Button>
				</div>
			</div>
		</Modal>
	);
};
