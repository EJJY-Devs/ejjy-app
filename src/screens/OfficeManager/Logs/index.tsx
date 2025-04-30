import { Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useQueryParams } from 'hooks';
import _ from 'lodash';
import React from 'react';
import { TabBranchAssignments } from 'screens/Shared/Assignments/components/TabBranchAssignments';
import { TabSessionAssignments } from 'screens/Shared/Assignments/components/TabSessionAssignments';
import { TabDays } from 'screens/Shared/Branches/components/TabDays';
import { TabSessions } from 'screens/Shared/Branches/components/TabSessions';
import { TabBranchProductLogs } from 'screens/Shared/Logs/components/TabBranchProductLogs';
import { TabCashBreakdowns } from 'screens/Shared/Logs/components/TabCashBreakdowns';
import { TabUserLogs } from 'screens/Shared/Logs/components/TabUserLogs';
import { TabCancelledTransactions } from 'screens/Shared/Logs/components/TabCancelledTransactions';
import { TabBranchConnectivityLogs } from './components/TabBranchConnectivityLogs';
import { TabProductLogs } from './components/TabProductLogs';

export const tabs = {
	PRODUCTS: 'Products',
	BRANCH_PRODUCTS: 'Branch Products',
	BRANCH_ASSIGNMENTS: 'Branch Assignments',
	BRANCH_DAYS: 'Branch Days',
	BRANCH_CONNECTIVITY_LOGS: 'Branch Connectivity Logs',
	CASHIERING_ASSIGNMENTS: 'Cashiering Assignments',
	CASH_BREAKDOWNS: 'Cash Breakdowns',
	CASHIERING_SESSIONS: 'Cashiering Sessions',
	USERS: 'Users',
	CANCELLED_TRANSACTIONS: 'Cancelled Transactions',
};

export const Logs = () => {
	// CUSTOM HOOKS
	const {
		params: { tab = tabs.PRODUCTS },
		setQueryParams,
	} = useQueryParams();

	// METHODS
	const handleTabClick = (selectedTab) => {
		setQueryParams(
			{ tab: selectedTab },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	return (
		<Content title="Logs">
			<Box>
				<Tabs
					activeKey={_.toString(tab)}
					className="pa-6"
					type="card"
					destroyInactiveTabPane
					onTabClick={handleTabClick}
				>
					<Tabs.TabPane key={tabs.PRODUCTS} tab={tabs.PRODUCTS}>
						<TabProductLogs />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.BRANCH_PRODUCTS} tab={tabs.BRANCH_PRODUCTS}>
						<TabBranchProductLogs />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.BRANCH_ASSIGNMENTS}
						tab={tabs.BRANCH_ASSIGNMENTS}
					>
						<TabBranchAssignments />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.BRANCH_CONNECTIVITY_LOGS}
						tab={tabs.BRANCH_CONNECTIVITY_LOGS}
					>
						<TabBranchConnectivityLogs />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.BRANCH_DAYS} tab={tabs.BRANCH_DAYS}>
						<TabDays />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.CASHIERING_ASSIGNMENTS}
						tab={tabs.CASHIERING_ASSIGNMENTS}
					>
						<TabSessionAssignments />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.CASH_BREAKDOWNS} tab={tabs.CASH_BREAKDOWNS}>
						<TabCashBreakdowns />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.CASHIERING_SESSIONS}
						tab={tabs.CASHIERING_SESSIONS}
					>
						<TabSessions />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.USERS} tab={tabs.USERS}>
						<TabUserLogs />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.CANCELLED_TRANSACTIONS}
						tab={tabs.CANCELLED_TRANSACTIONS}
					>
						<TabCancelledTransactions />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};
