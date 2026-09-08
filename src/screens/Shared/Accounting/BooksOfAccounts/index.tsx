import { message, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { appTypes, MAX_PAGE_SIZE } from 'global';
import { useJournalEntryCreate } from 'hooks';
import useAccountingTransactions from 'hooks/useAccountingTransactions';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getLocalApiUrl, getLocalBranchId } from 'utils';
import { getAppType } from 'utils/localStorage';
import {
	ExpenseVoucherService,
	JournalEntriesService,
	PurchasesService,
} from 'services';
import { ExpenseVoucher } from 'screens/Shared/Accounting/ExpenseVouchers';
import { ViewExpenseVoucherModal } from 'screens/Shared/Accounting/ExpenseVouchers/modals/ViewExpenseVoucherModal';
import { ViewPurchaseModal } from 'components/modals';
import { CashDisbursementsTab } from './components/CashDisbursementsTab';
import { CashReceiptsTab } from './components/CashReceiptsTab';
import { GeneralLedgerTab } from './components/GeneralLedgerTab';
import { SubsidiaryPurchasesTab } from './components/SubsidiaryPurchasesTab';
import { SubsidiarySalesTab } from './components/SubsidiarySalesTab';
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
	const [viewExpense, setViewExpense] = useState<ExpenseVoucher | null>(null);
	const [viewPurchase, setViewPurchase] = useState<any>(null);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

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

	const handleViewExpense = useCallback(async (expenseId: number) => {
		try {
			const response = await ExpenseVoucherService.retrieve(
				expenseId,
				getLocalApiUrl(),
			);
			setViewExpense(response.data);
		} catch {
			message.error('Failed to load expense voucher');
		}
	}, []);

	const handleViewPurchase = useCallback(async (purchaseId: number) => {
		try {
			const response = await PurchasesService.getById(
				purchaseId,
				getLocalApiUrl(),
			);
			setViewPurchase(response.data);
		} catch {
			message.error('Failed to load purchase');
		}
	}, []);

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

		if (activeTab === 'cash-receipts') {
			return 'Cash Receipts';
		}

		if (activeTab === 'cash-disbursements') {
			return 'Cash Disbursements';
		}

		if (activeTab === 'subsidiary-sales') {
			return 'Subsidiary Sales';
		}

		if (activeTab === 'subsidiary-purchases') {
			return 'Subsidiary Purchases';
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
							onViewExpense={handleViewExpense}
							onViewPurchase={handleViewPurchase}
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
					<Tabs.TabPane key="cash-receipts" tab="Cash Receipts">
						<CashReceiptsTab />
					</Tabs.TabPane>
					<Tabs.TabPane key="cash-disbursements" tab="Cash Disbursements">
						<CashDisbursementsTab />
					</Tabs.TabPane>
					<Tabs.TabPane key="subsidiary-sales" tab="Subsidiary Sales">
						<SubsidiarySalesTab />
					</Tabs.TabPane>
					<Tabs.TabPane key="subsidiary-purchases" tab="Subsidiary Purchases">
						<SubsidiaryPurchasesTab />
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
						datetimeCreated,
					}) => {
						setAuthorizeConfig({
							baseURL: getLocalApiUrl(),
							title: 'Authorize Transaction Entry',
							onSuccess: async (authorizer) => {
								setAuthorizeConfig(null);
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
													datetimeCreated,
													authorizerId: authorizer?.id,
												}),
											),
									);
									message.success('Transaction entries created successfully');
									setIsAddTransactionOpen(false);
								} catch (error) {
									message.error('Failed to create transaction entries');
								}
							},
							onCancel: () => setAuthorizeConfig(null),
						});
					}}
				/>
			)}
			{!isHeadOffice && (
				<CreateJournalEntryModal
					isSubmitting={isCreatingJournalEntry}
					open={isCreateOpen}
					onClose={() => setIsCreateOpen(false)}
					onSubmit={async ({ entries, remarks, datetimeCreated }) => {
						setAuthorizeConfig({
							baseURL: getLocalApiUrl(),
							title: 'Authorize Journal Entry',
							onSuccess: async (authorizer) => {
								setAuthorizeConfig(null);
								try {
									await Promise.all(
										entries.map((entry) =>
											createJournalEntry({
												branchId: localBranchId || undefined,
												debitAccount: entry.debitAccount,
												creditAccount: entry.creditAccount,
												amount: entry.amount,
												remarks,
												datetimeCreated,
												authorizerId: authorizer?.id,
											}),
										),
									);
									message.success('Journal entry created successfully');
									setIsCreateOpen(false);
								} catch (error) {
									message.error('Failed to create journal entry');
								}
							},
							onCancel: () => setAuthorizeConfig(null),
						});
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
			<ViewExpenseVoucherModal
				expenseVoucher={viewExpense}
				open={!!viewExpense}
				onClose={() => setViewExpense(null)}
			/>
			{viewPurchase && (
				<ViewPurchaseModal
					purchase={viewPurchase}
					onClose={() => setViewPurchase(null)}
				/>
			)}
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
			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</Content>
	);
};
