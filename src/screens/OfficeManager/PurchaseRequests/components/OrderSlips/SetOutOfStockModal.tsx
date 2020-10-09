/* eslint-disable react-hooks/exhaustive-deps */
import { Col, message, Modal, Row, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FieldError, Label } from '../../../../../components/elements';
import { selectors as authSelectors } from '../../../../../ducks/auth';
import { types } from '../../../../../ducks/order-slips';
import { selectors as prSelectors } from '../../../../../ducks/purchase-requests';
import { purchaseRequestProductStatus, request } from '../../../../../global/types';
import { usePurchaseRequests } from '../../../../../hooks/usePurchaseRequests';
import { useOrderSlips } from '../../../hooks/useOrderSlips';
import { SetOutOfStockForm } from './SetOutOfStockForm';

interface Props {
	purchaseRequestId: number;
	visible: boolean;
	onClose: any;
}

export const SetOutOfStockModal = ({ purchaseRequestId, visible, onClose }: Props) => {
	const user = useSelector(authSelectors.selectUser());
	const { setOutOfStock, status, errors, recentRequest, reset } = useOrderSlips();
	const { getPurchaseRequestsByIdAndBranch, status: purchaseRequestStatus } = usePurchaseRequests();
	const purchaseRequest = useSelector(prSelectors.selectPurchaseRequestForOutOfStock());

	const [products, setProducts] = useState([]);

	// Effect: Fetch purchase request products
	useEffect(() => {
		if (visible && purchaseRequestId) {
			getPurchaseRequestsByIdAndBranch(purchaseRequestId, null);
		}
	}, [visible, purchaseRequestId]);

	// Effect: Format product
	useEffect(() => {
		if (visible && purchaseRequest && purchaseRequestStatus === request.SUCCESS) {
			const formattedProducts = purchaseRequest?.products
				?.filter(({ status }) => status === purchaseRequestProductStatus.NOT_ADDED_TO_OS)
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
	}, [visible, purchaseRequestStatus, purchaseRequest]);

	// Effect: Close modal if success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.CREATE_ORDER_SLIP) {
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const isFetching = useCallback(() => purchaseRequestStatus === request.REQUESTING, [
		purchaseRequestStatus,
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
				purchase_request_id: purchaseRequestId,
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
