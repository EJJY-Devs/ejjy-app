import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableHeader } from '../../../../../components';
import { Box } from '../../../../../components/elements';
import { types as orderSlipsTypes } from '../../../../../ducks/order-slips';
import {
	actions as prActions,
	selectors as prSelectors,
} from '../../../../../ducks/requisition-slips';
import {
	orderSlipStatus,
	request,
	requisitionSlipActions,
} from '../../../../../global/types';
import { useActionDispatch } from '../../../../../hooks/useActionDispatch';
import { useOrderSlips } from '../../../hooks/useOrderSlips';
import { OrderSlipsTable } from './OrderSlipsTable';
import { ReceiveDeliveryReceiptModal } from './ReceiveDeliveryReceiptModal';
import { ViewOrderSlipModal } from './ViewOrderSlipModal';

interface Props {
	requisitionSlipId: number;
}

const pendingOrderSlipStatus = [orderSlipStatus.DELIVERED];

export const OrderSlips = ({ requisitionSlipId }: Props) => {
	// STATES
	const [selectedOrderSlip, setSelectedOrderSlip] = useState(null);
	const [viewOrderSlipVisible, setViewOrderSlipVisible] = useState(false);
	const [
		receiveDeliveryReceiptVisible,
		setReceiveDeliveryReceiptVisible,
	] = useState(false);

	// CUSTOM HOOKS
	const {
		orderSlips,
		getOrderSlipsExtended,
		status: orderSlipRequestStatus,
		recentRequest: orderSlipRecentRequest,
	} = useOrderSlips();

	const requisitionSlip = useSelector(prSelectors.selectRequisitionSlip());
	const setRequisitionSlipAction = useActionDispatch(
		prActions.setRequisitionSlipAction,
	);

	// METHODS
	// Effect: Fetch requisition slip
	useEffect(() => {
		if (requisitionSlipId) {
			getOrderSlipsExtended({
				assigned_store_id: null,
				requisition_slip_id: requisitionSlipId,
				page: 1,
			});
		}
	}, [requisitionSlipId]);

	// Effect: Update requisition slip status if status is "New/Seen" after creating order slip
	useEffect(() => {
		if (
			orderSlipRequestStatus === request.SUCCESS &&
			orderSlipRecentRequest === orderSlipsTypes.CREATE_ORDER_SLIP
		) {
			const actionRequiresUpdate = [
				requisitionSlipActions.NEW,
				requisitionSlipActions.SEEN,
			];
			if (actionRequiresUpdate.includes(requisitionSlip?.action?.action)) {
				setRequisitionSlipAction({
					action: requisitionSlipActions.F_OS1_CREATED,
				});
			}
		}
	}, [orderSlipRequestStatus, orderSlipRecentRequest]);

	const handleViewOrderSlip = (orderSlip) => {
		setSelectedOrderSlip(orderSlip);
		setViewOrderSlipVisible(true);
	};

	const handleReceiveDeliveryReceipt = (orderSlip) => {
		setSelectedOrderSlip(orderSlip);
		setReceiveDeliveryReceiptVisible(true);
	};

	const handleReceiveDeliveryReceiptSuccess = () => {
		getOrderSlipsExtended(
			{
				assigned_store_id: null,
				requisition_slip_id: requisitionSlipId,
				page: 1,
			},
			true,
		);
		setReceiveDeliveryReceiptVisible(false);
	};

	const getPendingCount = useCallback(
		() =>
			orderSlips.filter(({ status }) =>
				pendingOrderSlipStatus.includes(status?.value),
			).length,
		[orderSlips],
	);

	return (
		<Box className="px-6">
			<TableHeader title="Linked Transactions" />

			{/* <OrderSlipsTable
				orderSlips={orderSlips}
				orderSlipStatus={orderSlipRequestStatus}
				onReceiveDeliveryReceipt={handleReceiveDeliveryReceipt}
				onViewOrderSlip={handleViewOrderSlip}
			/>

			<ViewOrderSlipModal
				orderSlip={selectedOrderSlip}
				visible={viewOrderSlipVisible}
				onClose={() => setViewOrderSlipVisible(false)}
			/>

			<ReceiveDeliveryReceiptModal
				orderSlip={selectedOrderSlip}
				orderSlips={orderSlips}
				requisitionSlip={requisitionSlip}
				visible={receiveDeliveryReceiptVisible}
				onClose={() => setReceiveDeliveryReceiptVisible(false)}
				onSuccess={handleReceiveDeliveryReceiptSuccess}
			/> */}
		</Box>
	);
};
