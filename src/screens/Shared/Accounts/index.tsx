import { Tabs } from 'antd';
import { ConnectionAlert, Content } from 'components';
import { Box } from 'components/elements';
import { usePingOnlineServer, useQueryParams } from 'hooks';
import _ from 'lodash';
import React from 'react';
import { TabAccounts } from './components/TabAccounts';
import { TabCreditRegistrations } from './components/TabCreditRegistration';
import { TabEmployees } from './components/TabEmployees';
import { TabUsers } from './components/TabUsers';
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
					<Tabs.TabPane key={accountTabs.USERS} tab={accountTabs.USERS}>
						<TabUsers disabled={isConnected === false} />
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
				</Tabs>
			</Box>
		</Content>
	);
};
