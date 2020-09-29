import { Col, Modal, Row } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { QuantitySelect, TableNormal } from '../../../../components';
import { Button, Label } from '../../../../components/elements';
import { quantityTypes } from '../../../../global/types';
import { convertToBulk, getColoredText } from '../../../../utils/function';
import { PreparationSlipDetails } from './PreparationSlipDetails';

interface Props {
	visible: boolean;
	preparationSlip: any;
	onClose: any;
}

export const ViewPreparationSlipModal = ({ preparationSlip, visible, onClose }: Props) => {
	const [requestedProducts, setRequestedProducts] = useState([]);
	const [requestedProductsQuantity, setRequestedProductsQuantity] = useState([]);

	useEffect(() => {
		if (preparationSlip) {
			const formattedQuantities = [];
			const formattedPreparationSlip = [];

			preparationSlip?.products?.forEach((requestedProduct) => {
				const { product, quantity_piece, fulfilled_quantity_piece = 0 } = requestedProduct;
				const { barcode, name, pieces_in_bulk } = product;

				const quantity = {
					barcode,
					isFulfilled: fulfilled_quantity_piece !== null,
					piecesInputted: fulfilled_quantity_piece || 0,
					piecesOrdered: quantity_piece,
					bulkInputted: convertToBulk(fulfilled_quantity_piece, pieces_in_bulk),
					bulkOrdered: convertToBulk(quantity_piece, pieces_in_bulk),
				};

				formattedQuantities.push(quantity);
				formattedPreparationSlip.push([
					barcode,
					name,
					getColoredText(
						`${preparationSlip?.id}-${barcode}-${quantity.isFulfilled}`, // key
						!quantity.isFulfilled,
						quantity.piecesInputted,
						quantity.piecesOrdered,
					),
				]);

				return;
			});

			setRequestedProducts(formattedPreparationSlip);
			setRequestedProductsQuantity(formattedQuantities);
		}
	}, [preparationSlip]);

	const onQuantityTypeChange = useCallback(
		(quantityType) => {
			const QUANTITY_INDEX = 2;
			const formattedRequestedProducts = requestedProducts.map((requestedProduct, index) => {
				const quantity = requestedProductsQuantity[index];
				const isPiece = quantityType === quantityTypes.PIECE;
				const inputted = isPiece ? quantity.piecesInputted : quantity.bulkInputted;
				const ordered = isPiece ? quantity.piecesOrdered : quantity.bulkOrdered;
				const key = `${preparationSlip?.id}-${!quantity.isFulfilled}-${inputted}-${ordered}`;

				requestedProduct[QUANTITY_INDEX] = getColoredText(
					key,
					!quantity.isFulfilled,
					inputted,
					ordered,
				);
				return requestedProduct;
			});
			setRequestedProducts(formattedRequestedProducts);
		},
		[requestedProducts, requestedProductsQuantity, preparationSlip],
	);

	const getColumns = useCallback(
		() => [
			{ name: 'Barcode' },
			{ name: 'Name' },
			{ name: <QuantitySelect onQuantityTypeChange={onQuantityTypeChange} /> },
		],
		[onQuantityTypeChange],
	);

	return (
		<Modal
			className="ViewPreparationSlipModal"
			title="View Preparation Slip"
			visible={visible}
			footer={[<Button text="Close" onClick={onClose} />]}
			onCancel={onClose}
			centered
			closable
		>
			<PreparationSlipDetails preparationSlip={preparationSlip} />

			<div className="requested-products">
				<Row gutter={[15, 15]} align="middle">
					<Col span={24}>
						<Label label="Requested Products" />
					</Col>
				</Row>
			</div>

			<TableNormal columns={getColumns()} data={requestedProducts} />
		</Modal>
	);
};
