/* eslint-disable react-hooks/exhaustive-deps */
import { Divider, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DetailsRow, DetailsSingle } from '../../../../../components';
import { FieldError, Label, Textarea } from '../../../../../components/elements';
import { selectors as authSelectors } from '../../../../../ducks/auth';
import { types } from '../../../../../ducks/OfficeManager/adjustment-slips';
import { deliveryReceiptStatus, request } from '../../../../../global/types';
import { confirmPassword } from '../../../../../utils/function';
import { useAdjustmentSlips } from '../../../hooks/useAdjustmentSlips';
import { CreateAdjustmentSlipForm } from './CreateAdjustmentSlipForm';

interface Props {
	deliveryReceipt: any;
	fetchDeliveryReceipt: any;
	visible: boolean;
	onClose: any;
}

export const CreateAdjustmentSlipModal = ({
	deliveryReceipt,
	fetchDeliveryReceipt,
	visible,
	onClose,
}: Props) => {
	const [remarks, setRemarks] = useState('');
	const [deliveryReceiptProducts, setDeliveryReceiptProducts] = useState([]);

	const user = useSelector(authSelectors.selectUser());
	const { createAdjustmentSlip, status, errors, recentRequest, reset } = useAdjustmentSlips();

	// Effect: Format delivery receipt products
	useEffect(() => {
		if (deliveryReceipt && visible) {
			const formattedDeliveryReceiptProducts = deliveryReceipt.delivery_receipt_products
				.filter(({ status }) => status === deliveryReceiptStatus.INVESTIGATION)
				.map((product) => {
					const {
						id,
						status,
						is_adjusted,
						received_quantity_piece,
						delivered_quantity_piece,
						order_slip_product,
					} = product;

					return {
						id,
						name: order_slip_product?.product?.name,
						status,
						is_adjusted,
						delivered_quantity_piece,
						received_quantity_piece,
					};
				});

			setDeliveryReceiptProducts(formattedDeliveryReceiptProducts);
		}
	}, [deliveryReceipt, visible]);

	// Effect: Close modal if create/edit success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.CREATE_ADJUSTMENT_SLIP) {
			reset();
			onClose();
			fetchDeliveryReceipt();
		}
	}, [status, recentRequest]);

	const hasErrors = (values) => {
		if (!remarks.length) {
			message.error('Remarks field is required');
			return true;
		}

		const productLength = values.deliveryReceiptProducts.filter(
			(product) =>
				product.selected &&
				(product.new_delivered_quantity_piece || product.new_received_quantity_piece),
		)?.length;
		if (!productLength) {
			message.error('Must have at least one (1) adjusted product');
			return true;
		}

		return false;
	};

	const onCreateAdjustmentSlipSubmit = (values) => {
		if (hasErrors(values)) {
			return;
		}

		const submit = () => {
			createAdjustmentSlip({
				delivery_receipt_id: deliveryReceipt?.id,
				creating_user_id: user.id,
				remarks,
				adjustment_slip_products: getProducts(values),
			});
		};

		const requiresPassword = values.deliveryReceiptProducts.some(({ is_adjusted }) => is_adjusted);
		if (requiresPassword) {
			confirmPassword({ onSuccess: submit });
		} else {
			submit();
		}
	};

	const getProducts = (values) => {
		return values.deliveryReceiptProducts
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
				onSubmit={onCreateAdjustmentSlipSubmit}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};

CreateAdjustmentSlipModal.defaultProps = {
	loading: false,
};
