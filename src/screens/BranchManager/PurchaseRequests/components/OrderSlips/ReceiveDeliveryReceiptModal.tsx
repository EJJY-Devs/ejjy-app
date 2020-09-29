/* eslint-disable react-hooks/exhaustive-deps */
import { Divider, Modal, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FieldError } from '../../../../../components/elements';
import { types } from '../../../../../ducks/BranchManager/delivery-receipts';
import { selectors as authSelectors } from '../../../../../ducks/auth';
import { request, orderSlipStatus, purchaseRequestActions } from '../../../../../global/types';
import { useDeliveryReceipt } from '../../../hooks/useDeliveryReceipt';
import { PurchaseRequestDetails, purchaseRequestDetailsType } from '../PurchaseRequestDetails';
import { ReceiveDeliveryReceiptForm } from './ReceiveDeliveryReceiptForm';

interface Props {
	orderSlips: any;
	purchaseRequest: any;
	orderSlip: any;
	visible: boolean;
	onClose: any;
}

export const ReceiveDeliveryReceiptModal = ({
	orderSlips,
	purchaseRequest,
	orderSlip,
	visible,
	onClose,
}: Props) => {
	const [products, setProducts] = useState([]);

	const user = useSelector(authSelectors.selectUser());
	const { receiveDeliveryReceipt, status, errors, recentRequest, reset } = useDeliveryReceipt();

	// Effect: Fetch delivery receipt
	useEffect(() => {
		if (orderSlip) {
			const formattedProducts = orderSlip.products.map((orderSlipProduct) => {
				const { id, product } = orderSlipProduct;

				return {
					name: product.name,
					order_slip_product_id: id,
					received_quantity_piece: '',
				};
			});

			setProducts(formattedProducts);
		}
	}, [orderSlip]);

	// Effect: Close modal if create/edit success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.RECEIVE_DELIVERY_RECEIPT) {
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const isFetching = useCallback(
		() => status === request.REQUESTING && recentRequest === types.GET_DELIVERY_RECEIPT_BY_ID,
		[status, recentRequest],
	);

	const isReceiving = useCallback(
		() => status === request.REQUESTING && recentRequest === types.RECEIVE_DELIVERY_RECEIPT,
		[status, recentRequest],
	);

	const onReceiveDeliveryReceiptSubmit = (values) => {
		const deliveredOrderSlips = orderSlips
			.filter(({ id }) => id !== orderSlip.id)
			.map(({ status }) => status.value === orderSlipStatus.DELIVERED);

		receiveDeliveryReceipt({
			id: orderSlip.delivery_receipt.id,
			order_slip_id: orderSlip.id,
			receiving_user_id: user.id,
			received_products: values.products,
			purchaseRequestAction:
				deliveredOrderSlips.length === orderSlips.length - 1
					? purchaseRequestActions.F_DS1_DELIVERED
					: purchaseRequestActions.F_DS1_DELIVERING,
		});
	};

	return (
		<Modal
			title={`F-DS01 ${purchaseRequest?.requesting_user?.branch?.name}`}
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			<Spin size="large" spinning={isFetching()}>
				{errors.map((error, index) => (
					<FieldError key={index} error={error} />
				))}

				<PurchaseRequestDetails
					purchaseRequest={purchaseRequest}
					type={purchaseRequestDetailsType.CREATE_EDIT}
				/>

				<Divider dashed />

				<ReceiveDeliveryReceiptForm
					products={products}
					onSubmit={onReceiveDeliveryReceiptSubmit}
					onClose={onClose}
					loading={isReceiving()}
				/>
			</Spin>
		</Modal>
	);
};
