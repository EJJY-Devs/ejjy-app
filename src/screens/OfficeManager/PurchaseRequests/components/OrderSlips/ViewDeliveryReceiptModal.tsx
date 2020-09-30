/* eslint-disable react-hooks/exhaustive-deps */
import { Divider, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import {
	CheckIcon,
	ColoredText,
	coloredTextType,
	DetailsHalf,
	DetailsRow,
	ErrorIcon,
	TableNormal,
} from '../../../../../components';
import { Button } from '../../../../../components/elements';
import { request } from '../../../../../global/types';
import { formatDateTime, getDeliveryReceiptStatus } from '../../../../../utils/function';
import { useDeliveryReceipt } from '../../../hooks/useDeliveryReceipt';

const columns = [
	{ name: 'Product', width: '50%' },
	{ name: 'Delivered' },
	{ name: 'Received' },
	{ name: 'Status', width: '20%' },
];

interface Props {
	visible: boolean;
	orderSlip: any;
	onClose: any;
}

export const ViewDeliveryReceiptModal = ({ orderSlip, visible, onClose }: Props) => {
	const [receivedProducts, setReceivedProducts] = useState([]);

	const { deliveryReceipt, getDeliveryReceiptById, status, reset } = useDeliveryReceipt();

	// Effect: Fetch delivery receipt of order slip
	useEffect(() => {
		if (orderSlip?.delivery_receipt && visible) {
			getDeliveryReceiptById(orderSlip.delivery_receipt.id);
		}
	}, [orderSlip, visible]);

	// Effect: Format received products
	useEffect(() => {
		if (orderSlip && visible && deliveryReceipt && status === request.SUCCESS) {
			const { delivery_receipt_products } = deliveryReceipt;
			const findDrProduct = (orderSlipProductId) => {
				return delivery_receipt_products?.find(
					({ order_slip_product }) => order_slip_product.id === orderSlipProductId,
				);
			};

			const formattedProducts = [];
			orderSlip?.products?.map((orderSlipProduct) => {
				const { id, product, fulfilled_quantity_piece } = orderSlipProduct;
				const { status, is_match, received_quantity_piece, extra_message } = findDrProduct(id);

				formattedProducts.push([
					<>
						<span>{product.name}</span>{' '}
						{getMessage(is_match, extra_message?.is_under, extra_message?.message)}
					</>,
					fulfilled_quantity_piece,
					received_quantity_piece,
					getDeliveryReceiptStatus(status),
				]);
			});

			setReceivedProducts(formattedProducts);
		}
	}, [orderSlip, deliveryReceipt, visible, status]);

	const getMessage = (isMatch, isUnder, message) => {
		let mainMessage = 'Match';
		let colorType = coloredTextType.DEFAULT;
		let extraMessage = '';
		if (!isMatch) {
			mainMessage = isUnder ? 'Under' : 'Over';
			extraMessage = message || '';
			colorType = coloredTextType.ERROR;
		} else {
			colorType = coloredTextType.PRIMARY;
		}

		return (
			<div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
				<span style={{ marginRight: '5px' }}>
					{isMatch ? <CheckIcon size="small" /> : <ErrorIcon size="small" />}
				</span>
				<ColoredText size="small" text={`${mainMessage}: ${extraMessage}`} type={colorType} />
			</div>
		);
	};

	const onModelClose = () => {
		reset();
		onClose();
	};

	return (
		<Modal
			title="View FDS-1"
			visible={visible}
			footer={[<Button key="close" text="Close" onClick={onModelClose} />]}
			onCancel={onModelClose}
			centered
			closable
		>
			<Spin size="large" spinning={status === request.REQUESTING}>
				<DetailsRow>
					<DetailsHalf
						label="Recipient"
						value={orderSlip?.purchase_request?.requesting_user?.branch?.name}
					/>
					<DetailsHalf label="F-OS1" value={orderSlip?.id} />

					<DetailsHalf
						label="Date & Time Received"
						value={formatDateTime(orderSlip?.datetime_created)}
					/>

					<DetailsHalf label="F-DS1" value={orderSlip?.purchase_request?.id} />
				</DetailsRow>

				<Divider dashed />

				<TableNormal columns={columns} data={receivedProducts} />
			</Spin>
		</Modal>
	);
};
