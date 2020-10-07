/* eslint-disable react-hooks/exhaustive-deps */
import { Divider } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import {
	CheckIcon,
	ColoredText,
	coloredTextType,
	DetailsHalf,
	DetailsRow,
	DetailsSingle,
	ErrorIcon,
	TableNormal,
	ViewButtonIcon,
} from '../../../../../components';
import { Box } from '../../../../../components/elements';
import { formatDateTime, getDeliveryReceiptStatus } from '../../../../../utils/function';
import { ViewProductAdjustmentSlipsModal } from './ViewProductAdjustmentSlipsModal';

const columns = [
	{ name: 'Name', width: '30%' },
	{ name: 'Delivered' },
	{ name: 'Received' },
	{ name: 'Status', width: '20%' },
	{ name: 'Action' },
];

interface Props {
	deliveryReceipt: any;
}

export const DeliveryReceipt = ({ deliveryReceipt }: Props) => {
	const [receivedProducts, setReceivedProducts] = useState([]);
	const [selectedDeliveryReceiptProduct, setSelectedDeliveryReceiptProduct] = useState(null);
	const [viewProductAdjustmentsSlipVisible, setViewProductAdjustmentsSlipVisible] = useState(false);

	// Effect: Format received products
	useEffect(() => {
		if (deliveryReceipt) {
			const formattedProducts = deliveryReceipt?.delivery_receipt_products?.map((drProduct) => {
				const {
					id,
					status,
					is_match,
					delivered_quantity_piece,
					received_quantity_piece,
					extra_message,
					order_slip_product,
					is_adjusted,
				} = drProduct;
				const { product } = order_slip_product;

				const action = is_adjusted ? (
					<ViewButtonIcon
						tooltip="View Adjustment Slips"
						onClick={() =>
							onViewAdjustmentSlips({
								id,
								barcode: product?.barcode,
								name: product?.name,
							})
						}
					/>
				) : null;

				return [
					<>
						<span>{product.name}</span>
						{getMessage(is_match, extra_message?.is_under, extra_message?.message)}
					</>,
					delivered_quantity_piece,
					received_quantity_piece,
					getDeliveryReceiptStatus(`${status}-${is_adjusted}`, status, is_adjusted),
					action,
				];
			});

			setReceivedProducts(formattedProducts);
		}
	}, [deliveryReceipt]);

	const getReceivedBy = useCallback(
		() =>
			`${deliveryReceipt?.receiving_user?.first_name} ${deliveryReceipt?.receiving_user?.last_name} - ${deliveryReceipt?.receiving_user?.branch?.name}`,
		[deliveryReceipt],
	);

	const getMessage = (isMatch, isUnder, message) => {
		let mainMessage = 'Match';
		let colorType = coloredTextType.DEFAULT;
		let extraMessage = '';
		if (!isMatch) {
			mainMessage = isUnder ? 'Under' : 'Over';
			extraMessage = `: ${message}` || '';
			colorType = coloredTextType.ERROR;
		} else {
			colorType = coloredTextType.PRIMARY;
		}

		return (
			<div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
				<span style={{ marginRight: '5px' }}>
					{isMatch ? <CheckIcon size="small" /> : <ErrorIcon size="small" />}
				</span>
				<ColoredText size="small" text={`${mainMessage} ${extraMessage}`} type={colorType} />
			</div>
		);
	};

	const onViewAdjustmentSlips = (deliveryReceiptProduct) => {
		setSelectedDeliveryReceiptProduct(deliveryReceiptProduct);
		setViewProductAdjustmentsSlipVisible(true);
	};

	return (
		<Box>
			<div className="details">
				<DetailsRow>
					<DetailsHalf
						label="Date & Time Received"
						value={formatDateTime(deliveryReceipt?.datetime_received)}
					/>
					<DetailsHalf label="F-OS1" value={12} />

					<DetailsHalf label="Received By" value={getReceivedBy()} />

					<DetailsHalf label="F-DS1" value={deliveryReceipt?.id} />
				</DetailsRow>
			</div>

			<div className="received-products">
				<Divider dashed />

				<DetailsRow>
					<DetailsSingle label="Received Products" value="" />
				</DetailsRow>
			</div>

			<TableNormal columns={columns} data={receivedProducts} displayInPage />

			<ViewProductAdjustmentSlipsModal
				deliveryReceiptProductId={selectedDeliveryReceiptProduct?.id}
				barcode={selectedDeliveryReceiptProduct?.barcode}
				name={selectedDeliveryReceiptProduct?.name}
				visible={viewProductAdjustmentsSlipVisible}
				onClose={() => setViewProductAdjustmentsSlipVisible(false)}
			/>
		</Box>
	);
};
