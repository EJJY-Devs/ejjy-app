import { Spin } from 'antd';
import { Container, TimeMismatchBoundary } from 'components';
import { IS_APP_LIVE, MAX_PAGE_SIZE } from 'global';
import {
	useBranches,
	useBranchProducts,
	useBranchProductsOffline,
	useProductCheckCreateDaily,
	useProductCheckCreateRandom,
	useSalesTracker,
	useSiteSettingsRetrieve,
	useUploadData,
} from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Checkings } from 'screens/BranchManager/Checkings';
import { ViewChecking } from 'screens/BranchManager/Checkings/ViewChecking';
import { Logs } from 'screens/BranchManager/Logs';
import { Reports } from 'screens/BranchManager/Reports';
import { Stocks } from 'screens/BranchManager/Stock';
import { CreateStockIn } from 'screens/BranchManager/Stock/components/TabStockIn/CreateStockIn';
import { CreateStockOut } from 'screens/BranchManager/Stock/components/TabStockOut/CreateStockOut';
import { AssignUser } from 'screens/BranchManager/Users/AssignUser';
import { ViewAccount } from 'screens/Shared/Accounts/ViewAccount';
import { Cart } from 'screens/Shared/Cart';
import { DiscountOptions } from 'screens/Shared/DiscountOptions';
import { DTR } from 'screens/Shared/DTR';
import { PointSystemTags } from 'screens/Shared/PointSystemTags';
import { ProductCategories } from 'screens/Shared/ProductCategories';
import { Products } from 'screens/Shared/Products';
import { Sales } from 'screens/Shared/Sales';
import { SiteSettings } from 'screens/Shared/SiteSettings';
import { ViewBranchMachine } from 'screens/Shared/ViewBranchMachine';
import { isStandAlone } from 'utils';
import { Accounts } from '../Shared/Accounts';
import { BackOrders } from './BackOrders';
import { CreateBackOrder } from './BackOrders/CreateBackOrder';
import { BranchMachines } from './BranchMachines';
import { Dashboard } from './Dashboard';
import { Notifications } from './Notifications';
import { OrderSlips } from './OrderSlips/OrderSlips';
import { RequisitionSlips } from './RequisitionSlips';
import { ViewRequisitionSlip } from './RequisitionSlips/ViewRequisitionSlip';
import { CreateReturnItemSlip } from './ReturnItemSlips/CreateReturnItemSlip';
import { ReturnItemSlips } from './ReturnItemSlips/ReturnItemSlips';
import { Users } from './Users';

const refetchOptions: any = {
	refetchInterval: 60000,
	refetchIntervalInBackground: true,
	notifyOnChangeProps: ['data'],
};

