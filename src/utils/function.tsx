import { message, Modal } from 'antd';
import { floor, memoize } from 'lodash';
import moment from 'moment';
import React from 'react';
import {
	AddedToOSBadgePill,
	AvailableBadgePill,
	ColoredText,
	coloredTextType,
	CompletedBadgePill,
	DoneBadgePill,
	ErrorBadgePill,
	NewBadgePill,
	NotAddedToOSBadgePill,
	OutOfStocksBadgePill,
	ReorderBadgePill,
	ROW_HEIGHT,
} from '../components';
import { BadgePill, Input } from '../components/elements';
import { EMPTY_CELL } from '../global/constants';
import {
	branchProductStatus,
	deliveryReceiptStatus,
	orderSlipStatus,
	OSDRStatus,
	preparationSlipStatus,
	productTypes,
	request,
	requisitionSlipActions,
	requisitionSlipProductStatus,
	unitOfMeasurementTypes,
	userTypes,
} from '../global/types';

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const calculateTableHeight = (listLength) => {
	const MAX_ROW_COUNT = 6;
	return ROW_HEIGHT * (listLength <= MAX_ROW_COUNT ? listLength : MAX_ROW_COUNT);
};

export const showMessage = (status, successMessage, errorMessage) => {
	if (status === request.SUCCESS) {
		message.success(successMessage);
	} else if (status === request.ERROR) {
		message.error(errorMessage);
	}
};

interface ConfirmPassword {
	title?: string;
	label?: string;
	onSuccess: any;
}
export const confirmPassword = ({ title = 'Input Password', onSuccess }: ConfirmPassword) => {
	let password = '';

	Modal.confirm({
		title,
		centered: true,
		className: 'ConfirmPassword',
		okText: 'Submit',
		content: (
			<div>
				<Input onChange={(value) => (password = value)} />
			</div>
		),
		onOk: (close) => {
			if (password === 'generic123') {
				onSuccess();
				close();
			} else {
				message.error('Incorrect password');
			}
		},
	});
};

export const formatDateTime = memoize((datetime) => moment(datetime).format('MM/DD/YYYY h:mma'));

export const formatDate = memoize((date) => moment(date).format('MM/DD/YYYY'));

export const convertToBulk = (pieces, piecesInBulk) => floor(pieces / piecesInBulk);

export const convertToPieces = (bulk, piecesInBulk) => bulk * piecesInBulk;

export const modifiedCallback = (callback, successMessage, errorMessage, extraCallback = null) => {
	return (response) => {
		showMessage(response?.status, successMessage, errorMessage);
		callback(response);
		if (extraCallback) {
			extraCallback(response);
		}
	};
};

export const modifiedExtraCallback = (callback, extraCallback = null) => {
	return (response) => {
		callback(response);
		if (extraCallback) {
			extraCallback(response);
		}
	};
};

export const getColoredText = memoize((key, isDefault, x, y, isOverOnlyIfDefault = false) => {
	let text = `${x}/${y}`;

	if (isDefault) {
		text = isOverOnlyIfDefault ? text : y;
		return <ColoredText type={coloredTextType.DEFAULT} text={text} />;
	} else if (x !== y) {
		return <ColoredText type={coloredTextType.ERROR} text={text} />;
	} else if (x === y) {
		return <ColoredText type={coloredTextType.PRIMARY} text={text} />;
	}

	return null;
});

export const getBranchProductStatus = memoize((status) => {
	switch (status) {
		case branchProductStatus.AVAILABLE: {
			return <AvailableBadgePill />;
		}
		case branchProductStatus.REORDER: {
			return <ReorderBadgePill />;
		}
		case branchProductStatus.OUT_OF_STOCK: {
			return <OutOfStocksBadgePill />;
		}
	}
});

