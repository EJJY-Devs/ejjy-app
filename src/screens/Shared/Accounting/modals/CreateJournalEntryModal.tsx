import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, InputNumber, Modal, Select } from 'antd';
import { DEFAULT_PAGE } from 'global';
import useChartOfAccounts from 'hooks/useChartOfAccounts';
import moment, { Moment } from 'moment';
import { formatNumberWithCommas } from 'utils';
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

interface EntryRow {
	debitAccount: string;
	creditAccount: string;
	amount: number | null;
}

interface ActiveCell {
	rowIndex: number;
	field: 'debitAccount' | 'creditAccount';
}

const createEmptyRow = (): EntryRow => ({
	debitAccount: '',
	creditAccount: '',
	amount: null,
});

interface Props {
	isSubmitting?: boolean;
	open: boolean;
	onClose: () => void;
	onSubmit: (values: {
		entries: { debitAccount: string; creditAccount: string; amount: number }[];
		remarks?: string;
		datetimeCreated?: string;
	}) => Promise<void> | void;
}

export const CreateJournalEntryModal = ({
	isSubmitting,
	open,
	onClose,
	onSubmit,
}: Props) => {
	const searchSelectRef = useRef<any>(null);
	const amountRefs = useRef<any[]>([]);

	const [entries, setEntries] = useState<EntryRow[]>([createEmptyRow()]);
	const [activeCell, setActiveCell] = useState<ActiveCell | null>({
		rowIndex: 0,
		field: 'debitAccount',
	});
	const [lockedAmounts, setLockedAmounts] = useState<Set<number>>(new Set());
	const [remarks, setRemarks] = useState('');
	const [entryDate, setEntryDate] = useState<Moment>(moment());
	const [searchText, setSearchText] = useState('');
	const [selectedSearchValue, setSelectedSearchValue] = useState<string | null>(
		null,
	);

	const { data, isFetching } = useChartOfAccounts({
		params: {
			page: DEFAULT_PAGE,
			pageSize: 500,
		},
	});
	const { chartOfAccounts } = data || { chartOfAccounts: [] };

	const getAccountFontSize = useCallback((text: string | undefined) => {
		if (!text) return 18;
		const len = text.length;
		if (len <= 20) return 18;
		if (len <= 30) return 15;
		if (len <= 40) return 13;
		return 11;
	}, []);

	const resetModalState = useCallback(() => {
		setEntries([createEmptyRow()]);
		setActiveCell({ rowIndex: 0, field: 'debitAccount' });
		setLockedAmounts(new Set());
		setRemarks('');
		setEntryDate(moment());
		setSearchText('');
		setSelectedSearchValue(null);
		amountRefs.current = [];
	}, []);

	const handleClose = () => {
		resetModalState();
		onClose();
	};

	useEffect(() => {
		if (!open) {
			resetModalState();
			return;
		}
		resetModalState();
		setTimeout(() => {
			searchSelectRef.current?.focus?.();
		}, 0);
	}, [open]);

	const accountOptions = useMemo(() => {
		const normalizedSearchText = searchText.trim().toLowerCase();
		const blockedValues: string[] = [];
		if (activeCell) {
			const row = entries[activeCell.rowIndex];
			if (row) {
				const otherValue =
					activeCell.field === 'debitAccount'
						? row.creditAccount
						: row.debitAccount;
				if (otherValue) blockedValues.push(otherValue);
			}
		}

		return chartOfAccounts
			.map((account: any) => {
				const label = `${account.account_code} - ${account.account_name}`;
				return { label, value: label };
			})
			.filter((option: any) => !blockedValues.includes(option.value))
			.filter(
				(option: any) =>
					!normalizedSearchText ||
					option.label.toLowerCase().includes(normalizedSearchText),
			);
	}, [chartOfAccounts, searchText, activeCell, entries]);

	const handleAccountSelect = (value: string) => {
		if (!activeCell) return;
		const { rowIndex, field } = activeCell;

		setEntries((prev) => {
			const updated = [...prev];
			updated[rowIndex] = { ...updated[rowIndex], [field]: value };
			return updated;
		});

		if (field === 'debitAccount') {
			setActiveCell({ rowIndex, field: 'creditAccount' });
		} else {
			setActiveCell(null);
			setTimeout(() => {
				amountRefs.current[rowIndex]?.focus?.();
			}, 0);
		}

		setSelectedSearchValue(null);
		setSearchText('');
	};

	const lockAmount = useCallback(
		(index: number) => {
			const amount = entries[index]?.amount;
			if (
				typeof amount === 'number' &&
				amount > 0 &&
				!lockedAmounts.has(index)
			) {
				const rounded = Math.round(amount * 100) / 100;
				setEntries((prev) => {
					const updated = [...prev];
					updated[index] = { ...updated[index], amount: rounded };
					return updated;
				});
				setLockedAmounts((prev) => new Set(prev).add(index));
			}
		},
		[entries, lockedAmounts],
	);

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

	const addEntry = () => {
		const newIndex = entries.length;
		setEntries((prev) => [...prev, createEmptyRow()]);
		setActiveCell({ rowIndex: newIndex, field: 'debitAccount' });
		setTimeout(() => {
			searchSelectRef.current?.focus?.();
		}, 0);
	};

	const removeEntry = (index: number) => {
		setEntries((prev) => prev.filter((_, i) => i !== index));
		amountRefs.current.splice(index, 1);
		setLockedAmounts((prev) => {
			const updated = new Set<number>();
			prev.forEach((i) => {
				if (i < index) updated.add(i);
				else if (i > index) updated.add(i - 1);
			});
			return updated;
		});
		if (activeCell?.rowIndex === index) {
			setActiveCell(null);
		} else if (activeCell && activeCell.rowIndex > index) {
			setActiveCell({ ...activeCell, rowIndex: activeCell.rowIndex - 1 });
		}
	};

	const handleCellClick = (
		rowIndex: number,
		field: 'debitAccount' | 'creditAccount',
	) => {
		setActiveCell({ rowIndex, field });
		setSearchText('');
		setSelectedSearchValue(null);
		setTimeout(() => {
			searchSelectRef.current?.focus?.();
		}, 0);
	};

	const isValid = entries.every(
		(e) => e.debitAccount && e.creditAccount && e.amount && e.amount > 0,
	);

	const handleSubmit = async () => {
		if (!isValid) return;
		await onSubmit({
			entries: entries.map((e) => ({
				debitAccount: e.debitAccount,
				creditAccount: e.creditAccount,
				amount: e.amount as number,
			})),
			remarks: remarks || undefined,
			datetimeCreated: entryDate.format('YYYY-MM-DD'),
		});
		resetModalState();
	};

	const hasMultipleRows = entries.length > 1;
	const gridClass = `CreateJournalEntryModal_gridInputs${
		hasMultipleRows ? ' has-delete' : ''
	}`;
	const labelsClass = `CreateJournalEntryModal_gridLabels${
		hasMultipleRows ? ' has-delete' : ''
	}`;

	return (
		<Modal
			className="CreateJournalEntryModal"
			footer={null}
			maskClosable={false}
			open={open}
			title="Create Journal Entry"
			width={760}
			centered
			closable
			destroyOnClose
			keyboard
			onCancel={handleClose}
		>
			<div className="CreateJournalEntryModal_form">
				<div className="CreateJournalEntryModal_dateRow">
					<span className="CreateJournalEntryModal_dateLabel">Date</span>
					<DatePicker
						allowClear={false}
						className="CreateJournalEntryModal_datePicker"
						format="MMMM DD, YYYY"
						value={entryDate}
						onChange={(value) => value && setEntryDate(value)}
					/>
				</div>

				<div className="CreateJournalEntryModal_searchItem">
					<Select
						ref={searchSelectRef}
						className="w-100"
						disabled={!activeCell}
						filterOption={false}
						loading={isFetching}
						notFoundContent={isFetching ? 'Loading...' : 'No accounts found'}
						options={accountOptions}
						placeholder={
							activeCell?.field === 'debitAccount'
								? 'Search account for debit'
								: 'Search account for credit'
						}
						searchValue={searchText}
						value={selectedSearchValue}
						allowClear
						autoFocus
						showSearch
						onChange={() => setSelectedSearchValue(null)}
						onClear={() => {
							setSelectedSearchValue(null);
							setSearchText('');
						}}
						onSearch={(value) => setSearchText(value)}
						onSelect={(value) => handleAccountSelect(value)}
					/>
				</div>

				<div className={labelsClass}>
					<span>DEBIT</span>
					<span>CREDIT</span>
					<span>AMOUNT</span>
					{hasMultipleRows && <span />}
				</div>

				{entries.map((entry, index) => (
					<div key={index} className={gridClass}>
						<div
							role="button"
							style={{ cursor: 'pointer' }}
							tabIndex={0}
							onClick={() => handleCellClick(index, 'debitAccount')}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ')
									handleCellClick(index, 'debitAccount');
							}}
						>
							<Input
								className={
									activeCell?.rowIndex === index &&
									activeCell?.field === 'debitAccount'
										? 'CreateJournalEntryModal_activeInput'
										: ''
								}
								placeholder="Select from search"
								style={{
									fontSize: getAccountFontSize(entry.debitAccount),
									pointerEvents: 'none',
								}}
								title={entry.debitAccount}
								value={entry.debitAccount}
								disabled
								readOnly
							/>
						</div>
						<div
							role="button"
							style={{ cursor: 'pointer' }}
							tabIndex={0}
							onClick={() => handleCellClick(index, 'creditAccount')}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ')
									handleCellClick(index, 'creditAccount');
							}}
						>
							<Input
								className={
									activeCell?.rowIndex === index &&
									activeCell?.field === 'creditAccount'
										? 'CreateJournalEntryModal_activeInput'
										: ''
								}
								placeholder="Select from search"
								style={{
									fontSize: getAccountFontSize(entry.creditAccount),
									pointerEvents: 'none',
								}}
								title={entry.creditAccount}
								value={entry.creditAccount}
								disabled
								readOnly
							/>
						</div>
						<InputNumber
							key={
								lockedAmounts.has(index)
									? `locked-${index}`
									: `unlocked-${index}`
							}
							ref={(el) => {
								amountRefs.current[index] = el;
							}}
							className="w-100"
							controls={false}
							disabled={
								!(entry.debitAccount && entry.creditAccount) ||
								lockedAmounts.has(index)
							}
							formatter={(value) => {
								if (!value) return '₱ ';
								if (lockedAmounts.has(index)) {
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
						{hasMultipleRows && (
							<Button
								icon={<DeleteOutlined />}
								style={{ height: 64 }}
								type="text"
								danger
								onClick={() => removeEntry(index)}
							/>
						)}
					</div>
				))}

				<Button
					className="CreateJournalEntryModal_addEntryBtn"
					icon={<PlusOutlined />}
					style={{ marginBottom: 16, marginTop: 4 }}
					type="primary"
					ghost
					onClick={addEntry}
				>
					Add Entry
				</Button>

				<div className="CreateJournalEntryModal_remarksLabel">Remarks</div>
				<Input
					style={{ marginBottom: 14 }}
					value={remarks}
					onChange={(e) => setRemarks(e.target.value)}
				/>

				<div className="ModalCustomFooter">
					<Button
						htmlType="button"
						onClick={() => {
							resetModalState();
							setTimeout(() => {
								searchSelectRef.current?.focus?.();
							}, 0);
						}}
					>
						Clear
					</Button>
					<Button
						disabled={!isValid}
						htmlType="button"
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
