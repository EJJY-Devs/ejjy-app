/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableHeader } from '../../../../../components';
import { Box } from '../../../../../components/elements';
import { types as orderSlipsTypes } from '../../../../../ducks/order-slips';
import {
	actions as prActions,
	selectors as prSelectors,
} from '../../../../../ducks/purchase-requests';
import { purchaseRequestActions, request } from '../../../../../global/types';
import { useActionDispatch } from '../../../../../hooks/useActionDispatch';
import { ViewOrderSlipModal } from '../../../../OfficeManager/PurchaseRequests/components/OrderSlips/ViewOrderSlipModal';
import { useOrderSlips } from '../../../hooks/useOrderSlips';
import { OrderSlipsTable } from './OrderSlipsTable';
import { ReceiveDeliveryReceiptModal } from './ReceiveDeliveryReceiptModal';

interface Props {
	purchaseRequestId: number;
}

export const OrderSlips = ({ purchaseRequestId }: Props) => {
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

	const purchaseRequest = useSelector(prSelectors.selectPurchaseRequest());
	const setPurchaseRequestAction = useActionDispatch(prActions.setPurchaseRequestAction);

	// Effect: Fetch purchase request
	useEffect(() => {
		if (purchaseRequestId) {
			getOrderSlipsExtended(purchaseRequestId);
		}
	}, [purchaseRequestId]);

	// Effect: Update purchase request status if status is "New/Seen" after creating order slip
	useEffect(() => {
		if (
			orderSlipStatus === request.SUCCESS &&
			orderSlipRecentRequest === orderSlipsTypes.CREATE_ORDER_SLIP
		) {
			const actionRequiresUpdate = [purchaseRequestActions.NEW, purchaseRequestActions.SEEN];
			if (actionRequiresUpdate.includes(purchaseRequest?.action?.action)) {
				setPurchaseRequestAction({ action: purchaseRequestActions.F_OS1_CREATED });
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
				purchaseRequest={purchaseRequest}
				orderSlip={selectedOrderSlip}
				visible={receiveDeliveryReceiptVisible}
				onClose={() => setReceiveDeliveryReceiptVisible(false)}
			/>
		</Box>
	);
};
