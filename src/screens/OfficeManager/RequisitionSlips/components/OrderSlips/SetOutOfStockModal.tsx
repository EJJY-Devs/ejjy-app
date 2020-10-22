/* eslint-disable react-hooks/exhaustive-deps */
import { Col, message, Modal, Row, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FieldError, Label } from '../../../../../components/elements';
import { selectors, types } from '../../../../../ducks/requisition-slips';
import { request, requisitionSlipProductStatus } from '../../../../../global/types';
import { useRequisitionSlips } from '../../../../../hooks/useRequisitionSlips';
import { SetOutOfStockForm } from './SetOutOfStockForm';

interface Props {
	updateRequisitionSlipByFetching: any;
	requisitionSlipId: number;
	visible: boolean;
	onClose: any;
}

export const SetOutOfStockModal = ({
	updateRequisitionSlipByFetching,
	requisitionSlipId,
	visible,
	onClose,
}: Props) => {
	const {
		getRequisitionSlipsByIdAndBranch,
		setOutOfStock,
		status,
		errors,
		recentRequest,
		reset,
	} = useRequisitionSlips();
	const requisitionSlip = useSelector(selectors.selectRequisitionSlipForOutOfStock());

	const [products, setProducts] = useState([]);

	// Effect: Fetch requisition slip products
	useEffect(() => {
		if (visible && requisitionSlipId) {
			getRequisitionSlipsByIdAndBranch(requisitionSlipId, null);
		}
	}, [visible, requisitionSlipId]);

	// Effect: Format product
	useEffect(() => {
		if (
			visible &&
			requisitionSlip &&
			status === request.SUCCESS &&
			recentRequest === types.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH
		) {
			const formattedProducts = requisitionSlip?.products
				?.filter(
					({ product }) =>
						product.status === requisitionSlipProductStatus.NOT_ADDED_TO_OS &&
						!product.is_out_of_stock,
				)
				?.map((item) => {
					const { id, product } = item?.product;

					return {
						requisition_slip_product_id: id,
						product_barcode: product.barcode,
						product_name: product.name,
					};
				});

			setProducts(formattedProducts);
		}
	}, [visible, status, recentRequest, requisitionSlip]);

	// Effect: Close modal if success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.SET_OUT_OF_STOCK) {
			updateRequisitionSlipByFetching();
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const isFetching = useCallback(
		() =>
			status === request.REQUESTING &&
			recentRequest === types.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH,
		[status, recentRequest],
	);

	const isSettingOutOfStock = useCallback(
		() => status === request.REQUESTING && recentRequest === types.SET_OUT_OF_STOCK,
		[status, recentRequest],
	);

	const onSetOutOfStockSubmit = (values) => {
		const requisition_slip_products = values.products
			.filter(({ selected }) => selected)
			.map(({ requisition_slip_product_id }) => ({
				requisition_slip_product_id,
				is_out_of_stock: true,
			}));

		if (products?.length > 0) {
			const data = {
				id: requisitionSlipId,
				requisition_slip_products,
			};

			setOutOfStock(data);
		} else {
			message.error('Must have at least 1 product marked as out of stock.');
		}
	};

	return (
		<Modal
			title="Out of Stock"
			className="modal-large"
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
					loading={isSettingOutOfStock()}
				/>
			</Spin>
		</Modal>
	);
};
