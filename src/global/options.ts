import { REPORTS_RETRY_INTERVAL_MS } from 'global/constants';
import { upperFirst } from 'lodash';
import {
	deliveryReceiptProductStatus,
	preparationSlipStatus,
	productCheckingTypes,
	productStatus,
	quantityTypes,
	requisitionSlipActions,
	userTypes,
} from './types';

export const pageSizeOptions = ['10', '20', '50'];

export const refetchOptions: any = {
	notifyOnChangeProps: ['data', 'isFetching', 'isFetched'],
	refetchInterval: REPORTS_RETRY_INTERVAL_MS,
	refetchIntervalInBackground: true,
};

export const quantityTypeOptions = [
	{
		name: upperFirst(quantityTypes.PIECE),
		value: quantityTypes.PIECE,
	},
	{
		name: upperFirst(quantityTypes.BULK),
		value: quantityTypes.BULK,
	},
];

export const requisitionSlipActionsOptions = [
	{
		value: requisitionSlipActions.NEW,
		name: 'New',
	},
	{
		value: requisitionSlipActions.SEEN,
		name: 'Seen',
	},
	{
		value: requisitionSlipActions.F_OS1_CREATING,
		name: 'F-OS1 Creating',
	},
	{
		value: requisitionSlipActions.F_OS1_CREATED,
		name: 'F-OS1 Created',
	},
	{
		value: requisitionSlipActions.F_OS1_PREPARING,
		name: 'F-OS1 Preparing',
	},
	{
		value: requisitionSlipActions.F_OS1_PREPARED,
		name: 'F-OS1 Prepared',
	},
	{
		value: requisitionSlipActions.F_DS1_CREATING,
		name: 'F-DS1 Creating',
	},
	{
		value: requisitionSlipActions.F_DS1_CREATED,
		name: 'F-DS1 Created',
	},
	{
		value: requisitionSlipActions.F_DS1_DELIVERING,
		name: 'F-DS1 Delivering',
	},
	{
		value: requisitionSlipActions.F_DS1_DELIVERED_DONE,
		name: 'F-DS1 Delivered (Done)',
	},
	{
		value: requisitionSlipActions.F_DS1_DELIVERED_ERROR,
		name: 'F-DS1 Delivered (Error)',
	},
	{
		value: requisitionSlipActions.OUT_OF_STOCK,
		name: 'Out of Stock',
	},
];

export const requisitionSlipActionsOptionsWithAll = [
	{
		value: 'all',
		name: 'All',
	},
	...requisitionSlipActionsOptions,
];

export const preparationSlipStatusOptions = [
	{
		value: 'all',
		name: 'All',
	},
	{
		value: preparationSlipStatus.NEW,
		name: 'New',
	},
	{
		value: preparationSlipStatus.PREPARING,
		name: 'Preparing',
	},
	{
		value: preparationSlipStatus.COMPLETED,
		name: 'Completed',
	},
];

export const deliveryReceiptProductOptions = [
	{
		name: upperFirst(deliveryReceiptProductStatus.RESOLVED),
		value: deliveryReceiptProductStatus.RESOLVED,
	},
	{
		name: upperFirst(deliveryReceiptProductStatus.INVESTIGATION),
		value: deliveryReceiptProductStatus.INVESTIGATION,
	},
];

export const booleanOptions = [
	{
		id: 'no',
		label: 'No',
		value: false,
	},
	{
		id: 'yes',
		label: 'Yes',
		value: true,
	},
];

export const branchProductStatusOptions = [
	{
		name: 'Available',
		value: productStatus.AVAILABLE,
	},
	{
		name: 'Reorder',
		value: productStatus.REORDER,
	},
	{
		name: 'Out of Stock',
		value: productStatus.OUT_OF_STOCK,
	},
];

