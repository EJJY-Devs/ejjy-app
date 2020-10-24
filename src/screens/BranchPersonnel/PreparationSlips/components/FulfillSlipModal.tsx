/* eslint-disable react-hooks/exhaustive-deps */
import { message, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { useSelector } from 'react-redux';
import { DetailsRow, DetailsSingle } from '../../../../components';
import { ControlledInput, Label } from '../../../../components/elements';
import { KeyboardButton } from '../../../../components/KeyboardButton/KeyboardButton';
import { selectors as authSelectors } from '../../../../ducks/auth';
import { types } from '../../../../ducks/BranchPersonnel/preparation-slips';
import { request } from '../../../../global/types';
import { usePreparationSlips } from '../../hooks/usePreparationSlips';
import { fulfillType } from '../FulfillPreparationSlip';

interface Props {
	preparationSlipProduct: any;
	otherProducts: any;
	updatePreparationSlipsByFetching: any;
	visible: boolean;
	onClose: any;
}

export const FulfillSlipModal = ({
	preparationSlipProduct,
	otherProducts,
	updatePreparationSlipsByFetching,
	visible,
	onClose,
}: Props) => {
	const user = useSelector(authSelectors.selectUser());
	const { fulfillPreparationSlip, status, recentRequest, reset } = usePreparationSlips();

	const [quantity, setQuantity] = useState('');

	// Effect: Close modal if fulfill success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.FULFILL_PREPARATION_SLIP) {
			updatePreparationSlipsByFetching();
			reset();
			close();
		}
	}, [status, recentRequest]);

	const onFulfill = () => {
		if (!quantity.length || !Number(quantity) || Number(quantity) <= 0) {
			message.error('Please input a valid quantity.');
			return;
		}

		const newQuantity =
			(preparationSlipProduct?.fulfilled_quantity_piece || 0) +
			Number(preparationSlipProduct.type === fulfillType.ADD ? quantity : -quantity);

		if (newQuantity < 0) {
			message.error('Total quantity must be greater than or equals to zero');
			return;
		}

		if (newQuantity > preparationSlipProduct.quantity_piece) {
			message.error(
				`Total quantity must not be greater than ${preparationSlipProduct.quantity_piece}`,
			);
			return;
		}

		const products = otherProducts
			?.filter(({ id }) => id !== preparationSlipProduct.id)
			?.map((product) => ({
				order_slip_product_id: product?.order_slip_product_id,
				product_id: product?.product_id,
				assigned_person_id: product?.assigned_person_id,
				quantity_piece: product?.quantity_piece,
				fulfilled_quantity_piece: product?.fulfilled_quantity_piece || undefined,
			}));

		fulfillPreparationSlip({
			id: preparationSlipProduct.preparation_slip_id,
			is_prepared: false,
			assigned_store_id: user.branch.id,
			products: [
				{
					order_slip_product_id: preparationSlipProduct.order_slip_product_id,
					product_id: preparationSlipProduct.product_id,
					assigned_person_id: preparationSlipProduct.assigned_person_id,
					quantity_piece: preparationSlipProduct.quantity_piece,
					fulfilled_quantity_piece: newQuantity,
				},
				...products,
			],
		});
	};

	const handleKeyPress = (key) => {
		if (key === 'esc') {
			close();
		} else if (key === 'enter') {
			onFulfill();
		}
	};

	const close = () => {
		setQuantity('');
		onClose();
	};

	return (
		<Modal
			title={preparationSlipProduct?.name}
			className="FulfillSlipModal"
			visible={visible}
			footer={null}
			onCancel={close}
			centered
			closable
		>
			<Spin spinning={status === request.REQUESTING}>
				<KeyboardEventHandler
					handleKeys={['enter', 'esc']}
					onKeyEvent={(key, e) => handleKeyPress(key)}
				>
					<div className="keyboard-keys">
						<KeyboardButton keyboardKey="Enter" label="Submit" onClick={() => {}} />
						<KeyboardButton keyboardKey="Esc" label="Exit" onClick={close} />
					</div>

					<div className="input-quantity">
						<DetailsRow>
							<DetailsSingle
								label="Ordered quantity"
								value={preparationSlipProduct?.quantity_piece}
							/>
							<DetailsSingle
								label="Current quantity"
								value={preparationSlipProduct?.fulfilled_quantity_piece || 0}
							/>
						</DetailsRow>

						<Label
							label={`${
								preparationSlipProduct?.type === fulfillType.ADD ? 'Add' : 'Deduct'
							} Quantity`}
							spacing
						/>
						<ControlledInput
							type="number"
							min={0}
							value={quantity}
							onChange={(value) => setQuantity(value)}
							autoFocus
						/>
					</div>
				</KeyboardEventHandler>
			</Spin>
		</Modal>
	);
};
