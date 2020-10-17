/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableHeader } from '../../../../../components';
import { Box } from '../../../../../components/elements';
import { types as orderSlipsTypes } from '../../../../../ducks/order-slips';
import {
	actions as prActions,
	selectors as prSelectors,
} from '../../../../../ducks/requisition-slips';
import { requisitionSlipActions, request } from '../../../../../global/types';
import { useActionDispatch } from '../../../../../hooks/useActionDispatch';
import { useOrderSlips } from '../../../hooks/useOrderSlips';
import { OrderSlipsTable } from './OrderSlipsTable';
import { ReceiveDeliveryReceiptModal } from './ReceiveDeliveryReceiptModal';
import { ViewOrderSlipModal } from './ViewOrderSlipModal';

interface Props {
	requisitionSlipId: number;
}

export const OrderSlips = ({ requisitionSlipId }: Props) => {
	// State: Selection
	const [selectedOrderSlip, setSelectedOrderSlip] = useState(null);

	// State: Modal
	const [viewOrderSlipVisible, setViewOrderSlipVisible] = useState(false);
	const [receiveDeliveryReceiptVisible, setReceiveDeliveryReceiptVisible] = useState(false);

	const {
		orderSlips,
		getOrderSlipsExtended,
		status: orderSlipStatus,
		recentRequest: orderSlipRecentRequest,
	} = useOrderSlips();

	const requisitionSlip = useSelector(prSelectors.selectRequisitionSlip());
	const setRequisitionSlipAction = useActionDispatch(prActions.setRequisitionSlipAction);

	// Effect: Fetch requisition slip
	useEffect(() => {
		if (requisitionSlipId) {
			getOrderSlipsExtended(null, requisitionSlipId);
		}
	}, [requisitionSlipId]);

	// Effect: Update requisition slip status if status is "New/Seen" after creating order slip
	useEffect(() => {
		if (
			orderSlipStatus === request.SUCCESS &&
			orderSlipRecentRequest === orderSlipsTypes.CREATE_ORDER_SLIP
		) {
			const actionRequiresUpdate = [requisitionSlipActions.NEW, requisitionSlipActions.SEEN];
			if (actionRequiresUpdate.includes(requisitionSlip?.action?.action)) {
				setRequisitionSlipAction({ action: requisitionSlipActions.F_OS1_CREATED });
			}
		}
	}, [orderSlipStatus, orderSlipRecentRequest]);

	const onViewOrderSlip = (orderSlip) => {
		setSelectedOrderSlip(orderSlip);
		setViewOrderSlipVisible(true);
	};

	const onReceiveDeliveryReceipt = (orderSlip) => {
		setSelectedOrderSlip(orderSlip);
		setReceiveDeliveryReceiptVisible(true);
	};

	return (
		<Box>
			<TableHeader title="F-OS1" />

			<OrderSlipsTable
				orderSlips={orderSlips}
				orderSlipStatus={orderSlipStatus}
				onViewOrderSlip={onViewOrderSlip}
				onReceiveDeliveryReceipt={onReceiveDeliveryReceipt}
			/>

			<ViewOrderSlipModal
				visible={viewOrderSlipVisible}
				orderSlip={selectedOrderSlip}
				onClose={() => setViewOrderSlipVisible(false)}
			/>

			<ReceiveDeliveryReceiptModal
				orderSlips={orderSlips}
				requisitionSlip={requisitionSlip}
				orderSlip={selectedOrderSlip}
				visible={receiveDeliveryReceiptVisible}
				onClose={() => setReceiveDeliveryReceiptVisible(false)}
			/>
		</Box>
	);
};
