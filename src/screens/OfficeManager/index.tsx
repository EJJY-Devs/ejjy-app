import { Container } from 'components';
import {
	useUploadData,
	useSalesTrackerCount,
	useBranchProducts,
	useProductSyncStatus,
} from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { refetchOptions } from 'global';
import {
	useNotificationConnectivity,
	useNotificationDtr,
} from 'screens/OfficeManager/Notifications/hooks';
import { useNotificationStore } from 'screens/OfficeManager/Notifications/stores/useNotificationStore';
import { useLogsStore } from 'screens/OfficeManager/Logs/stores/useLogsStore';
import { Accounts } from 'screens/Shared/Accounts';
import { ViewAccount } from 'screens/Shared/Accounts/ViewAccount';
import { Assignments } from 'screens/Shared/Assignments';
import { Branches } from 'screens/Shared/Branches';
import { ViewBranch } from 'screens/Shared/Branches/ViewBranch';
import { DTR } from 'screens/Shared/DTR';
import { DiscountOptions } from 'screens/Shared/DiscountOptions';
import { PatronageSystemTags } from 'screens/Shared/PatronageSystemTags/PatronageSystemTagsView';
import { ProductCategories } from 'screens/Shared/ProductCategories';
import { ProductGroups } from 'screens/Shared/ProductGroups';
import { ModifyProductGroup } from 'screens/Shared/ProductGroups/ModifyProductGroup';
import { Products } from 'screens/Shared/Products';
import { Tags } from 'screens/Shared/Tags';
import { Reports } from 'screens/Shared/Reports';
import { Sales } from 'screens/Shared/Sales';
import { SiteSettings } from 'screens/Shared/SiteSettings';
import { getAccountingSidebarItems } from 'screens/Shared/Accounting/navigation';
import { CashieringAssignment } from 'screens/Shared/Users/CashieringAssignment';
import { ViewBranchMachine } from 'screens/Shared/ViewBranchMachine';
import shallow from 'zustand/shallow';
import { InventoryTransfer } from 'screens/Shared/InventoryTransfer';
import { ProductConversion } from 'screens/Shared/ProductConversion';
import { AdjustmentSlip } from 'screens/Shared/Adjustment Slip';
import { ChartOfAccounts } from 'screens/Shared/Accounting/ChartOfAccounts';
import { Checkings } from './Checkings/Checkings';
import { ViewChecking } from './Checkings/ViewChecking';
import { Dashboard } from './Dashboard';
import { Logs } from './Logs';
import { Notifications } from './Notifications';
import { RequisitionSlips } from './RequisitionSlips';
import { ViewRequisitionSlip } from './RequisitionSlips/ViewRequisitionSlip';

