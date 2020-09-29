import { Col, Divider, Modal, Row } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { QuantitySelect, TableNormal } from '../../../../../components';
import { Button, Label } from '../../../../../components/elements';
import { quantityTypes } from '../../../../../global/types';
import { convertToBulk, getColoredText } from '../../../../../utils/function';
import { OrderSlipDetails } from './OrderSlipDetails';

interface Props {
	visible: boolean;
	orderSlip: any;
	onClose: any;
}

export const ViewOrderSlipModal = ({ orderSlip, visible, onClose }: Props) => {
	const [requestedProducts, setRequestedProducts] = useState([]);
	const [requestedProductsQuantity, setRequestedProductsQuantity] = useState([]);

	useEffect(() => {
		if (orderSlip) {
			const formattedQuantities = [];
			const formattedPreparationSlip = [];

			orderSlip?.products?.forEach((requestedProduct) => {
				const {
					product,
					assigned_person,
					quantity_piece,
					fulfilled_quantity_piece = 0,
				} = requestedProduct;
				const { barcode, name, pieces_in_bulk } = product;
				const { first_name, last_name } = assigned_person;

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
						`${orderSlip?.id}-${barcode}-${quantity.isFulfilled}`, // key
						!quantity.isFulfilled,
						quantity.piecesInputted,
						quantity.piecesOrdered,
					),
					`${first_name} ${last_name}`,
				]);

				return;
			});

			setRequestedProducts(formattedPreparationSlip);
			setRequestedProductsQuantity(formattedQuantities);
		}
	}, [orderSlip]);

	const onQuantityTypeChange = useCallback(
		(quantityType) => {
			const QUANTITY_INDEX = 2;
			const formattedRequestedProducts = requestedProducts.map((requestedProduct, index) => {
				const quantity = requestedProductsQuantity[index];
				const isPiece = quantityType === quantityTypes.PIECE;
				const inputted = isPiece ? quantity.piecesInputted : quantity.bulkInputted;
				const ordered = isPiece ? quantity.piecesOrdered : quantity.bulkOrdered;
				const key = `${orderSlip?.id}-${!quantity.isFulfilled}-${inputted}-${ordered}`;

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
		[requestedProducts, requestedProductsQuantity, orderSlip],
	);

	const getColumns = useCallback(
		() => [
			{ name: 'Barcode' },
			{ name: 'Name' },
			{ name: <QuantitySelect onQuantityTypeChange={onQuantityTypeChange} /> },
			{ name: 'Assigned Personnel' },
		],
		[onQuantityTypeChange],
	);

	return (
		<Modal
			title="View Order Slip"
			visible={visible}
			footer={[<Button key="close" text="Close" onClick={onClose} />]}
			onCancel={onClose}
			centered
			closable
		>
			<OrderSlipDetails orderSlip={orderSlip} />

			<Divider dashed />

			<Row gutter={[15, 15]} align="middle" justify="space-between">
				<Col span={24}>
					<Label label="Requested Products" />
				</Col>
			</Row>

			<TableNormal columns={getColumns()} data={requestedProducts} />
		</Modal>
	);
};
