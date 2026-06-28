import { Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { appTypes } from 'global';
import React from 'react';
import { getAppType } from 'utils';
import { GeneralJournalTab } from './components/GeneralJournalTab';
import { ExpensesTab } from './components/ExpensesTab';
import './style.scss';

export const TransactionList = () => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	return (
		<Content title="Transaction List">
			<Box padding>
				<Tabs
					className="TransactionList_tabs"
					defaultActiveKey="general-journal"
					type="card"
					destroyInactiveTabPane
				>
					<Tabs.TabPane key="general-journal" tab="General Journal">
						<GeneralJournalTab isHeadOffice={isHeadOffice} />
					</Tabs.TabPane>
					<Tabs.TabPane key="expenses" tab="Expenses">
						<ExpensesTab isHeadOffice={isHeadOffice} />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};
