/* eslint-disable react-hooks/exhaustive-deps */
import { Col, message, Modal, Row, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FieldError, Label } from '../../../../../components/elements';
import { selectors as authSelectors } from '../../../../../ducks/auth';
import { types } from '../../../../../ducks/order-slips';
import { selectors as prSelectors } from '../../../../../ducks/requisition-slips';
import { requisitionSlipProductStatus, request } from '../../../../../global/types';
import { useRequisitionSlips } from '../../../../../hooks/useRequisitionSlips';
import { useOrderSlips } from '../../../hooks/useOrderSlips';
import { SetOutOfStockForm } from './SetOutOfStockForm';

interface Props {
	requisitionSlipId: number;
	visible: boolean;
	onClose: any;
}

export const SetOutOfStockModal = ({ requisitionSlipId, visible, onClose }: Props) => {
	const user = useSelector(authSelectors.selectUser());
	const { setOutOfStock, status, errors, recentRequest, reset } = useOrderSlips();
	const { getRequisitionSlipsByIdAndBranch, status: requisitionSlipStatus } = useRequisitionSlips();
	const requisitionSlip = useSelector(prSelectors.selectRequisitionSlipForOutOfStock());

	const [products, setProducts] = useState([]);

	// Effect: Fetch requisition slip products
	useEffect(() => {
		if (visible && requisitionSlipId) {
			getRequisitionSlipsByIdAndBranch(requisitionSlipId, null);
		}
	}, [visible, requisitionSlipId]);

	// Effect: Format product
	useEffect(() => {
		if (visible && requisitionSlip && requisitionSlipStatus === request.SUCCESS) {
			const formattedProducts = requisitionSlip?.products
				?.filter(({ status }) => status === requisitionSlipProductStatus.NOT_ADDED_TO_OS)
				?.map((prProduct) => {
					const { product } = prProduct?.product;

					return {
						product_id: product.id,
						product_barcode: product.barcode,
						product_name: product.name,
					};
				});

			setProducts(formattedProducts);
		}
	}, [visible, requisitionSlipStatus, requisitionSlip]);

	// Effect: Close modal if success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.CREATE_ORDER_SLIP) {
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const isFetching = useCallback(() => requisitionSlipStatus === request.REQUESTING, [
		requisitionSlipStatus,
	]);

	const onSetOutOfStockSubmit = (values) => {
		const products = values.products
			.filter(({ selected }) => selected)
			.map((product) => ({
				product_id: product.product_id,
				quantity_piece: null,
				assigned_person_id: null,
			}));

		if (products?.length > 0) {
			const data = {
				requesting_user_id: user.id,
				assigned_store_id: null,
				requisition_slip_id: requisitionSlipId,
				products,
			};

			setOutOfStock(data);
		} else {
			message.error('Must have at least 1 product marked as out of stock.');
		}
	};

	return (
		<Modal
			title="Out of Stock"
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

				<Row gutter={[15, 15]} align="middle">
					<Col span={12}>
						<Label label="Requested Products" />
					</Col>
				</Row>

				<SetOutOfStockForm
					products={products}
					onSubmit={onSetOutOfStockSubmit}
					onClose={onClose}
					loading={status === request.REQUESTING}
				/>
			</Spin>
		</Modal>
	);
};
