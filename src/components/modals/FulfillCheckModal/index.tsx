import { message, Modal } from 'antd';
import { RequestErrors } from 'components';
import { productCheckingTypes, quantityTypes } from 'global/types';
import { useProductCheckFulfill } from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, convertToBulk } from 'utils';
import { FulfillCheckForm } from './FulfillCheckForm';

interface Props {
	productCheck: any;
	onClose: any;
}

export const FulfillCheckModal = ({ productCheck, onClose }: Props) => {
	// STATES
	const [products, setProducts] = useState([]);

	// CUSTOM HOOKS
	const {
		mutateAsync: fulfillProductCheck,
		isLoading: isFulfilling,
		error: fulfillError,
	} = useProductCheckFulfill();

	// Effect: Format product check products
	useEffect(() => {
		const formattedProductCheckProducts = productCheck.products.map(
			(product) => ({
				name: product.product.name,
				barcode: product.product.barcode || product.product.selling_barcode,
				pieces_in_bulk: product.product.pieces_in_bulk,
				product_check_product_id: product.id,
			}),
		);

		setProducts(formattedProductCheckProducts);
	}, [productCheck]);

	const handleFulfill = async (formData) => {
		const fulfilledProducts = formData.products.map((product) => {
			const quantity =
				product.quantityType === quantityTypes.PIECE
					? product.fulfilledQuantityPiece
					: convertToBulk(product.fulfilledQuantityPiece, product.piecesInBulk);

			return {
				product_check_product_id: product.productCheckProductId,
				fulfilled_quantity_piece: quantity,
			};
		});

		await fulfillProductCheck({
			id: productCheck.id,
			products: fulfilledProducts,
			type: productCheck.type,
		});

		message.success('Product check was fulfilled successfully');

		onClose();
	};

	return (
		<Modal
			className="Modal__large"
			footer={null}
			title={
				productCheck.type === productCheckingTypes.DAILY
					? 'Daily Check'
					: 'Random Check'
			}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={convertIntoArray(fulfillError?.errors)}
				withSpaceBottom
			/>

			<FulfillCheckForm
				isLoading={isFulfilling}
				products={products}
				onClose={onClose}
				onSubmit={handleFulfill}
			/>
		</Modal>
	);
};
