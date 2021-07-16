import { userTypes } from '../global/types';
import {
	AdminBranches,
	AdminDashboard,
	AdminLogs,
	AdminNotifications,
	AdminPendingTransactions,
	AdminProducts,
	AdminSales,
	AdminViewBranch,
	BranchManagerChecking,
	BranchManagerDashboard,
	BranchManagerNotifications,
	BranchManagerOrderSlips,
	BranchManagerProducts,
	BranchManagerRequisitionSlips,
	BranchManagerViewRequisitionSlip,
	BranchPersonnelDashboard,
	BranchPersonnelFulfillPreparationSlips,
	BranchPersonnelNotifications,
	BranchPersonnelPreparationSlips,
	BranchPersonnelProducts,
	OfficeManagerAssignUser,
	OfficeManagerBranches,
	OfficeManagerDashboard,
	OfficeManagerNotifications,
	OfficeManagerProducts,
	OfficeManagerReports,
	OfficeManagerRequisitionSlips,
	OfficeManagerUsers,
	OfficeManagerViewBranch,
	OfficeManagerViewDeliveryReceipt,
	OfficeManagerViewRequisitionSlip,
} from '../screens';

export const DashboardScreens = {
	[userTypes.ADMIN]: AdminDashboard,
	[userTypes.OFFICE_MANAGER]: OfficeManagerDashboard,
	[userTypes.BRANCH_MANAGER]: BranchManagerDashboard,
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelDashboard,
};

export const PendingTransactionsScreens = {
	[userTypes.ADMIN]: AdminPendingTransactions,
};

export const ProductsScreens = {
	[userTypes.ADMIN]: AdminProducts,
	[userTypes.OFFICE_MANAGER]: OfficeManagerProducts,
	[userTypes.BRANCH_MANAGER]: BranchManagerProducts,
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelProducts,
};

export const BranchesScreens = {
	[userTypes.ADMIN]: AdminBranches,
	[userTypes.OFFICE_MANAGER]: OfficeManagerBranches,
};

export const ViewBranchScreens = {
	[userTypes.ADMIN]: AdminViewBranch,
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

export const AssignUserScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerAssignUser,
};

export const NotificationsScreens = {
	[userTypes.ADMIN]: AdminNotifications,
	[userTypes.OFFICE_MANAGER]: OfficeManagerNotifications,
	[userTypes.BRANCH_MANAGER]: BranchManagerNotifications,
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelNotifications,
};

export const PreparationSlipsScreens = {
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelPreparationSlips,
};

export const FulfillPreparationSlipScreens = {
	[userTypes.BRANCH_PERSONNEL]: BranchPersonnelFulfillPreparationSlips,
};

export const CheckingScreens = {
	[userTypes.BRANCH_MANAGER]: BranchManagerChecking,
};

export const LogsScreens = {
	[userTypes.ADMIN]: AdminLogs,
};

export const ReportsScreens = {
	[userTypes.OFFICE_MANAGER]: OfficeManagerReports,
};

export const SalesScreens = {
	[userTypes.ADMIN]: AdminSales,
};
