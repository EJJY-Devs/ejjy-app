/* eslint-disable react-hooks/exhaustive-deps */
import { Col, Divider, Modal, Row, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import {
	CheckIcon,
	ColoredText,
	coloredTextType,
	DetailsHalf,
	DetailsRow,
	ErrorIcon,
} from '../../../../../components';
import { Button, Input, Label, Select } from '../../../../../components/elements';
import { deliveryReceiptProductOptions } from '../../../../../global/options';
import { request } from '../../../../../global/types';
import { formatDateTime } from '../../../../../utils/function';
import { useDeliveryReceipt } from '../../../hooks/useDeliveryReceipt';

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
			reset();
			getDeliveryReceiptById(orderSlip.delivery_receipt.id);
		}
	}, [orderSlip]);

	// Effect: Format received products
	useEffect(() => {
		if (orderSlip && deliveryReceipt && status === request.SUCCESS) {
			const { delivery_receipt_products } = deliveryReceipt;
			const findDrProduct = (orderSlipProductId) => {
				return delivery_receipt_products?.find(
					({ order_slip_product }) => order_slip_product.id === orderSlipProductId,
				);
			};

			const formattedProducts = orderSlip?.products?.map((orderSlipProduct) => {
				const { id, product, fulfilled_quantity_piece } = orderSlipProduct;
				const { status, is_match, received_quantity_piece, extra_message } = findDrProduct(id);

				let mainMessage = 'Match';
				let colorType = coloredTextType.DEFAULT;
				let extraMessage = '';
				if (!is_match) {
					mainMessage = extra_message?.is_under ? 'Under' : 'Over';
					extraMessage = extra_message?.message || '';
					colorType = coloredTextType.ERROR;
				} else {
					colorType = coloredTextType.PRIMARY;
				}

				return {
					name: product.name,
					delivered: fulfilled_quantity_piece,
					received: received_quantity_piece,
					status,
					is_match,
					mainMessage,
					colorType,
					extraMessage,
				};
			});

			setReceivedProducts(formattedProducts);
		}
	}, [orderSlip, deliveryReceipt, status]);

	const onChangeStatus = (status) => {
		console.log(status);
	};

	const getRow = (product) => {
		return (
			<Col span={24}>
				<Row gutter={[25, 8]}>
					<Col xs={12} sm={6}>
						<Label label="Product" spacing />
						<Input placeholder={product.name} onChange={null} disabled />
					</Col>

					<Col xs={12} sm={6}>
						<Label label="Delivered" spacing />
						<Input placeholder={product.delivered} onChange={null} disabled />
					</Col>

					<Col xs={12} sm={6}>
						<Label label="Received" spacing />
						<Input placeholder={product.received} onChange={null} disabled />
					</Col>

					<Col xs={12} sm={6}>
						<Label label="Status" spacing />
						<Select
							options={deliveryReceiptProductOptions}
							value={product.status}
							onChange={onChangeStatus}
						/>
					</Col>
				</Row>
				<Row gutter={[25, 8]}>
					<Col span={24}>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<span style={{ marginRight: '10px' }}>
								{product.is_match ? <CheckIcon /> : <ErrorIcon />}
							</span>
							<ColoredText
								text={`${product.mainMessage}: ${product.extraMessage}`}
								type={product.colorType}
							/>
						</div>
					</Col>
				</Row>
			</Col>
		);
	};

	return (
		<Modal
			title="View FDS-1"
			visible={visible}
			footer={[<Button key="close" text="Close" onClick={onClose} />]}
			onCancel={onClose}
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

				<Row gutter={[0, 20]}>{receivedProducts.map((product) => getRow(product))}</Row>
			</Spin>
		</Modal>
	);
};
