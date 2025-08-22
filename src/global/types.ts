import { Account as BaseAccount } from 'ejjy-global';

export const request = {
	NONE: 0,
	REQUESTING: 1,
	SUCCESS: 2,
	ERROR: 3,
};

export const appTypes = {
	BACK_OFFICE: 'back_office',
	HEAD_OFFICE: 'head_office',
};

export const headOfficeTypes = {
	TEST: -1,
	NOT_MAIN: 0,
	MAIN: 1,
};

export const printerStatuses = {
	OK: 'OK',
	PRINTING: 'PRINTING',
	NOT_AVAILABLE: 'NOT_AVAILABLE',
};

export const productTypes = {
	DRY: 'dry',
	WET: 'wet',
};

export const unitOfMeasurementTypes = {
	WEIGHING: 'weighing',
	NON_WEIGHING: 'non_weighing',
};

export const userTypes = {
	ADMIN: 'admin',
	OFFICE_MANAGER: 'office_manager',
	BRANCH_MANAGER: 'branch_manager',
	BRANCH_PERSONNEL: 'branch_personnel',
};

export const requisitionSlipTypes = {
	MANUAL: 'manual',
	AUTOMATIC: 'automatic',
};

export const requisitionSlipProductStatus = {
	ADDED_TO_OS: 'added_to_os',
	NOT_ADDED_TO_OS: 'not_added_to_os',
};

export const requisitionSlipActions = {
	NEW: 'new',
	SEEN: 'seen',
	F_OS1_CREATING: 'f_os1_creating',
	F_OS1_CREATED: 'f_os1_created',
	F_OS1_PREPARING: 'f_os1_preparing',
	F_OS1_PREPARED: 'f_os1_prepared',
	F_DS1_CREATING: 'f_ds1_creating',
	F_DS1_CREATED: 'f_ds1_created',
	F_DS1_DELIVERING: 'f_ds1_delivering',
	F_DS1_DELIVERED_DONE: 'f_ds1_delivered_done',
	F_DS1_DELIVERED_ERROR: 'f_ds1_delivered_error',
	OUT_OF_STOCK: 'out_of_stock',
};

export const productStatus = {
	AVAILABLE: 'available',
	REORDER: 'reorder',
	OUT_OF_STOCK: 'out_of_stock',
};

export const quantityTypes = {
	BULK: 'bulk',
	PIECE: 'piece',
};

export const orderSlipStatus = {
	RECEIVED: 'received',
	DELIVERED: 'delivered',
	PREPARING: 'preparing',
	PREPARED: 'prepared',
};

export const preparationSlipStatus = {
	NEW: 'new',
	PREPARING: 'preparing',
	PARTIALLY_COMPLETED: 'partially_completed',
	COMPLETED: 'completed',
	ERROR: 'error',
};

export const backOrderStatus = {
	NEW: 'new',
	PREPARING: 'preparing',
	PARTIALLY_COMPLETED: 'partially_completed',
	COMPLETED: 'completed',
	ERROR: 'error',
};

export const deliveryReceiptProductStatus = {
	RESOLVED: 'resolved',
	INVESTIGATION: 'investigation',
};

export const OSDRStatus = {
	DONE: 'done',
	ERROR: 'error',
};

export const deliveryReceiptStatus = {
	INVESTIGATION: 'investigation',
	RESOLVED: 'resolved',
	DONE: 'done',
};

export const productCheckingTypes = {
	DAILY: 'daily',
	RANDOM: 'random',
};

export const transactionStatuses = {
	NEW: 'new',
	FULLY_PAID: 'fully_paid',
	HOLD: 'hold',
	VOID_EDITED: 'void_edited',
	VOID_CANCELLED: 'void_cancelled',
};

export const pendingTransactionTypes = {
	PRODUCTS: 'products',
	USERS: 'users',
};

