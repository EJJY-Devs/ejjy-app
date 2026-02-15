import { Container } from 'components';
import { useBranches, useUploadData } from 'hooks';
import { usePendingTransactions } from 'hooks/usePendingTransactions';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Notifications } from 'screens/Admin/Notifications';
import { Logs } from 'screens/OfficeManager/Logs';
import { Branches } from 'screens/Shared/Branches';
import { ViewBranch } from 'screens/Shared/Branches/ViewBranch';
import { PointSystemTags } from 'screens/Shared/PointSystemTags';
import { ProductCategories } from 'screens/Shared/ProductCategories';
import { ProductGroups } from 'screens/Shared/ProductGroups';
import { ModifyProductGroup } from 'screens/Shared/ProductGroups/ModifyProductGroup';
import { Products } from 'screens/Shared/Products';
import { Sales } from 'screens/Shared/Sales';
import { ViewBranchMachine } from 'screens/Shared/ViewBranchMachine';
import { Tags } from 'screens/Shared/Tags';
import { Dashboard } from './Dashboard';
import { useFailedTransfers } from './hooks/useFailedTransfers';
import { PendingTransactions } from './PendingTransactions/PendingTransactions';
import { Users } from './Users';

const POLL_INTERVAL_MS = 10000;

const Admin = () => {
	// STATES
	const [notificationsCount, setNotificationsCount] = useState(0);

	// CUSTOM HOOKS
	const {
		pendingTransactionsCount,
		getPendingTransactionsCount,
	} = usePendingTransactions();
	const { failedTransfers, getFailedTansferCount } = useFailedTransfers();
	const {
		data: { branches },
	} = useBranches();
	useUploadData({
		params: { isBackOffice: false },
	});

	// REFS
	const pendingTransactionsCountRef = useRef(null);
	const notificationsCountRef = useRef(null);

	// METHODS
	useEffect(() => {
		// Pending Transactions Count
		getPendingTransactionsCount({ isPendingApproval: true });
		pendingTransactionsCountRef.current = setInterval(() => {
			getPendingTransactionsCount({ isPendingApproval: true });
		}, POLL_INTERVAL_MS);

		// Notifications Count
		const fetchFailedTransferNotifications = () => {
			branches.forEach(({ id, name }) => {
				getFailedTansferCount({ branchId: id, branchName: name });
			});
		};

		fetchFailedTransferNotifications();
		notificationsCountRef.current = setInterval(() => {
			fetchFailedTransferNotifications();
		}, POLL_INTERVAL_MS);

		return () => {
			clearInterval(pendingTransactionsCountRef.current);
			clearInterval(notificationsCountRef.current);
		};
	}, []);

	useEffect(() => {
		const count = Object.keys(failedTransfers)
			.filter((key) => failedTransfers?.[key]?.count > 0)
			.reduce((prev, key) => (failedTransfers?.[key]?.count || 0) + prev, 0);

		setNotificationsCount(count);
	}, [failedTransfers]);

	const getSidebarItems = useCallback(
		() => [
			{
				key: 'dashboard',
				name: 'Dashboard',
				activeIcon: require('../../assets/images/icon-dashboard-active.svg'),
				defaultIcon: require('../../assets/images/icon-dashboard.svg'),
				link: '/admin/dashboard',
			},
			{
				key: 'users',
				name: 'Users',
				activeIcon: require('../../assets/images/icon-users-active.svg'),
				defaultIcon: require('../../assets/images/icon-users.svg'),
				link: '/admin/users',
			},
			{
				key: 'branches',
				name: 'Branches',
				activeIcon: require('../../assets/images/icon-branches-active.svg'),
				defaultIcon: require('../../assets/images/icon-branches.svg'),
				link: '/admin/branches',
			},
			{
				key: 'products',
				name: 'Products',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/admin/products',
			},
			{
				key: 'product-categories',
				name: 'Tags',
				activeIcon: require('../../assets/images/icon-product-active.svg'),
				defaultIcon: require('../../assets/images/icon-product.svg'),
				link: '/admin/tags',
			},
			{
				key: 'sales',
				name: 'Sales',
				activeIcon: require('../../assets/images/icon-sales-active.svg'),
				defaultIcon: require('../../assets/images/icon-sales.svg'),
				link: '/admin/sales',
			},
			{
				key: 'pending-transactions',
				name: 'Pending Transactions',
				activeIcon: require('../../assets/images/icon-failed-transfers-active.svg'),
				defaultIcon: require('../../assets/images/icon-failed-transfers.svg'),
				link: '/admin/pending-transactions',
				count: pendingTransactionsCount,
			},
			{
				key: 'logs',
				name: 'Logs',
				activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
				defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
				link: '/admin/logs',
			},
			{
				key: 'notifications',
				name: 'Notifications',
				activeIcon: require('../../assets/images/icon-notifications-active.svg'),
				defaultIcon: require('../../assets/images/icon-notifications.svg'),
				link: '/admin/notifications',
				count: notificationsCount,
			},
		],
		[pendingTransactionsCount, notificationsCount],
	);

	return (
		<Container sidebarItems={getSidebarItems()}>
			<React.Suspense fallback={<div>Loading...</div>}>
				<Switch>
					<Route component={Dashboard} path="/admin/dashboard" />
					<Route
						component={PendingTransactions}
						path="/admin/pending-transactions"
					/>
					<Route component={Users} path="/admin/users" />
					<Route component={Branches} path="/admin/branches" exact />
					<Route component={ViewBranch} path="/admin/branches/:id" exact />
					<Route
						component={ViewBranchMachine}
						path="/admin/branch-machines/:id"
						exact
					/>
					<Route component={Products} path="/admin/products" />
					<Route path="/admin/tags" render={() => <Tags basePath="/admin" />} />
					<Route
						component={ProductCategories}
						path="/admin/product-categories"
					/>
					<Route component={PointSystemTags} path="/admin/point-system-tags" />
					<Route component={ProductGroups} path="/admin/product-groups" exact />
					<Route
						component={ModifyProductGroup}
						path="/admin/product-groups/create"
						exact
					/>
					<Route
						component={ModifyProductGroup}
						path="/admin/product-groups/edit/:id"
						exact
					/>
					<Route component={Logs} path="/admin/logs" />
					<Route component={Sales} path="/admin/sales" />
					<Route component={Notifications} path="/admin/notifications" />

					<Redirect to="/admin/dashboard" />
				</Switch>
			</React.Suspense>
		</Container>
	);
};

export default Admin;
