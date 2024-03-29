import { Descriptions, Divider, Modal } from 'antd';
import { TableNormal } from 'components';
import { Button } from 'components/elements';
import { EMPTY_CELL } from 'global';
import React, { useEffect, useState } from 'react';
import { formatDateTime } from 'utils';

interface Props {
	visible: boolean;
	adjustmentSlip: any;
	onClose: any;
}

const columns = [
	{ name: 'Name' },
	{ name: 'Previous Delivered' },
	{ name: 'Current Delivered' },
	{ name: 'Previous Received' },
	{ name: 'Current Received' },
];

export const ViewAdjustmentSlipModal = ({
	adjustmentSlip,
	visible,
	onClose,
}: Props) => {
	const [adjustmentProducts, setAdjustmentProducts] = useState([]);

	useEffect(() => {
		if (visible && adjustmentSlip) {
			// eslint-disable-next-line no-confusing-arrow
			const formatQuantity = (quantity) =>
				quantity === null ? EMPTY_CELL : quantity;

			const formattedAdjustmentProducts = adjustmentSlip?.products?.map(
				(adjustmentSlipProduct) => {
					const {
						delivery_receipt_product,
						previous_delivered_quantity_piece,
						new_delivered_quantity_piece,
						previous_received_quantity_piece,
						new_received_quantity_piece,
					} = adjustmentSlipProduct;
					const { product_name } = delivery_receipt_product;

					return [
						product_name,
						formatQuantity(previous_delivered_quantity_piece),
						formatQuantity(new_delivered_quantity_piece),
						formatQuantity(previous_received_quantity_piece),
						formatQuantity(new_received_quantity_piece),
					];
				},
			);

			setAdjustmentProducts(formattedAdjustmentProducts);
		}
	}, [visible, adjustmentSlip]);

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={[<Button key="close" text="Close" onClick={onClose} />]}
			title="View Adjustment Slip"
			visible={visible}
			centered
			closable
			onCancel={onClose}
		>
			<Descriptions column={1} bordered>
				<Descriptions.Item label="Date & Time Created">
					{formatDateTime(adjustmentSlip?.datetime_created)}
				</Descriptions.Item>
				<Descriptions.Item label="Remark">
					{adjustmentSlip?.remarks}
				</Descriptions.Item>
			</Descriptions>

			<Divider>Products</Divider>

			<TableNormal columns={columns} data={adjustmentProducts} />
		</Modal>
	);
};