export const productCategoryTypes = {
	ASSORTED: 'assorted',
	BABOY: 'baboy',
	MANOK: 'manok',
	GULAY: 'gulay',
	HOTDOG: 'hotdog',
	NONE: 'none',
};

export const timeRangeTypes = {
	DAILY: 'daily',
	MONTHLY: 'monthly',
	DATE_RANGE: 'date_range',
};

export const returnItemSlipsStatuses = {
	DONE: 'done',
	PENDING: 'pending',
	ERROR: 'error',
};

export const backOrdersStatuses = {
	DONE: 'done',
	PENDING: 'pending',
	ERROR: 'error',
};

export const taxTypes = {
	VAT: 'VAT',
	NVAT: 'NVAT',
};

export const connectivityTypes = {
	ONLINE_TO_OFFLINE: 'online_to_offline',
	OFFLINE_TO_ONLINE: 'offline_to_online',
};

export const accountTypes = {
	PERSONAL: 'regular',
	CORPORATE: 'corporate',
	EMPLOYEE: 'employee',
	GOVERNMENT: 'government',
};

export const paymentTypes = {
	CASH: 'cash',
	CREDIT: 'credit_pay',
};

export const saleTypes = {
	CASH: 'cash',
	CREDIT: 'credit_pay',
};

export const orderOfPaymentPurposes = {
	PARTIAL_PAYMENT: 'partial_payment',
	FULL_PAYMENT: 'full_payment',
	OTHERS: 'others',
};

export const discountTypes = {
	AMOUNT: 'amount',
	PERCENTAGE: 'percentage',
};

export const inputTypes = {
	TEXT: 'text',
	TEXTAREA: 'textarea',
	NUMBER: 'number',
	MONEY: 'money',
};

export const backOrderTypes = {
	DAMAGED: 'damaged',
	FOR_RETURN: 'for_return',
};

export const vatTypes = {
	VATABLE: 'V',
	VAT_EMPTY: 'VE',
};

export const markdownTypes = {
	REGULAR: 'regular',
	WHOLESALE: 'discount_1',
	SPECIAL: 'discount_2',
};

export const cashBreakdownTypes = {
	START_SESSION: 'start_session',
	MID_SESSION: 'mid_session',
	END_SESSION: 'end_session',
};

export const cashBreakdownCategories = {
	CASH_BREAKDOWN: 'cash_breakdown',
	CASH_IN: 'cash_in',
	CASH_OUT: 'cash_out',
};

export const serviceTypes = {
	NORMAL: 'normal',
	ONLINE: 'online',
	OFFLINE: 'offline',
};

export const requisitionSlipDetailsType = {
	SINGLE_VIEW: 'single_view',
	CREATE_EDIT: 'create_edit',
};

export const attendanceSchedulePeriods = {
	MORNING: 'morning',
	AFTERNOON: 'afternoon',
};

export const attendanceScheduleTypes = {
	CLOCK_IN: 'clock_in',
	CLOCK_OUT: 'clock_out',
};

export const userLogTypes = {
	LOGIN: 'login',
	AUTHENTICATION: 'authentication',
	TRANSACTION: 'transaction',
	SESSIONS: 'sessions',
	ASSIGNMENTS: 'assignments',
	PRODUCTS: 'products',
	BRANCH_PRODUCTS: 'branch_products',
};

export const branchMachineTypes = {
	SCALE: 'scale',
	CASHIERING: 'cashiering',
	SCALE_AND_CASHIERING: 'scale_and_cashiering',
};

export const closingTypes = {
	ALL: 'all',
	AUTOMATIC: 'automatic',
	MANUAL: 'manual',
};

export const pdfButtonsKey = {
	DOWNLOAD: 'download',
	PREVIEW: 'preview',
};

export const authorizationStatuses = {
	UNOPENED: 'unopened',
	OPENED: 'opened',
	CLOSED: 'ended',
};

// Extended types
export interface Account extends BaseAccount {
	outstanding_balance?: number;
}
