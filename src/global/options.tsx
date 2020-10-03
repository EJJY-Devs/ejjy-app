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
		name: '(1/6) New',
	},
	{
		value: purchaseRequestActions.SEEN,
		name: '(2/6) Seen',
	},
	{
		value: purchaseRequestActions.F_OS1_CREATING,
		name: '(3/6) F-OS1 Creating',
	},
	{
		value: purchaseRequestActions.F_OS1_CREATED,
		name: '(3/6) F-OS1 Created',
	},
	{
		value: purchaseRequestActions.F_OS1_PREPARING,
		name: '(4/6) F-OS1 Preparing',
	},
	{
		value: purchaseRequestActions.F_OS1_PREPARED,
		name: '(4/6) F-OS1 Prepared',
	},
	{
		value: purchaseRequestActions.F_DS1_CREATING,
		name: '(5/6) F-DS1 Creating',
	},
	{
		value: purchaseRequestActions.F_DS1_CREATED,
		name: '(5/6) F-DS1 Created',
	},
	{
		value: purchaseRequestActions.F_DS1_DELIVERING,
		name: '(6/6) F-DS1 Delivering',
	},
	{
		value: purchaseRequestActions.F_DS1_DELIVERED,
		name: '(6/6) F-DS1 Delivered',
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
