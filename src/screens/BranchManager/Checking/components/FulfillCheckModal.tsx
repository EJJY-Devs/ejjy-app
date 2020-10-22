/* eslint-disable react-hooks/exhaustive-deps */
import { Col, Divider, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { DetailsRow, DetailsSingle } from '../../../../components';
import { FieldError, Label } from '../../../../components/elements';
import { types } from '../../../../ducks/BranchManager/product-checks';
import { productCheckingTypes, quantityTypes, request } from '../../../../global/types';
import { convertToBulk, formatDateTime } from '../../../../utils/function';
import { useProductChecks } from '../../hooks/useProductChecks';
import { FulfillCheckForm } from './FulfillCheckForm';

interface Props {
	productCheck?: any;
	visible: boolean;
	onClose: any;
}

export const FulfillCheckModal = ({ productCheck, visible, onClose }: Props) => {
	const [products, setProducts] = useState([]);

	const { fulfillProductCheck, status, errors, recentRequest, reset } = useProductChecks();

	// Effect: Format product check products
	useEffect(() => {
		if (productCheck) {
			const formattedProductCheckProducts = productCheck?.products?.map((product) => ({
				name: product?.product?.name,
				barcode: product?.product?.barcode,
				pieces_in_bulk: product?.product?.pieces_in_bulk || 1, // TODO: CHANGE TO DATA FROM PRODUCT
				product_check_product_id: product?.id,
			}));

			setProducts(formattedProductCheckProducts);
		}
	}, [productCheck]);

	// Effect: Close modal if fulfill success
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.FULFILL_PRODUCT_CHECK) {
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	const onFulfill = (values) => {
		const products = values.products.map((product) => {
			const quantity =
				product?.quantity_type === quantityTypes.PIECE
					? product.fulfilled_quantity_piece
					: convertToBulk(product.fulfilled_quantity_piece, product.pieces_in_bulk);

			return {
				product_check_product_id: product.product_check_product_id,
				fulfilled_quantity_piece: quantity,
			};
		});

		fulfillProductCheck({
			id: productCheck.id,
			products,
			type: productCheck?.type,
		});
	};

	return (
		<Modal
			title={productCheck?.type === productCheckingTypes.DAILY ? 'Daily Check' : 'Random Check'}
			className="modal-large"
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<DetailsRow>
				<DetailsSingle
					label="Date & Time Requested"
					value={formatDateTime(productCheck?.datetime_created)}
				/>

				<Divider dashed style={{ marginTop: '12px', marginBottom: '17px' }} />
			</DetailsRow>

			<div className="requested-products">
				<Row gutter={[15, 15]} align="middle">
					<Col span={24}>
						<Label label="Requested Products" />
					</Col>
				</Row>
			</div>

			<FulfillCheckForm
				products={products}
				onSubmit={onFulfill}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};