const OfficeManager = () => {
	const { pathname } = useLocation();
	const isAccounting = pathname.startsWith('/office-manager/accounting');

	useNotificationConnectivity();
	useNotificationDtr();
	useUploadData({
		params: { isBackOffice: false },
	});

	// STATE
	const [logsCount, setLogsCount] = useState(0);
	const [notificationsCount, setNotificationsCount] = useState(0);

	const { connectivityCount, dtrCount } = useNotificationStore(
		(state: any) => ({
			connectivityCount: state.connectivityCount,
			dtrCount: state.dtrCount,
		}),
		shallow,
	);

	const { cancelledTransactionsCount } = useLogsStore(
		(state: any) => ({
			cancelledTransactionsCount: state.cancelledTransactionsCount,
		}),
		shallow,
	);

	const {
		data: { total: branchProductsNegativeBalanceCount },
	} = useBranchProducts({
		params: {
			hasNegativeBalance: true,
		},
		options: refetchOptions,
	});

	const {
		data: { total: unsyncedProductsCount },
	} = useProductSyncStatus({
		params: {
			out_of_sync_only: true,
			pageSize: 1,
		},
		options: refetchOptions,
	});

	const salesTrackerCount = useSalesTrackerCount();

	useEffect(() => {
		const newLogsCount = cancelledTransactionsCount > 0 ? 1 : 0;

		if (newLogsCount !== logsCount) {
			setLogsCount(newLogsCount);
		}
	}, [cancelledTransactionsCount]);

	useEffect(() => {
		const newNotificationsCount =
			(salesTrackerCount > 0 ? 1 : 0) +
			(dtrCount > 0 ? 1 : 0) +
			(connectivityCount > 0 ? 1 : 0) +
			(branchProductsNegativeBalanceCount > 0 ? 1 : 0) +
			(unsyncedProductsCount > 0 ? 1 : 0);
		if (newNotificationsCount !== notificationsCount) {
			setNotificationsCount(newNotificationsCount);
		}
	}, [
		salesTrackerCount,
		dtrCount,
		connectivityCount,
		branchProductsNegativeBalanceCount,
		unsyncedProductsCount,
	]);

	const getSidebarItems = useCallback(() => {
		if (isAccounting) {
			return getAccountingSidebarItems('/office-manager');
		}

		return [
			{
				key: 'dashboard',
				name: 'Dashboard',
				activeIcon: require('../../assets/images/icon-dashboard-active.svg'),
				defaultIcon: require('../../assets/images/icon-dashboard.svg'),
				link: '/office-manager/dashboard',
			},
			{
				key: 'sales',
				name: 'Sales',
				activeIcon: require('../../assets/images/icon-sales-active.svg'),
				defaultIcon: require('../../assets/images/icon-sales.svg'),
				link: '/office-manager/sales',
			},
			{
				key: 'reports',
				name: 'Reports',
				activeIcon: require('../../assets/images/icon-report-active.svg'),
				defaultIcon: require('../../assets/images/icon-report.svg'),
				link: '/office-manager/reports',
			},
			{
				key: 'products',
				name: 'Products',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/office-manager/products',
			},
			{
				key: 'tags',
				name: 'Tags',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/office-manager/tags',
			},
			{
				key: 'branches',
				name: 'Branches',
				activeIcon: require('../../assets/images/icon-branches-active.svg'),
				defaultIcon: require('../../assets/images/icon-branches.svg'),
				link: '/office-manager/branches',
			},
			{
				key: 'accounts',
				name: 'Accounts',
				activeIcon: require('../../assets/images/icon-users-active.svg'),
				defaultIcon: require('../../assets/images/icon-users.svg'),
				link: '/office-manager/accounts',
			},
			{
				key: 'assignments',
				name: 'Assignments',
				activeIcon: require('../../assets/images/icon-users-active.svg'),
				defaultIcon: require('../../assets/images/icon-users.svg'),
				link: '/office-manager/assignments',
			},
			{
				key: 'dtr',
				name: 'DTR',
				activeIcon: require('../../assets/images/icon-users-active.svg'),
				defaultIcon: require('../../assets/images/icon-users.svg'),
				link: '/office-manager/dtr',
			},
			{
				key: 'discount-options',
				name: 'Discount Options',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/office-manager/discount-options',
			},
			{
				key: 'settings',
				name: 'Settings',
				activeIcon: require('../../assets/images/icon-settings-active.svg'),
				defaultIcon: require('../../assets/images/icon-settings.svg'),
				link: '/office-manager/settings',
			},
			// {
			// 	key: 'checking',
			// 	name: 'Checking',
			// 	activeIcon: require('../../assets/images/icon-checking-active.svg'),
			// 	defaultIcon: require('../../assets/images/icon-checking.svg'),
			// 	link: '/office-manager/checkings',
			// },
			{
				key: 'product-conversion',
				name: 'Product Conversion',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/office-manager/product-conversion',
			},
			{
				key: 'inventory-transfer',
				name: 'Inventory Transfer',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/office-manager/inventory-transfer',
			},
			{
				key: 'adjustment-slips',
				name: 'Adjustment Slips',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/office-manager/adjustment-slips',
			},
			{
				key: 'requisition-slips',
				name: 'Branch Requisitions',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/office-manager/requisition-slips',
			},
			{
				key: 'return-item-slips',
				name: 'Return Item Slips',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/office-manager/return-item-slips',
			},
			// {
			// 	key: 'back-orders',
			// 	name: 'Back Orders',
			// 	activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
			// 	defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
			// 	link: '/office-manager/back-orders',
			// },
			// {
			// 	key: 'pending-transactions',
			// 	name: 'Pending Transactions',
			// 	activeIcon: require('../../assets/images/icon-failed-transfers-active.svg'),
			// 	defaultIcon: require('../../assets/images/icon-failed-transfers.svg'),
			// 	link: '/office-manager/pending-transactions',
			// },
			{
				key: 'logs',
				name: 'Logs',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/office-manager/logs',
				count: logsCount,
			},
			{
				key: 'notifications',
				name: 'Notifications',
				activeIcon: require('../../assets/images/icon-notifications-active.svg'),
				defaultIcon: require('../../assets/images/icon-notifications.svg'),
				link: '/office-manager/notifications',
				count: notificationsCount,
			},
		];
	}, [isAccounting, notificationsCount, logsCount]);

	return (
		<Container sidebarItems={getSidebarItems()}>
			<React.Suspense fallback={<div>Loading...</div>}>
				<Switch>
					<Route
						component={Products}
						path="/office-manager/accounting/products"
					/>
					<Route
						component={ChartOfAccounts}
						path="/office-manager/accounting/chart-of-accounts"
					/>
					<Redirect
						from="/office-manager/accounting"
						to="/office-manager/accounting/chart-of-accounts"
						exact
					/>

					<Route component={Products} path="/office-manager/products" />

					<Route
						path="/office-manager/tags"
						render={() => <Tags basePath="/office-manager" />}
					/>

					<Route
						component={ProductCategories}
						path="/office-manager/product-categories"
					/>

					<Route
						component={PatronageSystemTags}
						path="/office-manager/patronage-system-tags"
					/>

					<Route component={Branches} path="/office-manager/branches" exact />
					<Route
						component={ViewBranch}
						path="/office-manager/branches/:id"
						exact
					/>

					<Route
						component={ViewBranchMachine}
						path="/office-manager/branch-machines/:id"
						exact
					/>

					<Route
						component={ProductConversion}
						path="/office-manager/product-conversion"
						exact
					/>

					<Route
						component={InventoryTransfer}
						path="/office-manager/inventory-transfer"
						exact
					/>

					<Route
						component={AdjustmentSlip}
						path="/office-manager/adjustment-slips"
						exact
					/>

					<Route
						component={CashieringAssignment}
						path="/office-manager/users/assign/:id"
						exact
					/>

					<Route component={Accounts} path="/office-manager/accounts" exact />
					<Route
						component={ViewAccount}
						path="/office-manager/accounts/:id"
						exact
					/>

					<Route
						component={Assignments}
						path="/office-manager/assignments"
						exact
					/>

					<Route component={DTR} path="/office-manager/dtr" />

					<Route
						component={DiscountOptions}
						path="/office-manager/discount-options"
					/>

					<Route component={SiteSettings} path="/office-manager/settings" />

					<Route component={Sales} path="/office-manager/sales" />

					{/* Disabled as of the moment */}
					<Route component={Dashboard} path="/office-manager/dashboard" />

					<Route component={Checkings} path="/office-manager/checkings" exact />
					<Route
						component={ViewChecking}
						path="/office-manager/checkings/:branchId/:id"
						exact
					/>

					<Route
						component={ProductGroups}
						path="/office-manager/product-groups"
						exact
					/>

					<Route
						component={ModifyProductGroup}
						path="/office-manager/product-groups/create"
						exact
					/>
					<Route
						component={ModifyProductGroup}
						path="/office-manager/product-groups/edit/:id"
						exact
					/>

					<Route
						component={RequisitionSlips}
						path="/office-manager/requisition-slips"
						exact
					/>
					<Route
						component={ViewRequisitionSlip}
						path="/office-manager/requisition-slips/:id"
						exact
					/>

					<Route component={Logs} path="/office-manager/logs" />

					<Route
						component={Notifications}
						path="/office-manager/notifications"
					/>
					<Route component={Reports} path="/office-manager/reports" />

					<Redirect to="/office-manager/products" />
				</Switch>
			</React.Suspense>
		</Container>
	);
};

export default OfficeManager;
