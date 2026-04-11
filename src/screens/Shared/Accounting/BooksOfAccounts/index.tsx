import { message, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { appTypes, MAX_PAGE_SIZE } from 'global';
import { useJournalEntryCreate } from 'hooks';
import useAccountingTransactions from 'hooks/useAccountingTransactions';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getLocalApiUrl, getLocalBranchId } from 'utils';
import { getAppType } from 'utils/localStorage';
import { JournalEntriesService } from 'services';
import { GeneralLedgerTab } from './components/GeneralLedgerTab';
import { TrialBalanceTab } from './components/TrialBalanceTab';
import {
	GeneralJournalEntry,
	GeneralJournalTab,
} from './components/GeneralJournalTab';
import { AddTransactionEntryModal } from '../modals/AddTransactionEntryModal';
import { CreateJournalEntryModal } from '../modals/CreateJournalEntryModal';
import { ViewJournalEntryModal } from '../modals/ViewJournalEntryModal';
import {
	ViewTransactionModal,
	Transaction,
} from '../modals/ViewTransactionModal';
import './style.scss';

export const BooksOfAccounts = () => {
	const history = useHistory();
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;
	const localBranchId = Number(getLocalBranchId());
	const [activeTab, setActiveTab] = useState('general-journal');
	const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [isViewTransactionOpen, setIsViewTransactionOpen] = useState(false);
	const [
		selectedEntry,
		setSelectedEntry,
	] = useState<GeneralJournalEntry | null>(null);
	const [viewTransaction, setViewTransaction] = useState<Transaction | null>(
		null,
	);
	const [viewTransactionRemarks, setViewTransactionRemarks] = useState('');

	const {
		mutateAsync: createJournalEntry,
		isLoading: isCreatingJournalEntry,
	} = useJournalEntryCreate();

	const { data: transactionsData } = useAccountingTransactions({
		params: {
			page: 1,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const handleOpenJournalEntry = useCallback((entry: GeneralJournalEntry) => {
		setSelectedEntry(entry);
		setIsViewOpen(true);
	}, []);

	const handleViewTransaction = useCallback(
		async (transactionId: number, description: string) => {
			const txn = (transactionsData?.accountingTransactions || []).find(
				(t: any) => t.id === transactionId,
			);

			let entriesWithAmounts: {
				debitAccount: string;
				creditAccount: string;
				amount?: number;
			}[] = [];

			try {
				const response = await JournalEntriesService.list(
					{
						search: `TXN-${transactionId}`,
						entry_type: 'transaction',
						page: 1,
						page_size: MAX_PAGE_SIZE,
					},
					getLocalApiUrl(),
				);
				const journalEntries = response.data.results || [];

				if (txn) {
					const templateEntries = (txn.entries || []).map((e: any) => ({
						debitAccount: e.debit_account,
						creditAccount: e.credit_account,
					}));

					const usedJeIndices = new Set<number>();
					entriesWithAmounts = templateEntries.map((te: any) => {
						const jeIndex = journalEntries.findIndex(
							(je: any, idx: number) =>
								!usedJeIndices.has(idx) &&
								je.debit_account === te.debitAccount &&
								je.credit_account === te.creditAccount,
						);
						if (jeIndex !== -1) {
							usedJeIndices.add(jeIndex);
							return { ...te, amount: journalEntries[jeIndex].amount };
						}
						return te;
					});
				} else {
					entriesWithAmounts = journalEntries.map((je: any) => ({
						debitAccount: je.debit_account,
						creditAccount: je.credit_account,
						amount: je.amount,
					}));
				}
			} catch {
				if (txn) {
					entriesWithAmounts = (txn.entries || []).map((e: any) => ({
						debitAccount: e.debit_account,
						creditAccount: e.credit_account,
					}));
				}
			}

			setViewTransaction({
				id: txn?.id ?? transactionId,
				name: txn?.name ?? '',
				information: txn?.information ?? '',
				entries: entriesWithAmounts,
			});
			setViewTransactionRemarks(description);
			setIsViewTransactionOpen(true);
		},
		[transactionsData],
	);

	const getRightTitle = () => {
		if (activeTab === 'general-ledger') {
			return 'General Ledger';
		}

		if (activeTab === 'trial-balance') {
			return 'Trial Balance';
		}

		return 'General Journal';
	};

	const rightTitle = getRightTitle();

	return (
		<Content rightTitle={rightTitle} title="Books of Accounts">
			<Box padding>
				<Tabs
					className="BooksOfAccounts_tabs"
					defaultActiveKey="general-journal"
					type="card"
					destroyInactiveTabPane
					onChange={(key) => {
						setActiveTab(key);
						history.replace({ search: '' });
					}}
				>
					<Tabs.TabPane key="general-journal" tab="General Journal">
						<GeneralJournalTab
							isHeadOffice={isHeadOffice}
							localBranchId={localBranchId}
							onAddTransactionEntry={() => setIsAddTransactionOpen(true)}
							onCreateJournalEntry={() => setIsCreateOpen(true)}
							onOpenJournalEntry={handleOpenJournalEntry}
							onViewTransaction={handleViewTransaction}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane key="general-ledger" tab="General Ledger">
						<GeneralLedgerTab
							isHeadOffice={isHeadOffice}
							localBranchId={localBranchId}
							onOpenJournalEntry={handleOpenJournalEntry}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane key="trial-balance" tab="Trial Balance">
						<TrialBalanceTab
							isHeadOffice={isHeadOffice}
							localBranchId={localBranchId}
						/>
					</Tabs.TabPane>
				</Tabs>
			</Box>
			{!isHeadOffice && (
				<AddTransactionEntryModal
					open={isAddTransactionOpen}
					onClose={() => setIsAddTransactionOpen(false)}
					onSubmit={async ({
						transactionId,
						transactionName,
						entries,
						remarks,
					}) => {
						try {
							const remarksText = `${transactionName} (TXN-${transactionId})`;
							await Promise.all(
								entries
									.filter((entry) => entry.amount && entry.amount > 0)
									.map((entry) =>
										createJournalEntry({
											branchId: localBranchId || undefined,
											entryType: 'transaction',
											debitAccount: entry.debitAccount,
											creditAccount: entry.creditAccount,
											amount: entry.amount,
											remarks: remarksText,
											description: remarks,
										}),
									),
							);
							message.success('Transaction entries created successfully');
							setIsAddTransactionOpen(false);
						} catch (error) {
							message.error('Failed to create transaction entries');
						}
					}}
				/>
			)}
			{!isHeadOffice && (
				<CreateJournalEntryModal
					isSubmitting={isCreatingJournalEntry}
					open={isCreateOpen}
					onClose={() => setIsCreateOpen(false)}
					onSubmit={async ({
						debitAccount,
						creditAccount,
						amount,
						remarks,
					}) => {
						try {
							await createJournalEntry({
								branchId: localBranchId || undefined,
								debitAccount,
								creditAccount,
								amount,
								remarks,
							});

							message.success('Journal entry created successfully');
							setIsCreateOpen(false);
						} catch (error) {
							message.error('Failed to create journal entry');
						}
					}}
				/>
			)}
			<ViewJournalEntryModal
				entry={selectedEntry}
				isHeadOffice={isHeadOffice}
				open={isViewOpen}
				onClose={() => {
					setIsViewOpen(false);
					setSelectedEntry(null);
				}}
				onViewTransaction={handleViewTransaction}
			/>
			<ViewTransactionModal
				open={isViewTransactionOpen}
				remarks={viewTransactionRemarks}
				transaction={viewTransaction}
				onClose={() => {
					setIsViewTransactionOpen(false);
					setViewTransaction(null);
					setViewTransactionRemarks('');
				}}
			/>
		</Content>
	);
};
