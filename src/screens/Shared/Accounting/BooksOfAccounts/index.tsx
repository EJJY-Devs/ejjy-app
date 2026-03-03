import { message, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { appTypes } from 'global';
import { useJournalEntryCreate } from 'hooks';
import React, { useState } from 'react';
import { getLocalBranchId } from 'utils';
import { getAppType } from 'utils/localStorage';
import { GeneralLedgerTab } from './components/GeneralLedgerTab';
import {
	GeneralJournalEntry,
	GeneralJournalTab,
} from './components/GeneralJournalTab';
import { CreateJournalEntryModal } from '../modals/CreateJournalEntryModal';
import { ViewJournalEntryModal } from '../modals/ViewJournalEntryModal';
import './style.scss';

export const BooksOfAccounts = () => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;
	const localBranchId = Number(getLocalBranchId());
	const [activeTab, setActiveTab] = useState('general-journal');
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [
		selectedEntry,
		setSelectedEntry,
	] = useState<GeneralJournalEntry | null>(null);

	const {
		mutateAsync: createJournalEntry,
		isLoading: isCreatingJournalEntry,
	} = useJournalEntryCreate();

	const rightTitle =
		activeTab === 'general-ledger' ? 'General Ledger' : 'General Journal';

	return (
		<Content rightTitle={rightTitle} title="Books of Accounts">
			<Box padding>
				<Tabs
					className="BooksOfAccounts_tabs"
					defaultActiveKey="general-journal"
					type="card"
					onChange={setActiveTab}
				>
					<Tabs.TabPane key="general-journal" tab="General Journal">
						<GeneralJournalTab
							isHeadOffice={isHeadOffice}
							localBranchId={localBranchId}
							onCreateJournalEntry={() => setIsCreateOpen(true)}
							onOpenJournalEntry={(entry) => {
								setSelectedEntry(entry);
								setIsViewOpen(true);
							}}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane key="general-ledger" tab="General Ledger">
						<GeneralLedgerTab
							isHeadOffice={isHeadOffice}
							localBranchId={localBranchId}
							onOpenJournalEntry={(entry) => {
								setSelectedEntry(entry);
								setIsViewOpen(true);
							}}
						/>
					</Tabs.TabPane>
				</Tabs>
			</Box>
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
			/>
		</Content>
	);
};
