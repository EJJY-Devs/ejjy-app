import { Badge, Space, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { MAX_PAGE_SIZE } from 'global';
import {
	useBranchProducts,
	useQueryParams,
	useSalesTrackerCount,
	useDtrNotificationCount,
} from 'hooks';
import _ from 'lodash';
import React from 'react';
import { TabBranchProducts } from 'screens/Shared/Notifications/components/TabBranchProducts';
import { TabSalesTracker } from 'screens/Shared/Notifications/components/TabSalesTracker';
import { TabDTR } from './components/TabDTR';

const tabs = {
	BRANCH_PRODUCTS: 'Branch Products',
	DTR: 'DTR',
	SALES_TRACKER: 'Sales Tracker',
};

export const Notifications = () => {
	// CUSTOM HOOKS
	const {
		params: { tab = tabs.BRANCH_PRODUCTS },
		setQueryParams,
	} = useQueryParams();
	const {
		data: { total: branchProductsCount },
	} = useBranchProducts({
		params: {
			hasNegativeBalance: true,
			pageSize: MAX_PAGE_SIZE,
		},
		options: { notifyOnChangeProps: ['data'] },
	});

	const dtrCount = useDtrNotificationCount();
	const salesTrackerCount = useSalesTrackerCount();

	// METHODS
	const handleTabClick = (selectedTab) => {
		setQueryParams(
			{ tab: selectedTab },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	return (
		<Content title="Notifications">
			<Box>
				<Tabs
					activeKey={_.toString(tab)}
					className="pa-6"
					type="card"
					destroyInactiveTabPane
					onTabClick={handleTabClick}
				>
					<Tabs.TabPane
						key={tabs.BRANCH_PRODUCTS}
						tab={
							<Space align="center">
								<span>{tabs.BRANCH_PRODUCTS}</span>
								{branchProductsCount > 0 && (
									<Badge count={branchProductsCount} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabBranchProducts />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.DTR}
						tab={
							<Space align="center">
								<span>{tabs.DTR}</span>
								{dtrCount > 0 && <Badge count={dtrCount} overflowCount={999} />}
							</Space>
						}
					>
						<TabDTR />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.SALES_TRACKER}
						tab={
							<Space align="center">
								<span>{tabs.SALES_TRACKER}</span>
								{salesTrackerCount > 0 && (
									<Badge count={salesTrackerCount} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabSalesTracker />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};
