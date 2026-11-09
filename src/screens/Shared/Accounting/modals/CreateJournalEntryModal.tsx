import {
	DeleteOutlined,
	FileSearchOutlined,
	PlusOutlined,
	ProfileOutlined,
} from '@ant-design/icons';
import {
	Button,
	DatePicker,
	Input,
	InputNumber,
	Modal,
	Select,
	Space,
	Tooltip,
} from 'antd';
import { DEFAULT_PAGE, MAX_PAGE_SIZE } from 'global';
import useAccountingTransactions, {
	getAccountingTransactionId,
} from 'hooks/useAccountingTransactions';
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
	hasVoucher?: boolean;
	allowTransactionTemplate?: boolean;
	renderVoucher?: (onClose: () => void) => React.ReactNode;
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
	hasVoucher,
	allowTransactionTemplate,
	renderVoucher,
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
	const [isVoucherOpen, setIsVoucherOpen] = useState(!!hasVoucher);
	const [isTemplateMode, setIsTemplateMode] = useState(false);
	const [selectedTransactionId, setSelectedTransactionId] = useState<
		number | null
	>(null);

	const { data, isFetching } = useChartOfAccounts({
		params: {
			page: DEFAULT_PAGE,
			pageSize: 500,
		},
	});
	const { chartOfAccounts } = data || { chartOfAccounts: [] };

	const {
		data: transactionsData,
		isFetching: isFetchingTransactions,
	} = useAccountingTransactions({
		params: {
			page: DEFAULT_PAGE,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const transactions = useMemo(
		() =>
			(transactionsData?.accountingTransactions || []).map((t: any) => ({
				id: getAccountingTransactionId(t),
				name: t.name,
				entries: (t.entries || []).map((e: any) => ({
					debitAccount: e.debit_account,
					creditAccount: e.credit_account,
				})),
			})),
		[transactionsData],
	);

	const transactionOptions = useMemo(
		() => transactions.map((t: any) => ({ label: t.name, value: t.id })),
		[transactions],
	);

	const getAccountFontSize = useCallback((text: string | undefined) => {
		if (!text) return 18;
		const len = text.length;
		if (len <= 20) return 18;
		if (len <= 30) return 15;
		if (len <= 40) return 13;
		return 11;
	}, []);

	const resetEntries = useCallback((templateMode: boolean) => {
		setEntries(templateMode ? [] : [createEmptyRow()]);
		setActiveCell(templateMode ? null : { rowIndex: 0, field: 'debitAccount' });
		setLockedAmounts(new Set());
		setSearchText('');
		setSelectedSearchValue(null);
		setSelectedTransactionId(null);
		amountRefs.current = [];
	}, []);

	const resetModalState = useCallback(
		(templateMode = false) => {
			resetEntries(templateMode);
			setIsTemplateMode(templateMode);
			setRemarks('');
			setEntryDate(moment());
			setIsVoucherOpen(!!hasVoucher);
		},
		[hasVoucher, resetEntries],
	);

	const handleTemplateModeToggle = () => {
		const next = !isTemplateMode;
		setIsTemplateMode(next);
		resetEntries(next);
		setTimeout(() => {
			searchSelectRef.current?.focus?.();
		}, 0);
	};

	const handleTransactionSelect = (transactionId: number | undefined) => {
		const txn = transactionId
			? transactions.find((t: any) => t.id === transactionId)
			: null;
		resetEntries(true);
		if (!txn) return;

		setSelectedTransactionId(transactionId as number);
		setEntries(
			txn.entries.map((e: any) => ({
				debitAccount: e.debitAccount,
				creditAccount: e.creditAccount,
				amount: null,
			})),
		);
		setTimeout(() => {
			amountRefs.current[0]?.focus?.();
		}, 0);
	};

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
			.filter((account: any) => account.account_category !== 'special')
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
		if (isTemplateMode) return;
		setActiveCell({ rowIndex, field });
		setSearchText('');
		setSelectedSearchValue(null);
		setTimeout(() => {
			searchSelectRef.current?.focus?.();
		}, 0);
	};

	const isValid = isTemplateMode
		? selectedTransactionId !== null &&
		  entries.some((e) => e.amount && e.amount > 0)
		: entries.every(
				(e) => e.debitAccount && e.creditAccount && e.amount && e.amount > 0,
		  );

	const handleSubmit = async () => {
		if (!isValid) return;
		await onSubmit({
			entries: entries
				.filter((e) => e.amount && e.amount > 0)
				.map((e) => ({
					debitAccount: e.debitAccount,
					creditAccount: e.creditAccount,
					amount: e.amount as number,
				})),
			remarks: remarks || undefined,
			datetimeCreated: entryDate.format('YYYY-MM-DD'),
		});
	};

	// Template rows come from the transaction as-is, so they can't be removed.
	const hasMultipleRows = !isTemplateMode && entries.length > 1;
	const gridClass = `CreateJournalEntryModal_gridInputs${
		hasMultipleRows ? ' has-delete' : ''
	}`;
	const labelsClass = `CreateJournalEntryModal_gridLabels${
		hasMultipleRows ? ' has-delete' : ''
	}`;

	const isPairedWithVoucher = !!hasVoucher && isVoucherOpen;

	return (
		<Modal
			centered={!isPairedWithVoucher}
			className="CreateJournalEntryModal"
			footer={null}
			maskClosable={false}
			open={open}
			title={
				<div className="CreateJournalEntryModal_titleRow">
					<span>Create Journal Entry</span>
					<Space size={8}>
						{allowTransactionTemplate && (
							<Tooltip
								title={
									isTemplateMode
										? 'Pick accounts manually'
										: 'Use a transaction as the JE template'
								}
							>
								<Button
									icon={<ProfileOutlined />}
									size="small"
									type={isTemplateMode ? 'primary' : 'default'}
									onClick={handleTemplateModeToggle}
								>
									JE Template
								</Button>
							</Tooltip>
						)}
						{hasVoucher && (
							<Tooltip title={isVoucherOpen ? 'Hide voucher' : 'Show voucher'}>
								<Button
									icon={<FileSearchOutlined />}
									size="small"
									type={isVoucherOpen ? 'primary' : 'default'}
									onClick={() => setIsVoucherOpen((prev) => !prev)}
								>
									Voucher
								</Button>
							</Tooltip>
						)}
					</Space>
				</div>
			}
			width={760}
			wrapClassName={
				isPairedWithVoucher ? 'CreateJournalEntryModal_pairedWrap' : undefined
			}
			closable
			destroyOnClose
			keyboard
			onCancel={handleClose}
		>
			<div className="CreateJournalEntryModal_body">
				{hasVoucher &&
					isVoucherOpen &&
					renderVoucher?.(() => setIsVoucherOpen(false))}

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
						{isTemplateMode ? (
							<Select
								ref={searchSelectRef}
								className="w-100"
								loading={isFetchingTransactions}
								notFoundContent={
									isFetchingTransactions
										? 'Loading...'
										: 'No transactions found'
								}
								optionFilterProp="label"
								options={transactionOptions}
								placeholder="Select a transaction"
								value={selectedTransactionId}
								allowClear
								showSearch
								onChange={handleTransactionSelect}
							/>
						) : (
							<Select
								ref={searchSelectRef}
								className="w-100"
								disabled={!activeCell}
								filterOption={false}
								loading={isFetching}
								notFoundContent={
									isFetching ? 'Loading...' : 'No accounts found'
								}
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
						)}
					</div>

					{entries.length > 0 && (
						<div className={labelsClass}>
							<span>DEBIT</span>
							<span>CREDIT</span>
							<span>AMOUNT</span>
							{hasMultipleRows && <span />}
						</div>
					)}

					{entries.map((entry, index) => (
						<div key={index} className={gridClass}>
							<div
								role="button"
								style={{ cursor: isTemplateMode ? 'default' : 'pointer' }}
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
								style={{ cursor: isTemplateMode ? 'default' : 'pointer' }}
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

					{!isTemplateMode && (
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
					)}

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
								resetModalState(isTemplateMode);
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
			</div>
		</Modal>
	);
};