export const branchProductStatusOptionsWithAll = [
	{
		name: 'All',
		value: 'all',
	},
	{
		name: 'Available',
		value: productStatus.AVAILABLE,
	},
	{
		name: 'Reorder',
		value: productStatus.REORDER,
	},
	{
		name: 'Out of Stock',
		value: productStatus.OUT_OF_STOCK,
	},
];

export const userTypeOptions = [
	{
		name: 'Branch Manager',
		value: userTypes.BRANCH_MANAGER,
	},
	{
		name: 'Branch Personnel',
		value: userTypes.BRANCH_PERSONNEL,
	},
	{
		name: 'Office Manager',
		value: userTypes.OFFICE_MANAGER,
	},
	{
		name: 'Admin',
		value: userTypes.ADMIN,
	},
];

export const userTypeBranchOptions = [
	{
		name: 'Branch Manager',
		value: userTypes.BRANCH_MANAGER,
	},
	{
		name: 'Branch Personnel',
		value: userTypes.BRANCH_PERSONNEL,
	},
];

export const checkingTypesOptions = [
	{
		id: productCheckingTypes.DAILY,
		label: 'Daily Audit',
		value: productCheckingTypes.DAILY,
	},
	{
		id: productCheckingTypes.RANDOM,
		label: 'Random Audit',
		value: productCheckingTypes.RANDOM,
	},
];

// For keyboard listeners
export const dtrShortcutKeys = ['F1'];
export const appSettingsShortcutKeys = ['meta+s', 'ctrl+s'];
export const othersShortcutKeys = ['ctrl+o', 'meta+o'];
export const cashCollectionShortcutKeys = ['F2', 'ctrl+c', 'meta+c'];
export const endSessionShortcutKeys = ['ctrl+e', 'meta+e'];
export const textcodeShortcutKeys = ['F3'];
export const deleteItemShortcutKeys = ['F4', 'ctrl+d', 'meta+d'];
export const discountItemShortcutKeys = ['F5', 'ctrl+f', 'meta+f'];
export const discountAmountShortcutKeys = ['ctrl+z', 'meta+z'];
export const editClientShortcutKeys = ['F6', 'ctrl+x', 'meta+x'];
export const editQuantityShortcutKeys = ['F7', 'ctrl+q', 'meta+q'];
export const tenderShortcutKeys = ['F8', 'ctrl+a', 'meta+a'];
export const queueResumeShortcutKeys = ['F9', 'ctrl+h', 'meta+h'];
export const searchShortcutKeys = ['F10'];
export const voidShortcutKeys = ['F11', 'ctrl+v', 'meta+v'];
export const resetShortcutKeys = ['F12', 'ctrl+r', 'meta+r'];
export const reprintInvoiceShortcutKeys = ['ctrl+p', 'meta+p'];

// For display
export const othersShortcutKeysDisplay = ['CTRL + O'];
export const cashCollectionShortcutKeysDisplay = ['F2', 'CTRL + C'];
export const endSessionShortcutKeysDisplay = ['CTRL + E'];
export const textcodeShortcutKeysDisplay = ['F3'];
export const deleteItemShortcutKeysDisplay = ['F4', 'CTRL + D'];
export const discountItemShortcutKeysDisplay = ['F5', 'CTRL + F'];
export const discountAmountShortcutKeysDisplay = ['CTRL + Z'];
export const editClientShortcutKeysDisplay = ['F6', 'CTRL + X'];
export const editQuantityShortcutKeysDisplay = ['F7', 'CTRL + Q'];
export const tenderShortcutKeysDisplay = ['F8', 'CTRL + A'];
export const queueResumeShortcutKeysDisplay = ['F9', 'CTRL + H'];
export const searchShortcutKeysDisplay = ['F10', 'CTRL + S'];
export const voidShortcutKeysDisplay = ['F11', 'CTRL + V'];
export const resetShortcutKeysDisplay = ['F12', 'CTRL + R'];
export const reprintInvoiceShortcutKeysDisplay = ['CTRL + P'];
