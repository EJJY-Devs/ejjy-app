import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { CommonRoute } from './components';
import { Error404, Landing, Login } from './screens';
import {
	AssignUserScreens,
	BranchesScreens,
	CheckingScreens,
	DashboardScreens,
	FulfillPreparationSlipScreens,
	NotificationsScreens,
	OrderSlipsScreens,
	PreparationSlipsScreens,
	ProductsScreens,
	RequisitionSlipsScreens,
	UsersScreens,
	ViewBranchScreens,
	ViewDeliveryReceiptScreens,
	ViewRequisitionSlipScreens,
} from './utils/routeMapping';

const App = () => (
	<Switch>
		<CommonRoute path={['/', '/login']} exact component={Login} />
		<CommonRoute path="/landing" exact component={Landing} />
		<CommonRoute path="/dashboard" exact component={DashboardScreens} />
		<CommonRoute path="/products" exact component={ProductsScreens} />
		<CommonRoute path="/branches" exact component={BranchesScreens} />
		<CommonRoute path="/branches/:id" exact component={ViewBranchScreens} />
		<CommonRoute path="/requisition-slips" exact component={RequisitionSlipsScreens} />
		<CommonRoute path="/requisition-slips/:id" exact component={ViewRequisitionSlipScreens} />
		<CommonRoute
			path="/requisition-slips/delivery-receipt/:id"
			exact
			component={ViewDeliveryReceiptScreens}
		/>
		<CommonRoute path="/users" exact component={UsersScreens} />
		<CommonRoute path="/users/assign/:id" exact component={AssignUserScreens} />
		<CommonRoute path="/notifications" exact component={NotificationsScreens} />
		<CommonRoute path="/order-slips" exact component={OrderSlipsScreens} />
		<CommonRoute path="/preparation-slips" exact component={PreparationSlipsScreens} />
		<CommonRoute path="/preparation-slips/:id" exact component={FulfillPreparationSlipScreens} />
		<CommonRoute path="/checking" exact component={CheckingScreens} />

		<Route path="/404" exact component={Error404} />
		<Route path="" render={() => <Redirect to="/404" />} />
	</Switch>
);

export default App;