const BranchManager = () => {
	// STATES
	const [notificationsCount, setNotificationsCount] = useState(0);

	// CUSTOM HOOKS
	const { isFetching: isFetchingBranches } = useBranches({
		options: { enabled: IS_APP_LIVE },
	});
	const { data: siteSettings } = useSiteSettingsRetrieve();
	const {
		data: { total: branchProductsTotal },
	} = useBranchProducts({
		params: {
			hasNegativeBalance: true,
			pageSize: MAX_PAGE_SIZE,
		},
		options: refetchOptions,
	});
	const {
		data: { salesTrackers },
	} = useSalesTracker({
		params: { pageSize: MAX_PAGE_SIZE },
		options: refetchOptions,
	});
	useBranchProductsOffline({
		options: {
			...refetchOptions,
			enabled: !isStandAlone(),
		},
	});
	useUploadData();

	const { mutate: createCheckDaily } = useProductCheckCreateDaily();
	const { mutate: createCheckRandom } = useProductCheckCreateRandom();

	// METHODS
	useEffect(() => {
		createCheckDaily(null);
		createCheckRandom(null);
	}, []);

	useEffect(() => {
		if (siteSettings) {
			const resetCounterNotificationThresholdAmount =
				siteSettings?.reset_counter_notification_threshold_amount;
			const resetCounterNotificationThresholdInvoiceNumber =
				siteSettings?.reset_counter_notification_threshold_invoice_number;

			// Reset count
			const resetCount = salesTrackers.filter(
				({ total_sales }) =>
					Number(total_sales) >= resetCounterNotificationThresholdAmount,
			).length;

			// Transaction count
			const transactionCount = salesTrackers.filter(
				({ transaction_count }) =>
					Number(transaction_count) >=
					resetCounterNotificationThresholdInvoiceNumber,
			).length;

			// Branch products with lacking balance count
			const branchProductCount = branchProductsTotal;

			// Set new notification count
			const newNotificationsCount =
				branchProductCount + resetCount + transactionCount;
			if (newNotificationsCount !== notificationsCount) {
				setNotificationsCount(newNotificationsCount);
			}
		}
	}, [branchProductsTotal, salesTrackers, siteSettings]);

	const getSidebarItems = useCallback(
		() => [
			{
				key: 'branch-machines',
				name: 'Branch Machines',
				activeIcon: require('../../assets/images/icon-branches-active.svg'),
				defaultIcon: require('../../assets/images/icon-branches.svg'),
				link: '/branch-manager/branch-machines',
			},
			{
				key: 'reports',
				name: 'Reports',
				activeIcon: require('../../assets/images/icon-report-active.svg'),
				defaultIcon: require('../../assets/images/icon-report.svg'),
				link: '/branch-manager/reports',
			},
			{
				key: 'sales',
				name: 'Sales',
				activeIcon: require('../../assets/images/icon-sales-active.svg'),
				defaultIcon: require('../../assets/images/icon-sales.svg'),
				link: '/branch-manager/sales',
			},
			{
				key: 'dashboard',
				name: 'Dashboard',
				activeIcon: require('../../assets/images/icon-dashboard-active.svg'),
				defaultIcon: require('../../assets/images/icon-dashboard.svg'),
				link: '/branch-manager/dashboard',
			},
			{
				key: 'products',
				name: 'Products',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/branch-manager/products',
			},
			{
				key: 'point-system-tags',
				name: 'Point System Tags',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/branch-manager/point-system-tags',
			},
			{
				key: 'product-categories',
				name: 'Product Categories',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/branch-manager/product-categories',
			},
			{
				key: 'stocks',
				name: 'Stocks',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/branch-manager/stocks',
			},
			{
				key: 'discount-options',
				name: 'Discount Options',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/branch-manager/discount-options',
			},
			{
				key: 'accounts',
				name: 'Accounts',
				activeIcon: require('../../assets/images/icon-users-active.svg'),
				defaultIcon: require('../../assets/images/icon-users.svg'),
				link: '/branch-manager/accounts',
			},
			{
				key: 'users',
				name: 'Users',
				activeIcon: require('../../assets/images/icon-users-active.svg'),
				defaultIcon: require('../../assets/images/icon-users.svg'),
				link: '/branch-manager/users',
			},
			{
				key: 'dtr',
				name: 'DTR',
				activeIcon: require('../../assets/images/icon-users-active.svg'),
				defaultIcon: require('../../assets/images/icon-users.svg'),
				link: '/branch-manager/dtr',
			},
			{
				key: 'requisition-slips',
				name: 'Requisition Slips',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/branch-manager/requisition-slips',
			},
			{
				key: 'return-item-slips',
				name: 'Return Item Slips',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/branch-manager/return-item-slips',
			},
			{
				key: 'back-orders',
				name: 'Back Orders',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/branch-manager/back-orders',
			},
			{
				key: 'order-slips',
				name: 'Order Slips',
				activeIcon: require('../../assets/images/icon-order-slips-active.svg'),
				defaultIcon: require('../../assets/images/icon-order-slips.svg'),
				link: '/branch-manager/order-slips',
			},
			{
				key: 'checkings',
				name: 'Checkings',
				activeIcon: require('../../assets/images/icon-checking-active.svg'),
				defaultIcon: require('../../assets/images/icon-checking.svg'),
				link: '/branch-manager/checkings',
			},
			{
				key: 'site-settings',
				name: 'Site Settings',
				activeIcon: require('../../assets/images/icon-settings-active.svg'),
				defaultIcon: require('../../assets/images/icon-settings.svg'),
				link: '/branch-manager/site-settings',
			},
			{
				key: 'logs',
				name: 'Logs',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/branch-manager/logs',
			},
			{
				key: 'notifications',
				name: 'Notifications',
				activeIcon: require('../../assets/images/icon-notifications-active.svg'),
				defaultIcon: require('../../assets/images/icon-notifications.svg'),
				link: '/branch-manager/notifications',
				count: notificationsCount,
			},
		],
		[notificationsCount],
	);

	if (isFetchingBranches) {
		return <Spin className="GlobalSpinner" tip="Fetching data..." />;
	}

	return (
		<Container sidebarItems={getSidebarItems()}>
			{!IS_APP_LIVE && <TimeMismatchBoundary />}

			<React.Suspense fallback={<div>Loading...</div>}>
				<Switch>
					<Route component={Dashboard} path="/branch-manager/dashboard" />

					<Route component={Reports} path="/branch-manager/reports" />

					<Route component={Sales} path="/branch-manager/sales" />

					<Route
						component={ProductCategories}
						path="/branch-manager/product-categories"
					/>
					<Route component={Products} path="/branch-manager/products" />

					<Route
						component={PointSystemTags}
						path="/branch-manager/point-system-tags"
					/>

					<Route component={Stocks} path="/branch-manager/stocks" exact />
					<Route
						component={CreateStockIn}
						path="/branch-manager/stocks/stock-in/create"
						exact
					/>
					<Route
						component={CreateStockOut}
						path="/branch-manager/stocks/stock-out/create"
						exact
					/>

					<Route
						component={DiscountOptions}
						path="/branch-manager/discount-options"
					/>

					<Route component={Accounts} path="/branch-manager/accounts" exact />
					<Route
						component={ViewAccount}
						path="/branch-manager/accounts/:id"
						exact
					/>

					<Route component={Users} path="/branch-manager/users" exact />
					<Route
						component={AssignUser}
						path="/branch-manager/users/assign/:id"
						exact
					/>

					<Route component={DTR} path="/branch-manager/dtr" />

					<Route
						component={BranchMachines}
						path="/branch-manager/branch-machines"
						exact
					/>
					<Route
						component={ViewBranchMachine}
						path="/branch-manager/branch-machines/:id"
						exact
					/>

					<Route
						component={RequisitionSlips}
						path="/branch-manager/requisition-slips"
						exact
					/>
					<Route
						component={Cart}
						path="/branch-manager/requisition-slips/create"
						exact
					/>
					<Route
						component={ViewRequisitionSlip}
						path="/branch-manager/requisition-slips/:id"
						exact
					/>

					<Route
						component={ReturnItemSlips}
						path="/branch-manager/return-item-slips"
						exact
					/>
					<Route
						component={CreateReturnItemSlip}
						path="/branch-manager/return-item-slips/create"
						exact
					/>

					<Route
						component={BackOrders}
						path="/branch-manager/back-orders"
						exact
					/>
					<Route
						component={CreateBackOrder}
						path="/branch-manager/back-orders/create"
						exact
					/>

					<Route component={OrderSlips} path="/branch-manager/order-slips" />

					<Route component={Checkings} path="/branch-manager/checkings" exact />
					<Route
						component={ViewChecking}
						path="/branch-manager/checkings/:id"
						exact
					/>

					<Route
						component={Notifications}
						path="/branch-manager/notifications"
					/>

					<Route component={Logs} path="/branch-manager/logs" />

					<Route
						component={SiteSettings}
						path="/branch-manager/site-settings"
					/>

					<Route component={Cart} path="/branch-manager/cart" />

					<Redirect to="/branch-manager/branch-machines" />
				</Switch>
			</React.Suspense>
		</Container>
	);
};

export default BranchManager;
