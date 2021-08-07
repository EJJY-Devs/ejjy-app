import { message, Modal } from 'antd';
import dayjs from 'dayjs';
import { floor, isArray, isString, memoize } from 'lodash';
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
import { BadgePill, UncontrolledInput } from '../components/elements';
import { EMPTY_CELL, LOCAL_IP_ADDRESS_KEY } from '../global/constants';
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
	transactionStatus,
	unitOfMeasurementTypes,
	userTypes,
} from '../global/types';

export const getLocalIpAddress = () =>
	localStorage.getItem(LOCAL_IP_ADDRESS_KEY);

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const calculateTableHeight = (listLength) => {
	const MAX_ROW_COUNT = 6;
	return (
		ROW_HEIGHT * (listLength <= MAX_ROW_COUNT ? listLength : MAX_ROW_COUNT)
	);
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
export const confirmPassword = ({
	title = 'Input Password',
	onSuccess,
}: ConfirmPassword) => {
	let password = '';

	Modal.confirm({
		title,
		centered: true,
		className: 'ConfirmPassword',
		okText: 'Submit',
		content: (
			<UncontrolledInput
				type="password"
				onChange={(value) => {
					password = value;
				}}
			/>
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

export const numberWithCommas = (x) =>
	x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');

export const removeCommas = (x) => x?.toString()?.replace(/,/g, '') || '';

export const formatDateTime = memoize((datetime) =>
	dayjs(datetime).format('MM/DD/YYYY h:mma'),
);

export const formatDateTimeExtended = memoize((datetime) =>
	dayjs(datetime).format('MMMM D, YYYY h:mma'),
);

export const formatDateTimeShortMonth = memoize((datetime) =>
	dayjs(datetime).format('MMM D, YYYY h:mma'),
);

export const formatDate = memoize((date) => dayjs(date).format('MM/DD/YYYY'));

export const convertToBulk = (pieces, piecesInBulk) =>
	floor(pieces / piecesInBulk);

export const convertToPieces = (bulk, piecesInBulk) => bulk * piecesInBulk;

export const modifiedCallback =
	(callback, successMessage, errorMessage, extraCallback = null) =>
	(response) => {
		showMessage(response?.status, successMessage, errorMessage);
		callback(response);
		if (extraCallback) {
			extraCallback(response);
		}
	};

export const modifiedExtraCallback =
	(callback, extraCallback = null) =>
	(response) => {
		callback(response);
		if (extraCallback) {
			extraCallback(response);
		}
	};

export const convertIntoArray = (errors, prefixMessage = null) => {
	const prefix = prefixMessage ? `${prefixMessage}: ` : '';
	let array = [];

	if (isString(errors)) {
		array = [prefix + errors];
	} else if (isArray(errors)) {
		array = errors.map((error) => prefix + error);
	}

	return array;
};

export const showErrorMessages = (errors) => {
	if (isString(errors)) {
		message.error(errors);
	} else if (isArray(errors)) {
		errors.forEach((error) => message.error(error));
	}
};

export const getColoredText = memoize(
	(key, isDefault, x, y, isOverOnlyIfDefault = false) => {
		let text = `${x}/${y}`;
		let component = null;

		if (isDefault) {
			text = isOverOnlyIfDefault ? text : y;
			component = <ColoredText type={coloredTextType.DEFAULT} text={text} />;
		}
		if (x !== y) {
			component = <ColoredText type={coloredTextType.ERROR} text={text} />;
		}
		if (x === y) {
			component = <ColoredText type={coloredTextType.PRIMARY} text={text} />;
		}

		return component;
	},
);

export const getBranchProductStatus = memoize((status: string) => {
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
		default:
			return null;
	}
});

export const getRequisitionSlipStatus = (status, userType) => {
	if (userType === userTypes.OFFICE_MANAGER) {
		switch (status) {
			case requisitionSlipActions.NEW: {
				return <BadgePill label="(1/6) New" variant="orange" />;
			}
			case requisitionSlipActions.SEEN: {
				return <BadgePill label="(2/6) Seen" variant="yellow" />;
			}
			case requisitionSlipActions.F_OS1_CREATING: {
				return <BadgePill label="(3/6) F-OS1 Creating" variant="yellow" />;
			}
			case requisitionSlipActions.F_OS1_CREATED: {
				return <BadgePill label="(3/6) F-OS1 Created" variant="yellow" />;
			}
			case requisitionSlipActions.F_OS1_PREPARING: {
				return <BadgePill label="(4/6) F-OS1 Preparing" variant="yellow" />;
			}
			case requisitionSlipActions.F_OS1_PREPARED: {
				return <BadgePill label="(4/6) F-OS1 Prepared" variant="yellow" />;
			}
			case requisitionSlipActions.F_DS1_CREATING: {
				return <BadgePill label="(5/6) F-DS1 Creating" variant="yellow" />;
			}
			case requisitionSlipActions.F_DS1_CREATED: {
				return <BadgePill label="(5/6) F-DS1 Created" variant="yellow" />;
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
			default:
				return null;
		}
	} else if (userType === userTypes.BRANCH_MANAGER) {
		switch (status) {
			case requisitionSlipActions.NEW: {
				return <BadgePill label="(1/6) New" variant="orange" />;
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
				return <BadgePill label="(5/6) F-DS1 Creating" variant="yellow" />;
			}
			case requisitionSlipActions.F_DS1_CREATED: {
				return <BadgePill label="(5/6) F-DS1 Created" variant="yellow" />;
			}
			case requisitionSlipActions.F_DS1_DELIVERING: {
				return <BadgePill label="(6/6) F-DS1 Delivering" variant="yellow" />;
			}
			case requisitionSlipActions.F_DS1_DELIVERED_DONE: {
				return <BadgePill label="(6/6) F-DS1 Delivered" />;
			}
			case requisitionSlipActions.F_DS1_DELIVERED_ERROR: {
				return <BadgePill label="(6/6) F-DS1 Delivered" />;
			}
			case requisitionSlipActions.OUT_OF_STOCK: {
				return <BadgePill label="Out Of Stock" />;
			}
			default:
				return null;
		}
	}

	return null;
};

export const getRequisitionSlipProductStatus = memoize((status) => {
	switch (status) {
		case requisitionSlipProductStatus.ADDED_TO_OS: {
			return <AddedToOSBadgePill />;
		}
		case requisitionSlipProductStatus.NOT_ADDED_TO_OS: {
			return <NotAddedToOSBadgePill />;
		}
		default:
			return null;
	}
});

export const getOrderSlipStatus = (status, percentage, osdrStatus = null) => {
	switch (status) {
		case orderSlipStatus.PREPARING: {
			return <BadgePill label={`Preparing (${percentage}%)`} />;
		}
		case orderSlipStatus.PREPARED: {
			return <BadgePill label="Prepared" variant="yellow" />;
		}
		case orderSlipStatus.DELIVERED: {
			return <BadgePill label="Delivered" />;
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
		default:
			return null;
	}
};

export const getOrderSlipStatusBranchManager = (
	status,
	screenType,
	percentage,
	osdrStatus = null,
) => {
	switch (status) {
		case orderSlipStatus.PREPARING: {
			return (
				<BadgePill
					label={`Preparing (${percentage}%)`}
					variant={screenType === 'RS' ? null : 'yellow'}
				/>
			);
		}
		case orderSlipStatus.PREPARED: {
			return <BadgePill label="Prepared" />;
		}
		case orderSlipStatus.DELIVERED: {
			return (
				<BadgePill
					label="Delivered"
					variant={screenType === 'RS' ? 'yellow' : null}
				/>
			);
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
		default:
			return null;
	}
};

export const getOrderSlipStatusBranchManagerText = (
	status,
	screenType,
	percentage,
	osdrStatus = null,
) => {
	switch (status) {
		case orderSlipStatus.PREPARING: {
			return `Preparing (${percentage}%)`;
		}
		case orderSlipStatus.PREPARED: {
			return 'Prepared';
		}
		case orderSlipStatus.DELIVERED: {
			return 'Delivered';
		}
		case orderSlipStatus.RECEIVED: {
			if (osdrStatus === OSDRStatus.DONE) {
				return 'Received (Done)';
			}

			if (osdrStatus === OSDRStatus.ERROR) {
				return 'Received (Error)';
			}

			return 'Received';
		}
		default:
			return '';
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
		default:
			return null;
	}
});

export const getUserTypeName = memoize((type) => {
	switch (type) {
		case userTypes.ADMIN: {
			return 'Admin';
		}
		case userTypes.OFFICE_MANAGER: {
			return 'Office Manager';
		}
		case userTypes.BRANCH_MANAGER: {
			return 'Branch Manager';
		}
		case userTypes.BRANCH_PERSONNEL: {
			return 'Branch Personnel';
		}
		default:
			return null;
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
			return (
				<BadgePill label={`Resolved ${isAdjustedText}`} variant="primary" />
			);
		}
		case deliveryReceiptStatus.DONE: {
			return <BadgePill label={`Done ${isAdjustedText}`} variant="primary" />;
		}
		case deliveryReceiptStatus.INVESTIGATION: {
			return (
				<BadgePill
					label={`Investigation ${isAdjustedText}`}
					variant="secondary"
				/>
			);
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

export const getTransactionStatus = memoize((status) => {
	switch (status) {
		case transactionStatus.FULLY_PAID: {
			return <BadgePill label="Fully Paid" variant="primary" />;
		}
		case transactionStatus.HOLD: {
			return <BadgePill label="Hold" variant="secondary" />;
		}
		case transactionStatus.VOID_CANCELLED: {
			return <BadgePill label="Cancelled" />;
		}
		case transactionStatus.VOID_EDITED: {
			return <BadgePill label="Edited" />;
		}
		default: {
			return EMPTY_CELL;
		}
	}
});

export const isUserFromBranch = memoize((userType) =>
	[userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL].includes(userType),
);

export const onCallback =
	(callback, onSuccess = null, onError = null) =>
	(response) => {
		callback(response);

		if (onSuccess && response?.status === request.SUCCESS) {
			onSuccess(response);
		}

		if (onError && response?.status === request.ERROR) {
			onError(response);
		}
	};

export const getKeyDownCombination = (keyboardEvent) => {
	let firstKey = '';

	if (keyboardEvent?.altKey) {
		firstKey = 'alt+';
	}

	if (keyboardEvent?.ctrlKey) {
		firstKey = 'ctrl+';
	}

	if (keyboardEvent?.metaKey) {
		firstKey = 'meta+';
	}

	if (keyboardEvent?.shiftKey) {
		firstKey = 'shift+';
	}

	return firstKey + keyboardEvent?.key;
};

export const formatMoney = (number) => Number(number).toFixed(2);

export const getUrlPrefix = memoize((userType) => {
	let prefix = '';

	switch (userType) {
		case userTypes.ADMIN:
			prefix = '/admin';
			break;
		case userTypes.OFFICE_MANAGER:
			prefix = '/office-manager';
			break;
		case userTypes.BRANCH_MANAGER:
			prefix = '/branch-manager';
			break;
		case userTypes.BRANCH_PERSONNEL:
			prefix = '/branch-personel';
			break;
		default:
			break;
	}

	return prefix;
});

export const formatBalance = (
	unitOfMeasurement: string,
	currentBalance: number,
): string => {
	const balance = Number(currentBalance);

	return unitOfMeasurement === unitOfMeasurementTypes.WEIGHING
		? balance.toFixed(3)
		: balance.toFixed(0);
};
