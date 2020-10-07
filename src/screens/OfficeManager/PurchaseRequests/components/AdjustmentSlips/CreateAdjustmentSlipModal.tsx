/* eslint-disable react-hooks/exhaustive-deps */
import { Divider, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DetailsRow, DetailsSingle } from '../../../../../components';
import { FieldError, Label, Textarea } from '../../../../../components/elements';
import { selectors as authSelectors } from '../../../../../ducks/auth';
import { types } from '../../../../../ducks/OfficeManager/adjustment-slips';
import { deliveryReceiptStatus, request } from '../../../../../global/types';
import { useAdjustmentSlips } from '../../../hooks/useAdjustmentSlips';
import { CreateAdjustmentSlipForm } from './CreateAdjustmentSlipForm';

interface Props {
	deliveryReceipt: any;
	visible: boolean;
	onClose: any;
}

export const CreateAdjustmentSlipModal = ({ deliveryReceipt, visible, onClose }: Props) => {
	const [remarks, setRemarks] = useState('');
	const [deliveryReceiptProducts, setDeliveryReceiptProducts] = useState([]);

	const user = useSelector(authSelectors.selectUser());
	const { createAdjustmentSlip, status, errors, recentRequest, reset } = useAdjustmentSlips();

	// Effect: Format delivery receipt products
	useEffect(() => {
		if (deliveryReceipt && visible) {
			const formattedDeliveryReceiptProducts = deliveryReceipt.delivery_receipt_products.map(
				(product) => {
					const {
						id,
						status,
						is_adjusted,
						received_quantity_piece,
						delivered_quantity_piece,
						order_slip_product,
					} = product;

					return {
						selected: status === deliveryReceiptStatus.INVESTIGATION,
						id,
						name: order_slip_product?.product?.name,
						status,
						is_adjusted,
						delivered_quantity_piece,
						received_quantity_piece,
					};
				},
			);

			setDeliveryReceiptProducts(formattedDeliveryReceiptProducts);
		}
	}, [deliveryReceipt, visible]);

	// Effect: Close modal if create/edit success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.CREATE_ADJUSTMENT_SLIP) {
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const onCreateOrderSlipSubmit = (values) => {
		if (!remarks.length) {
			message.error('Remarks field is required');
			return;
		}

		const products = values.deliveryReceiptProducts
			.filter(
				(product) =>
					product.selected &&
					(product.new_delivered_quantity_piece || product.new_received_quantity_piece),
			)
			.map((product) => ({
				delivery_receipt_product_id: product.delivery_receipt_product_id,
				new_delivered_quantity_piece: product?.new_delivered_quantity_piece || undefined,
				new_received_quantity_piece: product?.new_received_quantity_piece || undefined,
			}));

		if (products.length) {
			const data = {
				delivery_receipt_id: deliveryReceipt?.id,
				creating_user_id: user.id,
				remarks,
				adjustment_slip_products: products,
			};
			createAdjustmentSlip(data);
		} else {
			message.error('Must have at least one (1) adjusted product');
		}
	};

	return (
		<Modal
			title="Create Adjustment Slip"
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<div>
				<Label label="Remarks" spacing />
				<Textarea onChange={(value) => setRemarks(value)} />
			</div>

			<Divider dashed />

			<DetailsRow>
				<DetailsSingle label="Products" value="" />
			</DetailsRow>

			<CreateAdjustmentSlipForm
				deliveryReceiptProducts={deliveryReceiptProducts}
				onSubmit={onCreateOrderSlipSubmit}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};

CreateAdjustmentSlipModal.defaultProps = {
	loading: false,
};
