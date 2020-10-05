import { Col, Divider, Row } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../../components';
import { Box, Label } from '../../../../components/elements';
import { request } from '../../../../global/types';
import { calculateTableHeight, convertToBulk, sleep } from '../../../../utils/function';
import '../style.scss';
import { PurchaseRequestDetails, purchaseRequestDetailsType } from './PurchaseRequestDetails';

interface Props {
	purchaseRequest: any;
	purchaseRequestStatus: number;
}

export const RequestedProducts = ({ purchaseRequest, purchaseRequestStatus }: Props) => {
	const [requestedProducts, setRequestedProducts] = useState([]);

	// Effect: Format requested products to be rendered in Table
	useEffect(() => {
		if (purchaseRequest && purchaseRequestStatus === request.SUCCESS) {
			const formattedRequestedProducts = purchaseRequest?.products.map((requestedProduct) => {
				const { product, quantity_piece } = requestedProduct;
				const { barcode, name, pieces_in_bulk } = product;

				return {
					_quantity_piece: quantity_piece,
					_quantity_bulk: convertToBulk(quantity_piece, pieces_in_bulk),
					barcode,
					name,
					// quantity: quantity_piece,
				};
			});

			sleep(500).then(() => setRequestedProducts(formattedRequestedProducts));
		}
	}, [purchaseRequest, purchaseRequestStatus]);

	// const onQuantityTypeChange = useCallback(
	// 	(quantityType) => {
	// 		const formattedRequestedProducts = requestedProducts.map((requestProduct) => ({
	// 			...requestProduct,
	// 			quantity:
	// 				quantityType === quantityTypes.PIECE
	// 					? requestProduct._quantity_piece
	// 					: requestProduct._quantity_bulk,
	// 		}));
	// 		setRequestedProducts(formattedRequestedProducts);
	// 	},
	// 	[requestedProducts],
	// );

	const getColumns = useCallback(
		() => [
			{ title: 'Barcode', dataIndex: 'barcode' },
			{ title: 'Name', dataIndex: 'name' },
			// {
			// 	title: <QuantitySelect onQuantityTypeChange={onQuantityTypeChange} />,
			// 	dataIndex: 'quantity',
			// },
		],
		[],
	);

	return (
		<Box>
			<PurchaseRequestDetails
				purchaseRequest={purchaseRequest}
				type={purchaseRequestDetailsType.SINGLE_VIEW}
			/>

			<div className="requested-products">
				<Divider dashed />
				<Row gutter={[15, 15]} align="middle">
					<Col span={24}>
						<Label label="Requested Products" />
					</Col>
				</Row>
			</div>

			<Table
				columns={getColumns()}
				dataSource={requestedProducts}
				scroll={{ y: calculateTableHeight(requestedProducts.length), x: '100%' }}
				hasCustomHeaderComponent
			/>
		</Box>
	);
};
