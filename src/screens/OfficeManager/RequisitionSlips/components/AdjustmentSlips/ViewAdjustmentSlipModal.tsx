import { Divider, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { DetailsRow, DetailsSingle, TableNormal } from '../../../../../components';
import { Button } from '../../../../../components/elements';
import { EMPTY_CELL } from '../../../../../global/constants';
import { formatDateTime } from '../../../../../utils/function';

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

export const ViewAdjustmentSlipModal = ({ adjustmentSlip, visible, onClose }: Props) => {
	const [adjustmentProducts, setAdjustmentProducts] = useState([]);

	useEffect(() => {
		if (visible && adjustmentSlip) {
			const formatQuantity = (quantity) => (quantity === null ? EMPTY_CELL : quantity);
			const formattedAdjustmentProducts = adjustmentSlip?.products?.map((adjustmentSlipProduct) => {
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
			});

			setAdjustmentProducts(formattedAdjustmentProducts);
		}
	}, [visible, adjustmentSlip]);

	return (
		<Modal
			title="View Adjustment Slip"
			className="modal-large"
			visible={visible}
			footer={[<Button key="close" text="Close" onClick={onClose} />]}
			onCancel={onClose}
			centered
			closable
		>
			<DetailsRow>
				<DetailsSingle
					label="Date & Time Created"
					value={formatDateTime(adjustmentSlip?.datetime_created)}
				/>
				<DetailsSingle label="Remark" value={adjustmentSlip?.remarks} />
			</DetailsRow>

			<Divider dashed />

			<DetailsRow>
				<DetailsSingle label="Products" value="" />
			</DetailsRow>

			<TableNormal columns={columns} data={adjustmentProducts} />
		</Modal>
	);
};
