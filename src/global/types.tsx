export const request = {
	NONE: 0,
	REQUESTING: 1,
	SUCCESS: 2,
	ERROR: 3,
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
	OFFICE_MANAGER: 'office_manager',
	BRANCH_MANAGER: 'branch_manager',
	BRANCH_PERSONNEL: 'branch_personnel',
};

export const purchaseRequestTypes = {
	MANUAL: 'manual',
	AUTOMATIC: 'automatic',
};

export const purchaseRequestProductStatus = {
	ADDED_TO_OS: 'added_to_os',
	NOT_ADDED_TO_OS: 'not_added_to_os',
};

export const purchaseRequestActions = {
	NEW: 'new',
	SEEN: 'seen',
	F_OS1_CREATING: 'f_os1_creating',
	F_OS1_CREATED: 'f_os1_created',
	F_OS1_PREPARING: 'f_os1_preparing',
	F_OS1_PREPARED: 'f_os1_prepared',
	F_DS1_CREATING: 'f_ds1_creating',
	F_DS1_CREATED: 'f_ds1_created',
	F_DS1_DELIVERING: 'f_ds1_delivering',
	F_DS1_DELIVERED: 'f_ds1_delivered',
};

export const branchProductStatus = {
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
	COMPLETED: 'completed',
};

export const deliveryReceiptProductStatus = {
	RESOLVED: 'resolved',
	INVESTIGATION: 'investigation',
};

export const OSDRStatus = {
	DONE: 'done',
	ERROR: 'error',
};
