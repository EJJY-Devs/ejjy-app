import { Tabs } from 'antd';
import { ConnectionAlert, Content } from 'components';
import { Box } from 'components/elements';
import { usePingOnlineServer, useQueryParams } from 'hooks';
import _ from 'lodash';
import React from 'react';
import { TabAccounts } from './components/TabAccounts';
import { TabCollectionReceipts } from './components/TabCollectionReceipts';
import { TabCreditRegistrations } from './components/TabCreditRegistration';
import { TabCreditTransactions } from './components/TabCreditTransactions';
import { TabOrderOfPayments } from './components/TabOrderOfPayments';
import { TabEmployees } from './components/TabEmployees';
import { TabSupplierRegistrations } from './components/TabSupplierRegistration';
import { accountTabs } from './data';

export const Accounts = () => {
	// CUSTOM HOOKS
	const {
		params: { tab = accountTabs.ACCOUNTS },
		setQueryParams,
	} = useQueryParams();
	const { isConnected } = usePingOnlineServer();

	// METHODS
	const handleTabClick = (selectedTab) => {
		setQueryParams(
			{ tab: selectedTab },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	return (
		<Content title="Accounts">
			<ConnectionAlert />

			<Box>
				<Tabs
					activeKey={_.toString(tab)}
					className="pa-6"
					type="card"
					destroyInactiveTabPane
					onTabClick={handleTabClick}
				>
					<Tabs.TabPane key={accountTabs.ACCOUNTS} tab={accountTabs.ACCOUNTS}>
						<TabAccounts disabled={isConnected === false} />
					</Tabs.TabPane>

					<Tabs.TabPane key={accountTabs.EMPLOYEES} tab={accountTabs.EMPLOYEES}>
						<TabEmployees disabled={isConnected === false} />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={accountTabs.CREDIT_ACCOUNTS}
						tab={accountTabs.CREDIT_ACCOUNTS}
					>
						<TabCreditRegistrations disabled={isConnected === false} />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={accountTabs.SUPPLIER_ACCOUNTS}
						tab={accountTabs.SUPPLIER_ACCOUNTS}
					>
						<TabSupplierRegistrations disabled={isConnected === false} />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={accountTabs.CREDIT_TRANSACTIONS}
						tab={accountTabs.CREDIT_TRANSACTIONS}
					>
						<TabCreditTransactions />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={accountTabs.ORDER_OF_PAYMENTS}
						tab={accountTabs.ORDER_OF_PAYMENTS}
					>
						<TabOrderOfPayments />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={accountTabs.COLLECTION_RECEIPTS}
						tab={accountTabs.COLLECTION_RECEIPTS}
					>
						<TabCollectionReceipts />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};