export const getRequisitionSlipStatus = memoize((status) => {
	switch (status) {
		case requisitionSlipActions.NEW: {
			return <BadgePill label="(1/6) New" variant="secondary" />;
		}
		case requisitionSlipActions.SEEN: {
			return <BadgePill label="(2/6) Seen" />;
		}
		case requisitionSlipActions.F_OS1_CREATING: {
			return <BadgePill label="(3/6) F-OS1 Creating" />;
		}
		case requisitionSlipActions.F_OS1_CREATED: {
			return <BadgePill label="(3/6) F-OS1 Created" />;
		}
		case requisitionSlipActions.F_OS1_PREPARING: {
			return <BadgePill label="(4/6) F-OS1 Preparing" />;
		}
		case requisitionSlipActions.F_OS1_PREPARED: {
			return <BadgePill label="(4/6) F-OS1 Prepared" />;
		}
		case requisitionSlipActions.F_DS1_CREATING: {
			return <BadgePill label="(5/6) F-DS1 Creating" />;
		}
		case requisitionSlipActions.F_DS1_CREATED: {
			return <BadgePill label="(5/6) F-DS1 Created" />;
		}
		case requisitionSlipActions.F_DS1_DELIVERING: {
			return <BadgePill label="(6/6) F-DS1 Delivering" />;
		}
		case requisitionSlipActions.F_DS1_DELIVERED_DONE: {
			return <BadgePill label="(6/6) F-DS1 Delivered" variant="primary" />;
		}
		case requisitionSlipActions.F_DS1_DELIVERED_ERROR: {
			return <BadgePill label="(6/6) F-DS1 Delivered" variant="error" />;
		}
		case requisitionSlipActions.OUT_OF_STOCK: {
			return <BadgePill label="Out Of Stock" variant="secondary" />;
		}
	}
});

export const getRequisitionSlipProductStatus = memoize((status) => {
	switch (status) {
		case requisitionSlipProductStatus.ADDED_TO_OS: {
			return <AddedToOSBadgePill />;
		}
		case requisitionSlipProductStatus.NOT_ADDED_TO_OS: {
			return <NotAddedToOSBadgePill />;
		}
	}
});

export const getOrderSlipStatus = (status, percentage, osdrStatus = null) => {
	switch (status) {
		case orderSlipStatus.PREPARING: {
			return <BadgePill label={`Preparing (${percentage}%)`} />;
		}
		case orderSlipStatus.PREPARED: {
			return <BadgePill label="Prepared" />;
		}
		case orderSlipStatus.DELIVERED: {
			return <BadgePill label="Delivered" variant="secondary" />;
		}
		case orderSlipStatus.RECEIVED: {
			if (osdrStatus === OSDRStatus.DONE) {
				return <BadgePill label="Received (Done)" variant="primary" />;
			}

			if (osdrStatus === OSDRStatus.ERROR) {
				return <BadgePill label="Received (Error)" variant="error" />;
			}

			return <BadgePill label="Received" />;
		}
	}
};

export const getPreparationSlipStatus = memoize((status) => {
	switch (status) {
		case preparationSlipStatus.NEW: {
			return <NewBadgePill />;
		}
		case preparationSlipStatus.COMPLETED: {
			return <CompletedBadgePill />;
		}
	}
});

export const getUserTypeName = memoize((type) => {
	switch (type) {
		case userTypes.OFFICE_MANAGER: {
			return 'Office Manager';
		}
		case userTypes.BRANCH_MANAGER: {
			return 'Branch Manager';
		}
		case userTypes.BRANCH_PERSONNEL: {
			return 'Branch Personnel';
		}
	}
});

export const getOSDRStatus = memoize((status) => {
	switch (status) {
		case OSDRStatus.DONE: {
			return <DoneBadgePill />;
		}
		case OSDRStatus.ERROR: {
			return <ErrorBadgePill />;
		}
		default: {
			return EMPTY_CELL;
		}
	}
});

export const getDeliveryReceiptStatus = memoize((key, status, isAdjusted) => {
	const isAdjustedText = isAdjusted ? '(Adjusted)' : '';
	switch (status) {
		case deliveryReceiptStatus.RESOLVED: {
			return <BadgePill label={`Resolved ${isAdjustedText}`} variant="primary" />;
		}
		case deliveryReceiptStatus.DONE: {
			return <BadgePill label={`Done ${isAdjustedText}`} variant="primary" />;
		}
		case deliveryReceiptStatus.INVESTIGATION: {
			return <BadgePill label={`Investigation ${isAdjustedText}`} variant="secondary" />;
		}
		default: {
			return EMPTY_CELL;
		}
	}
});

export const getUnitOfMeasurement = memoize((unitOfMeasurement) => {
	switch (unitOfMeasurement) {
		case unitOfMeasurementTypes.WEIGHING: {
			return 'Weighing';
		}
		case unitOfMeasurementTypes.NON_WEIGHING: {
			return 'Non-weighing';
		}
		default: {
			return EMPTY_CELL;
		}
	}
});

export const getProductType = memoize((type) => {
	switch (type) {
		case productTypes.DRY: {
			return 'Dry';
		}
		case productTypes.WET: {
			return 'Wet';
		}
		default: {
			return EMPTY_CELL;
		}
	}
});
