/* eslint-disable react-hooks/exhaustive-deps */
import { Col, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FieldError, Label } from '../../../../components/elements';
import { selectors as authSelectors } from '../../../../ducks/auth';
import { types } from '../../../../ducks/BranchPersonnel/preparation-slips';
import { quantityTypes, request } from '../../../../global/types';
import { convertToBulk, convertToPieces } from '../../../../utils/function';
import { usePreparationSlips } from '../../hooks/usePreparationSlips';
import { FulfillPreparationSlipForm } from './FulfillPreparationSlipForm';
import { PreparationSlipDetails } from './PreparationSlipDetails';

interface Props {
	preparationSlip: any;
	updatePreparationSlipsByFetching: any;
	visible: boolean;
	onClose: any;
}

export const FulfillPreparationSlipModal = ({
	preparationSlip,
	updatePreparationSlipsByFetching,
	visible,
	onClose,
}: Props) => {
	const [preparationSlipProducts, setPreparationSlipProducts] = useState([]);
	console.log(preparationSlip);
	const user = useSelector(authSelectors.selectUser());
	const { fulfillPreparationSlip, status, errors, recentRequest, reset } = usePreparationSlips();

	useEffect(() => {
		if (preparationSlip) {
			const formattedPreparationSlipProducts = preparationSlip?.products?.map(
				(requestedProduct) => {
					const {
						id,
						product,
						quantity_piece,
						current_balance,
						fulfilled_quantity_piece = 0,
					} = requestedProduct;
					const { barcode, name, pieces_in_bulk } = product;

					return {
						barcode,
						name,
						pieces_in_bulk,
						order_slip_product_id: id,
						product_id: product.id,
						quantity: quantity_piece,
						quantity_bulk: convertToBulk(quantity_piece, pieces_in_bulk),
						fulfilled_quantity: fulfilled_quantity_piece,
						quantity_type: quantityTypes.PIECE,
						assigned_person_id: user?.id,
						branch_current: current_balance,
						branch_current_bulk: convertToBulk(current_balance, pieces_in_bulk),
					};
				},
			);

			setPreparationSlipProducts(formattedPreparationSlipProducts);
		}
	}, [preparationSlip]);

	// Effect: Close modal if fulfill success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.FULFILL_PREPARATION_SLIP) {
			updatePreparationSlipsByFetching();
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const onFulfill = (values) => {
		const products = values.preparationSlipProducts.map((product) => ({
			order_slip_product_id: product.order_slip_product_id,
			product_id: product.product_id,
			assigned_person_id: product.assigned_person_id,
			quantity_piece: product.quantity,
			fulfilled_quantity_piece:
				product.quantity_type === quantityTypes.PIECE
					? product.fulfilled_quantity
					: convertToPieces(product.fulfilled_quantity, product.pieces_in_bulk),
		}));

		fulfillPreparationSlip({
			id: preparationSlip.id,
			assigned_store_id: user.branch.id,
			products,
		});
	};

	return (
		<Modal
			title="Fulfill Preparation Slip"
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<PreparationSlipDetails preparationSlip={preparationSlip} />

			<div className="requested-products">
				<Row gutter={[15, 15]} align="middle">
					<Col span={24}>
						<Label label="Requested Products" />
					</Col>
				</Row>
			</div>

			{preparationSlipProducts && (
				<FulfillPreparationSlipForm
					preparationSlipProducts={preparationSlipProducts}
					onSubmit={onFulfill}
					onClose={onClose}
					loading={status === request.REQUESTING}
				/>
			)}
		</Modal>
	);
};
