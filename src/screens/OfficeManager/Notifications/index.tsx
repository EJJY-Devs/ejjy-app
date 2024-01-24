import { Badge, Space, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useBranchProducts, useQueryParams, useSalesTrackerCount } from 'hooks';
import _ from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { TabSalesTracker } from 'screens/Shared/Notifications/components/TabSalesTracker';
import { TabBranchProducts } from 'screens/Shared/Notifications/components/TabBranchProducts';
import { MAX_PAGE_SIZE } from 'global';
import { TabBranchStatus } from './components/TabBranchStatus';
import { TabDTR } from './components/TabDTR';
import { useNotificationStore } from './stores/useNotificationStore';

const tabs = {
	DTR: 'DTR',
	BRANCH_CONNECTIVITY: 'Branch Connectivity',
	BRANCH_PRODUCTS: 'Branch Products',
	SALES_TRACKER: 'Sales Tracker',
};

export const Notifications = () => {
	// CUSTOM HOOKS
	const {
		params: { tab = tabs.DTR },
		setQueryParams,
	} = useQueryParams();
	const { connectivityCount, dtrCount } = useNotificationStore(
		(state: any) => ({
			connectivityCount: state.connectivityCount,
			dtrCount: state.dtrCount,
		}),
		shallow,
	);
	const {
		data: { total: branchProductsCount },
	} = useBranchProducts({
		params: {
			hasNegativeBalance: true,
			pageSize: MAX_PAGE_SIZE,
		},
		options: { notifyOnChangeProps: ['data'] },
	});
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
					defaultActiveKey={tabs.DTR}
					type="card"
					onTabClick={handleTabClick}
				>
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
						key={tabs.BRANCH_CONNECTIVITY}
						tab={
							<Space align="center">
								<span>{tabs.BRANCH_CONNECTIVITY}</span>
								{connectivityCount > 0 && (
									<Badge count={connectivityCount} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabBranchStatus />
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
