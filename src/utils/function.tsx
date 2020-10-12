import { message } from 'antd';
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
	FDS1CreatedBadgePill,
	FDS1CreatingBadgePill,
	FDS1DeliveredBadgePill,
	FDS1DeliveringBadgePill,
	FOS1CreatedBadgePill,
	FOS1CreatingBadgePill,
	FOS1PreparedBadgePill,
	FOS1PreparingBadgePill,
	NewBadgePill,
	NotAddedToOSBadgePill,
	OutOfStocksBadgePill,
	ReorderBadgePill,
	ROW_HEIGHT,
	SeenBadgePill,
} from '../components';
import { BadgePill } from '../components/elements';
import { EMPTY_CELL } from '../global/constants';
import {
	branchProductStatus,
	deliveryReceiptStatus,
	orderSlipStatus,
	OSDRStatus,
	preparationSlipStatus,
	requisitionSlipActions,
	requisitionSlipProductStatus,
	request,
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
			return <NewBadgePill />;
		}
		case requisitionSlipActions.SEEN: {
			return <SeenBadgePill />;
		}
		case requisitionSlipActions.F_OS1_CREATING: {
			return <FOS1CreatingBadgePill />;
		}
		case requisitionSlipActions.F_OS1_CREATED: {
			return <FOS1CreatedBadgePill />;
		}
		case requisitionSlipActions.F_OS1_PREPARING: {
			return <FOS1PreparingBadgePill />;
		}
		case requisitionSlipActions.F_OS1_PREPARED: {
			return <FOS1PreparedBadgePill />;
		}
		case requisitionSlipActions.F_DS1_CREATING: {
			return <FDS1CreatingBadgePill />;
		}
		case requisitionSlipActions.F_DS1_CREATED: {
			return <FDS1CreatedBadgePill />;
		}
		case requisitionSlipActions.F_DS1_DELIVERING: {
			return <FDS1DeliveringBadgePill />;
		}
		case requisitionSlipActions.F_DS1_DELIVERED: {
			return <FDS1DeliveredBadgePill />;
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
