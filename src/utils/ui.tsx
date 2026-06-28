import { Input, message, Modal, Tag } from 'antd';
import {
	AddedToOSBadgePill,
	AvailableBadgePill,
	ColoredText,
	CompletedBadgePill,
	DoneBadgePill,
	ErrorBadgePill,
	NewBadgePill,
	NotAddedToOSBadgePill,
	OutOfStocksBadgePill,
	PendingBadgePill,
	ReorderBadgePill,
} from 'components';
import { BadgePill } from 'components/elements';
import { getInvoiceType } from 'ejjy-global';
import {
	accountTypes,
	ADMIN_PASSWORD,
	appTypes,
	backOrdersStatuses,
	branchMachineTypes,
	cashBreakdownCategories,
	cashBreakdownTypes,
	deliveryReceiptStatus,
	EMPTY_CELL,
	headOfficeTypes,
	orderSlipStatus,
	OSDRStatus,
	preparationSlipStatus,
	productStatus,
	productTypes,
	request,
	requisitionSlipActions,
	requisitionSlipProductStatus,
	returnItemSlipsStatuses,
	unitOfMeasurementTypes,
	userTypes,
} from 'global';
import _ from 'lodash';
import React from 'react';
import {
	getAppType,
	getHeadOfficeType,
	getLocalApiUrl,
	getOnlineApiUrl,
} from 'utils/localStorage';

export const DELIVERY_INVOICE = 'delivery_invoice';

export const getInvoiceTypeLabel = (invoiceType: string): string => {
	if (invoiceType === DELIVERY_INVOICE) return 'Delivery SI';
	return getInvoiceType(invoiceType);
};

// Getters
export const getColoredText = (
	isDefault,
	x,
	y,
	isOverOnlyIfDefault = false,
) => {
	let text = `${x}/${y}`;
	let component = null;

	if (isDefault) {
		text = isOverOnlyIfDefault ? text : y;
		component = <ColoredText text={text} variant="default" />;
	} else if (x !== y) {
		component = <ColoredText text={text} variant="error" />;
	} else if (x === y) {
		component = <ColoredText text={text} variant="primary" />;
	}

	return component;
};

