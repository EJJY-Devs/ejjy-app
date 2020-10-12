/* eslint-disable react-hooks/exhaustive-deps */
import { Divider, Modal } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FieldError } from '../../../../../components/elements';
import { selectors as authSelectors } from '../../../../../ducks/auth';
import { types } from '../../../../../ducks/BranchManager/delivery-receipts';
import { orderSlipStatus, requisitionSlipActions, request } from '../../../../../global/types';
import { useDeliveryReceipt } from '../../../hooks/useDeliveryReceipt';
import { RequisitionSlipDetails, requisitionSlipDetailsType } from '../RequisitionSlipDetails';
import { ReceiveDeliveryReceiptForm } from './ReceiveDeliveryReceiptForm';

interface Props {
	orderSlips: any;
	requisitionSlip: any;
	orderSlip: any;
	visible: boolean;
	onClose: any;
}

export const ReceiveDeliveryReceiptModal = ({
	orderSlips,
	requisitionSlip,
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
			requisitionSlipAction:
				deliveredOrderSlips.length === orderSlips.length - 1
					? requisitionSlipActions.F_DS1_DELIVERED
					: requisitionSlipActions.F_DS1_DELIVERING,
		});
	};

	return (
		<Modal
			title={`F-DS01 ${requisitionSlip?.requesting_user?.branch?.name}`}
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<RequisitionSlipDetails
				requisitionSlip={requisitionSlip}
				type={requisitionSlipDetailsType.CREATE_EDIT}
			/>

			<Divider dashed />

			<ReceiveDeliveryReceiptForm
				products={products}
				onSubmit={onReceiveDeliveryReceiptSubmit}
				onClose={onClose}
				loading={isReceiving()}
			/>
		</Modal>
	);
};
