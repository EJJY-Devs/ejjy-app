import { userTypes } from '../global/types';
import {
	BranchManagerDashboard,
	BranchManagerNotifications,
	BranchManagerOrderSlips,
	BranchManagerProducts,
	BranchManagerRequisitionSlips,
	BranchManagerViewRequisitionSlip,
	BranchPersonnelDashboard,
	BranchPersonnelNotifications,
	BranchPersonnelPreparationSlips,
	BranchPersonnelProducts,
	OfficeManagerBranches,
	OfficeManagerDashboard,
	OfficeManagerNotifications,
	OfficeManagerProducts,
	OfficeManagerRequisitionSlips,
	OfficeManagerUsers,
	OfficeManagerViewBranch,
	OfficeManagerViewDeliveryReceipt,
	OfficeManagerViewRequisitionSlip,
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

export const RequisitionSlipsScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerRequisitionSlips,
	[userTypes.BRANCH_MANAGER]: BranchManagerRequisitionSlips,
};

export const ViewRequisitionSlipScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerViewRequisitionSlip,
	[userTypes.BRANCH_MANAGER]: BranchManagerViewRequisitionSlip,
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
