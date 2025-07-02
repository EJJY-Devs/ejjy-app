import { Tabs, Space, Badge } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useQueryParams, useTransactions } from 'hooks';
import _ from 'lodash';
import React from 'react';
import { TabBranchAssignments } from 'screens/Shared/Assignments/components/TabBranchAssignments';
import { TabDays } from 'screens/Shared/Branches/components/TabDays';
import { TabSessions } from 'screens/Shared/Branches/components/TabSessions';
import { TabBranchMachineConnectivityLogs } from 'screens/Shared/Logs/components/TabBranchMachineConnectivityLogs';
import { TabBranchProductLogs } from 'screens/Shared/Logs/components/TabBranchProductLogs';
import { useLogsStore } from 'screens/OfficeManager/Logs/stores/useLogsStore';
import { TabCancelledTransactions } from 'screens/Shared/Logs/components/TabCancelledTransactions';
import { TabCashBreakdowns } from 'screens/Shared/Logs/components/TabCashBreakdowns';
import { TabUserLogs } from 'screens/Shared/Logs/components/TabUserLogs';
import { transactionStatuses } from 'ejjy-global';
import { timeRangeTypes, refetchOptions } from 'global';
import { getLocalBranchId, isStandAlone } from 'utils';

export const tabs = {
	BRANCH_PRODUCTS: 'Branch Products',
	BRANCH_ASSIGNMENTS: 'Branch Assignments',
	BRANCH_CONNECTIVITY_LOGS: 'Branch Connectivity',
	BRANCH_DAYS: 'Branch Days',
	CASHIERING_ASSIGNMENTS: 'Cashiering Assignments',
	CASH_BREAKDOWNS: 'Cash Breakdowns',
	CASHIERING_SESSIONS: 'Cashiering Sessions',
	USERS: 'Users',
	CANCELLED_TRANSACTIONS: 'Cancelled Transactions',
};

export const Logs = () => {
	// CUSTOM HOOKS

	const setCancelledTransactionsCount = useLogsStore(
		(state: any) => state.setCancelledTransactionsCount,
	);

	const {
		data: { total: totalTransactions },
	} = useTransactions({
		params: {
			statuses: transactionStatuses.CANCELLED,
			timeRange: timeRangeTypes.DAILY,
			branchId: Number(getLocalBranchId()),
		},
		options: refetchOptions,
	});

	setCancelledTransactionsCount(totalTransactions);

	const {
		params: { tab = tabs.BRANCH_PRODUCTS },
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
					<Tabs.TabPane key={tabs.BRANCH_PRODUCTS} tab={tabs.BRANCH_PRODUCTS}>
						<TabBranchProductLogs />
					</Tabs.TabPane>

					{!isStandAlone() && (
						<Tabs.TabPane
							key={tabs.BRANCH_ASSIGNMENTS}
							tab={tabs.BRANCH_ASSIGNMENTS}
						>
							<TabBranchAssignments />
						</Tabs.TabPane>
					)}

					<Tabs.TabPane
						key={tabs.BRANCH_CONNECTIVITY_LOGS}
						tab={tabs.BRANCH_CONNECTIVITY_LOGS}
					>
						<TabBranchMachineConnectivityLogs />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.BRANCH_DAYS} tab={tabs.BRANCH_DAYS}>
						<TabDays branchId={Number(getLocalBranchId())} />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.CASH_BREAKDOWNS} tab={tabs.CASH_BREAKDOWNS}>
						<TabCashBreakdowns />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.CASHIERING_SESSIONS}
						tab={tabs.CASHIERING_SESSIONS}
					>
						<TabSessions branchId={Number(getLocalBranchId())} />
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.USERS} tab={tabs.USERS}>
						<TabUserLogs />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.CANCELLED_TRANSACTIONS}
						tab={
							<Space align="center">
								<span>{tabs.CANCELLED_TRANSACTIONS}</span>
								{totalTransactions > 0 && (
									<Badge count={totalTransactions} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabCancelledTransactions branchId={Number(getLocalBranchId())} />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};
