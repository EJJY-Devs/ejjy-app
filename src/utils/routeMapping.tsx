import { userTypes } from '../global/types';
import {
	BranchManagerDashboard,
	BranchManagerNotifications,
	BranchManagerOrderSlips,
	BranchManagerProducts,
	BranchManagerPurchaseRequests,
	BranchManagerViewPurchaseRequest,
	BranchPersonnelDashboard,
	BranchPersonnelNotifications,
	BranchPersonnelPreparationSlips,
	BranchPersonnelProducts,
	OfficeManagerBranches,
	OfficeManagerDashboard,
	OfficeManagerNotifications,
	OfficeManagerProducts,
	OfficeManagerPurchaseRequests,
	OfficeManagerUsers,
	OfficeManagerViewBranch,
	OfficeManagerViewDeliveryReceipt,
	OfficeManagerViewPurchaseRequest,
} from '../screens';

export const DashboardScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerDashboard,
	[userTypes.BRANCH_MANAGER]: BranchManagerDashboard,
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelDashboard,
};

export const ProductsScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerProducts,
	[userTypes.BRANCH_MANAGER]: BranchManagerProducts,
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelProducts,
};

export const BranchesScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerBranches,
};

export const ViewBranchScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerViewBranch,
};

export const PurchaseRequestsScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerPurchaseRequests,
	[userTypes.BRANCH_MANAGER]: BranchManagerPurchaseRequests,
};

export const ViewPurchaseRequestScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerViewPurchaseRequest,
	[userTypes.BRANCH_MANAGER]: BranchManagerViewPurchaseRequest,
};

export const ViewDeliveryReceiptScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerViewDeliveryReceipt,
};

export const OrderSlipsScreens = {
	[userTypes.BRANCH_MANAGER]: BranchManagerOrderSlips,
};

export const UsersScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerUsers,
};

export const NotificationsScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerNotifications,
	[userTypes.BRANCH_MANAGER]: BranchManagerNotifications,
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelNotifications,
};

export const PreparationSlipsScreens = {
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelPreparationSlips,
};