export const getBranchProductStatus = _.memoize((status: string) => {
	switch (status) {
		case productStatus.AVAILABLE: {
			return <AvailableBadgePill />;
		}
		case productStatus.REORDER: {
			return <ReorderBadgePill />;
		}
		case productStatus.OUT_OF_STOCK: {
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

export const getRequisitionSlipProductStatus = _.memoize((status) => {
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

export const getPreparationSlipStatus = _.memoize((status) => {
	switch (status) {
		case preparationSlipStatus.NEW: {
			return <NewBadgePill />;
		}
		case preparationSlipStatus.COMPLETED: {
			return <CompletedBadgePill />;
		}
		case preparationSlipStatus.PARTIALLY_COMPLETED: {
			return <BadgePill label="Partially Completed" variant="secondary" />;
		}
		case preparationSlipStatus.ERROR: {
			return <ErrorBadgePill />;
		}
		default:
			return null;
	}
});

export const getUserTypeName = _.memoize((type) => {
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

export const getOSDRStatus = _.memoize((status) => {
	switch (status) {
		case OSDRStatus.DONE: {
			return <Tag color="green">Done</Tag>;
		}
		case OSDRStatus.ERROR: {
			return <ErrorBadgePill />;
		}
		default: {
			return EMPTY_CELL;
		}
	}
});

export const getDeliveryReceiptStatus = _.memoize((key, status, isAdjusted) => {
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

export const getUnitOfMeasurement = _.memoize((unitOfMeasurement) => {
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

export const getProductType = _.memoize((type) => {
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

export const getReturnItemSlipStatus = _.memoize((status) => {
	switch (status) {
		case returnItemSlipsStatuses.DONE: {
			return <DoneBadgePill />;
		}
		case returnItemSlipsStatuses.PENDING: {
			return <PendingBadgePill />;
		}
		case returnItemSlipsStatuses.ERROR: {
			return <ErrorBadgePill />;
		}
		default: {
			return EMPTY_CELL;
		}
	}
});

export const getBackOrderStatus = _.memoize((status) => {
	switch (status) {
		case backOrdersStatuses.DONE: {
			return <DoneBadgePill />;
		}
		case backOrdersStatuses.PENDING: {
			return <PendingBadgePill />;
		}
		case backOrdersStatuses.ERROR: {
			return <ErrorBadgePill />;
		}
		default: {
			return EMPTY_CELL;
		}
	}
});

export const getUrlPrefix = _.memoize((userType) => {
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

export const getCashBreakdownTypeDescription = (category, type) => {
	let description = '';

	if (category === cashBreakdownCategories.CASH_BREAKDOWN) {
		switch (type) {
			case cashBreakdownTypes.START_SESSION:
				description = 'Start Session';
				break;
			case cashBreakdownTypes.MID_SESSION:
				description = 'Cash Collection';
				break;
			case cashBreakdownTypes.END_SESSION:
				description = 'End Session';
				break;
			default:
				description = '';
		}
	} else if (category === cashBreakdownCategories.CASH_IN) {
		description = ' Cash In';
	} else if (category === cashBreakdownCategories.CASH_OUT) {
		description = ' Cash Out';
	}

	return description;
};

export const getId = (object) => {
	const onlineApiUrl = getOnlineApiUrl();
	const localApiUrl = getLocalApiUrl();
	const appType = getAppType();

	/* Condition on what API to use for CUD services:
	 *       BO    HO
	 *  NSA  ON    ON
	 *  SA   OF    X
	 */

	let id = object?.id;

	if (
		appType === appTypes.HEAD_OFFICE &&
		getHeadOfficeType() === headOfficeTypes.TEST
	) {
		return id;
	}

	if (
		(appType === appTypes.BACK_OFFICE && localApiUrl !== onlineApiUrl) ||
		appType === appTypes.HEAD_OFFICE
	) {
		id = object?.online_id;
	}

	return id;
};

export const getAccountTypeName = (type) => {
	let typeName = '';

	switch (type) {
		case accountTypes.PERSONAL:
			typeName = 'Personal';
			break;
		case accountTypes.CORPORATE:
			typeName = 'Corporate';
			break;
		case accountTypes.EMPLOYEE:
			typeName = 'Employee';
			break;
		case accountTypes.GOVERNMENT:
			typeName = 'Government';
			break;
		default:
			typeName = '';
	}

	return typeName;
};

export const getBranchMachineTypeName = (type) => {
	let typeName = '';

	switch (type) {
		case branchMachineTypes.CASHIERING:
			typeName = 'Cashiering';
			break;
		case branchMachineTypes.SCALE:
			typeName = 'Scale';
			break;
		case branchMachineTypes.SCALE_AND_CASHIERING:
			typeName = 'Scale and Cashiering';
			break;
		default:
			typeName = '';
	}

	return typeName;
};

// Messages

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

	const modal = Modal.confirm({
		title,
		centered: true,
		className: 'Modal__hasFooter',
		okText: 'Submit',
		content: (
			<Input.Password
				placeholder="Input Password"
				onChange={(e) => {
					password = e.target.value;
				}}
				onPressEnter={() => {
					handleSubmit();
				}}
			/>
		),
		onOk: () => {
			handleSubmit();
		},
	});

	const handleSubmit = () => {
		if (password === ADMIN_PASSWORD) {
			onSuccess();
			modal.destroy();
		} else {
			message.error('Incorrect password');
		}
	};
};

export const showMessage = (status, successMessage, errorMessage) => {
	if (status === request.SUCCESS) {
		message.success(successMessage);
	} else if (status === request.ERROR) {
		message.error(errorMessage);
	}
};

export const showErrorMessages = (errors) => {
	if (_.isString(errors)) {
		message.error(errors);
	} else if (_.isArray(errors)) {
		errors.forEach((error) => message.error(error));
	}
};

// Others

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const isUserFromBranch = _.memoize((userType) =>
	[userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL].includes(userType),
);

export const isUserFromOffice = _.memoize((userType) =>
	[userTypes.ADMIN, userTypes.OFFICE_MANAGER].includes(userType),
);

export const isStandAlone = () => getLocalApiUrl() === getOnlineApiUrl();

export const isCUDShown = (userType) =>
	isUserFromBranch(userType) ? isStandAlone() : true;
