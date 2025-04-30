import { Container } from 'components';
import { useUploadData } from 'hooks';
import React, { useCallback } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
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
import { PointSystemTags } from 'screens/Shared/PointSystemTags';
import { ProductCategories } from 'screens/Shared/ProductCategories';
import { ProductGroups } from 'screens/Shared/ProductGroups';
import { ModifyProductGroup } from 'screens/Shared/ProductGroups/ModifyProductGroup';
import { Products } from 'screens/Shared/Products';
import { Reports } from 'screens/Shared/Reports';
import { Sales } from 'screens/Shared/Sales';
import { SiteSettings } from 'screens/Shared/SiteSettings';
import { CashieringAssignment } from 'screens/Shared/Users/CashieringAssignment';
import { ViewBranchMachine } from 'screens/Shared/ViewBranchMachine';
import shallow from 'zustand/shallow';
import { BackOrders } from './BackOrders/BackOrders';
import { ViewBackOrder } from './BackOrders/ViewBackOrder';
import { Checkings } from './Checkings/Checkings';
import { ViewChecking } from './Checkings/ViewChecking';
import { Dashboard } from './Dashboard';
import { Logs } from './Logs';
import { Notifications } from './Notifications';
import { PendingTransactions } from './PendingTransactions/PendingTransactions';
import { ViewPendingTransaction } from './PendingTransactions/ViewPendingTransaction';
import { RequisitionSlips } from './RequisitionSlips';
import { ViewDeliveryReceipt } from './RequisitionSlips/ViewDeliveryReceipt';
import { ViewRequisitionSlip } from './RequisitionSlips/ViewRequisitionSlip';
import { ReturnItemSlips } from './ReturnItemSlips';
import { ViewReturnItemSlip } from './ReturnItemSlips/ViewReturnItemSlip';
import { Users } from './Users';

const OfficeManager = () => {
	useNotificationConnectivity();
	useNotificationDtr();
	useUploadData({
		params: { isBackOffice: false },
	});

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

	const getSidebarItems = useCallback(
		() => [
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
				key: 'product-categories',
				name: 'Product Categories',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/office-manager/product-categories',
			},
			{
				key: 'point-system-tags',
				name: 'Point System Tags',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/office-manager/point-system-tags',
			},
			{
				key: 'branches',
				name: 'Branches',
				activeIcon: require('../../assets/images/icon-branches-active.svg'),
				defaultIcon: require('../../assets/images/icon-branches.svg'),
				link: '/office-manager/branches',
			},
			{
				key: 'users',
				name: 'Users',
				activeIcon: require('../../assets/images/icon-users-active.svg'),
				defaultIcon: require('../../assets/images/icon-users.svg'),
				link: '/office-manager/users',
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
				key: 'product-groups',
				name: 'Product Groups',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/office-manager/product-groups',
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
				count: cancelledTransactionsCount,
			},
			{
				key: 'notifications',
				name: 'Notifications',
				activeIcon: require('../../assets/images/icon-notifications-active.svg'),
				defaultIcon: require('../../assets/images/icon-notifications.svg'),
				link: '/office-manager/notifications',
				count: connectivityCount + dtrCount,
			},
		],
		[connectivityCount, dtrCount],
	);

	return (
		<Container sidebarItems={getSidebarItems()}>
			<React.Suspense fallback={<div>Loading...</div>}>
				<Switch>
					<Route component={Products} path="/office-manager/products" />

					<Route
						component={ProductCategories}
						path="/office-manager/product-categories"
					/>

					<Route
						component={PointSystemTags}
						path="/office-manager/point-system-tags"
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

					<Route component={Users} path="/office-manager/users" exact />
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
					<Route
						component={ViewDeliveryReceipt}
						path="/office-manager/requisition-slips/delivery-receipt/:id"
					/>

					<Route
						component={ReturnItemSlips}
						path="/office-manager/return-item-slips"
						exact
					/>
					<Route
						component={ViewReturnItemSlip}
						path="/office-manager/return-item-slips/:id"
						exact
					/>

					<Route
						component={BackOrders}
						path="/office-manager/back-orders"
						exact
					/>
					<Route
						component={ViewBackOrder}
						path="/office-manager/back-orders/:id"
						exact
					/>

					<Route component={Logs} path="/office-manager/logs" />

					<Route
						component={Notifications}
						path="/office-manager/notifications"
					/>
					<Route component={Reports} path="/office-manager/reports" />

					<Route
						component={PendingTransactions}
						path="/office-manager/pending-transactions"
						exact
					/>
					<Route
						component={ViewPendingTransaction}
						path="/office-manager/pending-transactions/:id"
						exact
					/>

					<Redirect to="/office-manager/products" />
				</Switch>
			</React.Suspense>
		</Container>
	);
};

export default OfficeManager;
