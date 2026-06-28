import { Badge, Space, Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import {
	useBranchProducts,
	usePurchaseCostNotifications,
	usePurchaseOrderQtyNotifications,
	useProductSyncStatus,
	useQueryParams,
	useSalesTrackerCount,
	useVoidedTransactionsCount,
} from 'hooks';
import _ from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { TabSalesTracker } from 'screens/Shared/Notifications/components/TabSalesTracker';
import { TabBranchProducts } from 'screens/Shared/Notifications/components/TabBranchProducts';
import { TabPurchaseCostNotifications } from 'screens/Shared/Notifications/components/TabPurchaseCostNotifications';
import { TabPurchaseOrderQtyNotifications } from 'screens/Shared/Notifications/components/TabPurchaseOrderQtyNotifications';
import { TabVoidedTransactions } from 'screens/Shared/Notifications/components/TabVoidedTransactions';
import { MAX_PAGE_SIZE } from 'global';
import { TabBranchStatus } from './components/TabBranchStatus';
import { TabDTR } from './components/TabDTR';
import { TabProductPricesSyncing } from './components/TabProductPricesSyncing';
import { useNotificationStore } from './stores/useNotificationStore';

const tabs = {
	DTR: 'DTR',
	BRANCH_CONNECTIVITY: 'Branch Connectivity',
	BRANCH_PRODUCTS: 'Branch Products',
	PRODUCT_PRICES_SYNCING: 'Product Prices Syncing',
	PURCHASE_COST_CHANGES: 'Purchase Cost Changes',
	PO_QTY: 'PO Mismatch',
	SALES_TRACKER: 'Sales Tracker',
	VOIDED_TRANSACTIONS: 'Voided Transactions',
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
	const { data: voidedTransactionsCount } = useVoidedTransactionsCount();
	const {
		data: { total: purchaseCostChangesCount },
	} = usePurchaseCostNotifications({
		params: { isResolved: false, pageSize: 1 },
		options: { notifyOnChangeProps: ['data'] },
	});
	const {
		data: { total: poQtyCount },
	} = usePurchaseOrderQtyNotifications({
		params: { isResolved: false, pageSize: 1 },
		options: { notifyOnChangeProps: ['data'] },
	});
	const {
		data: { total: unsyncedProductsCount },
	} = useProductSyncStatus({
		params: {
			out_of_sync_only: true,
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
						key={tabs.PRODUCT_PRICES_SYNCING}
						tab={
							<Space align="center">
								<span>{tabs.PRODUCT_PRICES_SYNCING}</span>
								{unsyncedProductsCount > 0 && (
									<Badge count={unsyncedProductsCount} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabProductPricesSyncing />
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
						key={tabs.VOIDED_TRANSACTIONS}
						tab={
							<Space align="center">
								<span>{tabs.VOIDED_TRANSACTIONS}</span>
								{voidedTransactionsCount > 0 && (
									<Badge count={voidedTransactionsCount} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabVoidedTransactions />
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
						<TabPurchaseCostNotifications />
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
						<TabPurchaseOrderQtyNotifications />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};
