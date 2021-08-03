import { Spin } from 'antd';
import React, { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Container } from '../../components';
import { IS_APP_LIVE } from '../../global/constants';
import { request } from '../../global/types';
import { useBranches } from '../../hooks/useBranches';
import { Checking } from './Checking/Checking';
import { Dashboard } from './Dashboard/Dashboard';
import { Notifications } from './Notifications/Notifications';
import { OrderSlips } from './OrderSlips/OrderSlips';
import { Products } from './Products/Products';
import { CreateRequisitionSlip } from './RequisitionSlips/CreateRequisitionSlip';
import { RequisitionSlips } from './RequisitionSlips/RequisitionSlips';
import { ViewRequisitionSlip } from './RequisitionSlips/ViewRequisitionSlip';

const sidebarItems = [
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
		key: 'requisition-slips',
		name: 'Requisition Slips',
		activeIcon: require('../../assets/images/icon-requisition-slip-active.svg'),
		defaultIcon: require('../../assets/images/icon-requisition-slip.svg'),
		link: '/branch-manager/requisition-slips',
	},
	{
		key: 'order-slips',
		name: 'Order Slips',
		activeIcon: require('../../assets/images/icon-order-slips-active.svg'),
		defaultIcon: require('../../assets/images/icon-order-slips.svg'),
		link: '/branch-manager/order-slips',
	},
	{
		key: 'checking',
		name: 'Checking',
		activeIcon: require('../../assets/images/icon-checking-active.svg'),
		defaultIcon: require('../../assets/images/icon-checking.svg'),
		link: '/branch-manager/checking',
	},
	{
		key: 'notifications',
		name: 'Notifications',
		activeIcon: require('../../assets/images/icon-notifications-active.svg'),
		defaultIcon: require('../../assets/images/icon-notifications.svg'),
		link: '/branch-manager/notifications',
	},
];

const OfficeManager = () => {
	// CUSTOM HOOKS
	const { getBranches, status: getBranchesStatus } = useBranches();

	// METHODS
	useEffect(() => {
		if (IS_APP_LIVE) {
			getBranches();
		}
	}, []);

	if (getBranchesStatus === request.REQUESTING) {
		return (
			<Spin className="GlobalSpinner" size="large" tip="Fetching data..." />
		);
	}

	return (
		<Container sidebarItems={sidebarItems}>
			<React.Suspense fallback={<div>Loading...</div>}>
				<Switch>
					<Route path="/branch-manager/dashboard" component={Dashboard} />
					<Route path="/branch-manager/products" component={Products} />
					<Route
						path="/branch-manager/requisition-slips"
						component={RequisitionSlips}
						exact
					/>
					<Route
						path="/branch-manager/requisition-slips/create"
						component={CreateRequisitionSlip}
						exact
					/>
					<Route
						path="/branch-manager/requisition-slips/:id"
						component={ViewRequisitionSlip}
						exact
					/>

					<Route path="/branch-manager/order-slips" component={OrderSlips} />

					<Route path="/branch-manager/checking" component={Checking} />

					<Route
						path="/branch-manager/notifications"
						component={Notifications}
					/>

					<Redirect to="/branch-manager/dashboard" />
				</Switch>
			</React.Suspense>
		</Container>
	);
};

export default OfficeManager;