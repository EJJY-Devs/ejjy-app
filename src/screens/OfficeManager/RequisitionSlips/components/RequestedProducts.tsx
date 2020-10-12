import { Col, Divider, Row } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { QuantitySelect, Table } from '../../../../components';
import { Box, Label } from '../../../../components/elements';
import { quantityTypes, request } from '../../../../global/types';
import { calculateTableHeight, convertToBulk, sleep } from '../../../../utils/function';
import '../style.scss';
import { RequisitionSlipDetails, requisitionSlipDetailsType } from './RequisitionSlipDetails';

interface Props {
	requisitionSlip: any;
	requisitionSlipStatus: number;
}

export const RequestedProducts = ({ requisitionSlip, requisitionSlipStatus }: Props) => {
	const [requestedProducts, setRequestedProducts] = useState([]);

	// Effect: Format requested products to be rendered in Table
	useEffect(() => {
		if (requisitionSlip && requisitionSlipStatus === request.SUCCESS) {
			const formattedRequestedProducts = requisitionSlip?.products.map((requestedProduct) => {
				const { product, quantity_piece } = requestedProduct;
				const { barcode, name, pieces_in_bulk } = product;

				return {
					_quantity_piece: quantity_piece,
					_quantity_bulk: convertToBulk(quantity_piece, pieces_in_bulk),
					barcode,
					name,
					quantity: quantity_piece,
				};
			});

			sleep(500).then(() => setRequestedProducts(formattedRequestedProducts));
		}
	}, [requisitionSlip, requisitionSlipStatus]);

	const onQuantityTypeChange = useCallback(
		(quantityType) => {
			const formattedRequestedProducts = requestedProducts.map((requestProduct) => ({
				...requestProduct,
				quantity:
					quantityType === quantityTypes.PIECE
						? requestProduct._quantity_piece
						: requestProduct._quantity_bulk,
			}));
			setRequestedProducts(formattedRequestedProducts);
		},
		[requestedProducts],
	);

	const getColumns = useCallback(
		() => [
			{ title: 'Barcode', dataIndex: 'barcode' },
			{ title: 'Name', dataIndex: 'name' },
			{
				title: (
					<QuantitySelect
						quantityText="Quantity Requested"
						onQuantityTypeChange={onQuantityTypeChange}
					/>
				),
				dataIndex: 'quantity',
			},
		],
		[onQuantityTypeChange],
	);

	return (
		<Box>
			<RequisitionSlipDetails
				requisitionSlip={requisitionSlip}
				type={requisitionSlipDetailsType.SINGLE_VIEW}
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
