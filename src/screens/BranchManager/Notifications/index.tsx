import { Badge, Space, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { MAX_PAGE_SIZE } from 'global';
import {
	useBranchProducts,
	usePurchaseCostNotifications,
	usePurchaseOrderQtyNotifications,
	useQueryParams,
	useSalesTrackerCount,
	useDtrNotificationCount,
} from 'hooks';
import _ from 'lodash';
import React from 'react';
import { TabBranchProducts } from 'screens/Shared/Notifications/components/TabBranchProducts';
import { TabPurchaseCostNotifications } from 'screens/Shared/Notifications/components/TabPurchaseCostNotifications';
import { TabPurchaseOrderQtyNotifications } from 'screens/Shared/Notifications/components/TabPurchaseOrderQtyNotifications';
import { TabSalesTracker } from 'screens/Shared/Notifications/components/TabSalesTracker';
import { getLocalBranchId } from 'utils';
import { TabDTR } from './components/TabDTR';

const tabs = {
	BRANCH_PRODUCTS: 'Branch Products',
	DTR: 'DTR',
	PO_QTY: 'PO Mismatch',
	PURCHASE_COST_CHANGES: 'Purchase Cost Changes',
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
	const {
		data: { total: purchaseCostChangesCount },
	} = usePurchaseCostNotifications({
		params: {
			branchId: Number(getLocalBranchId()) || undefined,
			isResolved: false,
			pageSize: 1,
		},
		options: { notifyOnChangeProps: ['data'] },
	});
	const {
		data: { total: poQtyCount },
	} = usePurchaseOrderQtyNotifications({
		params: {
			branchId: Number(getLocalBranchId()) || undefined,
			isResolved: false,
			pageSize: 1,
		},
		options: { notifyOnChangeProps: ['data'] },
	});

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

					<Tabs.TabPane
						key={tabs.PURCHASE_COST_CHANGES}
						tab={
							<Space align="center">
								<span>{tabs.PURCHASE_COST_CHANGES}</span>
								{purchaseCostChangesCount > 0 && (
									<Badge count={purchaseCostChangesCount} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabPurchaseCostNotifications
							branchId={Number(getLocalBranchId()) || undefined}
						/>
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.PO_QTY}
						tab={
							<Space align="center">
								<span>{tabs.PO_QTY}</span>
								{poQtyCount > 0 && (
									<Badge count={poQtyCount} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabPurchaseOrderQtyNotifications
							branchId={Number(getLocalBranchId()) || undefined}
						/>
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};
