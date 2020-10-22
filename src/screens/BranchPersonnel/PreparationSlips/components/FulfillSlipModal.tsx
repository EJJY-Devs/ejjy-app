/* eslint-disable react-hooks/exhaustive-deps */
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FieldError } from '../../../../components/elements';
import { KeyboardButton } from '../../../../components/KeyboardButton/KeyboardButton';
import { selectors as authSelectors } from '../../../../ducks/auth';
import { types } from '../../../../ducks/BranchPersonnel/preparation-slips';
import { quantityTypes, request } from '../../../../global/types';
import { convertToPieces } from '../../../../utils/function';
import { usePreparationSlips } from '../../hooks/usePreparationSlips';

interface Props {
	preparationSlipProduct: any;
	updatePreparationSlipsByFetching: any;
	visible: boolean;
	onClose: any;
}

export const FulfillSlipModal = ({
	preparationSlipProduct,
	updatePreparationSlipsByFetching,
	visible,
	onClose,
}: Props) => {
	const user = useSelector(authSelectors.selectUser());
	const { fulfillPreparationSlip, status, errors, recentRequest, reset } = usePreparationSlips();

	// Effect: Close modal if fulfill success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.FULFILL_PREPARATION_SLIP) {
			updatePreparationSlipsByFetching();
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const onFulfill = (values) => {
		// const products = values.preparationSlipProducts.map((product) => ({
		// 	order_slip_product_id: product.order_slip_product_id,
		// 	product_id: product.product_id,
		// 	assigned_person_id: product.assigned_person_id,
		// 	quantity_piece: product.quantity,
		// 	fulfilled_quantity_piece:
		// 		product.quantity_type === quantityTypes.PIECE
		// 			? product.fulfilled_quantity
		// 			: convertToPieces(product.fulfilled_quantity, product.pieces_in_bulk),
		// }));

		fulfillPreparationSlip({
			id: preparationSlipProduct.id,
			assigned_store_id: user.branch.id,
			products: [],
		});
	};

	return (
		<Modal
			title={preparationSlipProduct?.name}
			className="FulfillSlipModal"
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<div className="keyboardKeys">
				<KeyboardButton keyboardKey="Enter" label="Submit" onClick={() => {}} />
				<KeyboardButton keyboardKey="Esc" label="Exit" onClick={onClose} />
			</div>
		</Modal>
	);
};
