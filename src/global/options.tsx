import { upperFirst } from 'lodash';
import {
	deliveryReceiptProductStatus,
	preparationSlipStatus,
	requisitionSlipActions,
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
		value: requisitionSlipActions.F_DS1_DELIVERED,
		name: 'F-DS1 Delivered',
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
