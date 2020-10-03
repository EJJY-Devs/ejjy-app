import { upperFirst } from 'lodash';
import {
	deliveryReceiptProductStatus,
	preparationSlipStatus,
	purchaseRequestActions,
	quantityTypes,
} from './types';

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

export const purchaseRequestActionsOptions = [
	{
		value: purchaseRequestActions.NEW,
		name: 'New',
	},
	{
		value: purchaseRequestActions.SEEN,
		name: 'Seen',
	},
	{
		value: purchaseRequestActions.F_OS1_CREATING,
		name: 'F-OS1 Creating',
	},
	{
		value: purchaseRequestActions.F_OS1_CREATED,
		name: 'F-OS1 Created',
	},
	{
		value: purchaseRequestActions.F_OS1_PREPARING,
		name: 'F-OS1 Preparing',
	},
	{
		value: purchaseRequestActions.F_OS1_PREPARED,
		name: 'F-OS1 Prepared',
	},
	{
		value: purchaseRequestActions.F_DS1_CREATING,
		name: 'F-DS1 Creating',
	},
	{
		value: purchaseRequestActions.F_DS1_CREATED,
		name: 'F-DS1 Created',
	},
	{
		value: purchaseRequestActions.F_DS1_DELIVERING,
		name: 'F-DS1 Delivering',
	},
	{
		value: purchaseRequestActions.F_DS1_DELIVERED,
		name: 'F-DS1 Delivered',
	},
];

export const purchaseRequestActionsOptionsWithAll = [
	{
		value: 'all',
		name: 'All',
	},
	...purchaseRequestActionsOptions,
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
