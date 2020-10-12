/* eslint-disable react-hooks/exhaustive-deps */
import { Divider, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { DetailsRow, DetailsSingle, TableNormal } from '../../../../../components';
import { Button } from '../../../../../components/elements';
import { request } from '../../../../../global/types';
import { formatDate } from '../../../../../utils/function';
import { useDeliveryReceiptProducts } from '../../../hooks/useDeliveryReceiptProducts';

interface Props {
	visible: boolean;
	deliveryReceiptProductId: number;
	barcode: string;
	name: string;
	onClose: any;
}

const columns = [
	{ name: 'Adjustment Slip Id' },
	{ name: 'Date' },
	{ name: 'Current Quantities (D/R)' },
	{ name: 'Remarks', width: '40%' },
];

export const ViewProductAdjustmentSlipsModal = ({
	deliveryReceiptProductId,
	barcode,
	name,
	visible,
	onClose,
}: Props) => {
	const [adjustmentProducts, setAdjustmentProducts] = useState([]);
	const {
		deliveryReceiptProduct,
		getDeliveryReceiptProductById,
		status,
		reset,
	} = useDeliveryReceiptProducts();

	// Effect: Fetch adjustment slips of selected DR Product
	useEffect(() => {
		if (visible && deliveryReceiptProductId) {
			getDeliveryReceiptProductById(deliveryReceiptProductId);
		}
	}, [visible, deliveryReceiptProductId]);

	useEffect(() => {
		if (visible && deliveryReceiptProduct && status === request.SUCCESS) {
			const formattedAdjustmentProducts = deliveryReceiptProduct?.adjustment_slips?.map((item) => {
				const { id, datetime_created, remarks } = item?.adjustment_slip;
				const {
					current_delivered_quantity_piece,
					current_received_quantity_piece,
				} = item?.current_quantities;

				return [
					id,
					formatDate(datetime_created),
					`${current_delivered_quantity_piece}/${current_received_quantity_piece}`,
					remarks,
				];
			});

			setAdjustmentProducts(formattedAdjustmentProducts);
		}
	}, [visible, deliveryReceiptProduct, status]);

	const onModalClose = () => {
		reset();
		onClose();
	};

	return (
		<Modal
			title="View Product’s Adjustment Slip"
			visible={visible}
			footer={[<Button key="close" text="Close" onClick={onModalClose} />]}
			onCancel={onClose}
			centered
			closable
		>
			<Spin size="large" spinning={status === request.REQUESTING}>
				<DetailsRow>
					<DetailsSingle label="Barcode" value={barcode} />
					<DetailsSingle label="Name" value={name} />
				</DetailsRow>

				<Divider dashed />

				<DetailsRow>
					<DetailsSingle label="Products" value="" />
				</DetailsRow>

				<TableNormal columns={columns} data={adjustmentProducts} />
			</Spin>
		</Modal>
	);
};
