/* eslint-disable no-mixed-spaces-and-tabs */
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { RequestErrors } from '../../../../components';
import {
	productCheckingTypes,
	quantityTypes,
	request,
} from '../../../../global/types';
import { convertIntoArray, convertToBulk } from '../../../../utils/function';
import { useProductChecks } from '../../hooks/useProductChecks';
import { FulfillCheckForm } from './FulfillCheckForm';

interface Props {
	branchId?: number;
	productCheck?: any;
	onSuccess: any;
	onClose: any;
}

export const FulfillCheckModal = ({
	branchId,
	productCheck,
	onSuccess,
	onClose,
}: Props) => {
	// STATES
	const [products, setProducts] = useState([]);

	// CUSTOM HOOKS
	const {
		fulfillProductCheck,
		status: productChecksStatus,
		errors: productChecksErrors,
	} = useProductChecks();

	// Effect: Format product check products
	useEffect(() => {
		if (productCheck) {
			const formattedProductCheckProducts = productCheck?.products?.map(
				(product) => ({
					name: product?.product?.name,
					barcode: product?.product?.barcode,

					// TODO: CHANGE TO DATA FROM PRODUCT
					pieces_in_bulk: product?.product?.pieces_in_bulk || 1,
					product_check_product_id: product?.id,
				}),
			);

			setProducts(formattedProductCheckProducts);
		}
	}, [productCheck]);

	const onFulfill = (values) => {
		const fulfilledProducts = values.products.map((product) => {
			const quantity =
				product?.quantity_type === quantityTypes.PIECE
					? product.fulfilled_quantity_piece
					: convertToBulk(
							product.fulfilled_quantity_piece,
							product.pieces_in_bulk,
					  );

			return {
				product_check_product_id: product.product_check_product_id,
				fulfilled_quantity_piece: quantity,
			};
		});

		fulfillProductCheck(
			{
				branchId,
				id: productCheck.id,
				products: fulfilledProducts,
				type: productCheck?.type,
			},
			({ status }) => {
				if (status === request.SUCCESS) {
					onSuccess();
					onClose();
				}
			},
		);
	};

	return (
		<Modal
			title={
				productCheck?.type === productCheckingTypes.DAILY
					? 'Daily Check'
					: 'Random Check'
			}
			className="Modal__large"
			footer={null}
			onCancel={onClose}
			visible
			centered
			closable
		>
			<RequestErrors
				errors={convertIntoArray(productChecksErrors)}
				withSpaceBottom
			/>

			<FulfillCheckForm
				products={products}
				onSubmit={onFulfill}
				onClose={onClose}
				loading={productChecksStatus === request.REQUESTING}
			/>
		</Modal>
	);
};
