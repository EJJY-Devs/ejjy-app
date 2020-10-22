import { Divider, Modal } from 'antd';
import React from 'react';
import { DetailsHalf, DetailsRow, DetailsSingle } from '../../../../components';
import { Button } from '../../../../components/elements';
import { getProductType, getUnitOfMeasurement } from '../../../../utils/function';

interface Props {
	visible: boolean;
	product: any;
	onClose: any;
}

export const ViewProductModal = ({ product, visible, onClose }: Props) => {
	return (
		<Modal
			className="ViewProductModal modal-large"
			title="View Product"
			visible={visible}
			footer={[<Button text="Close" onClick={onClose} />]}
			onCancel={onClose}
			centered
			closable
		>
			<DetailsRow>
				<DetailsSingle label="Barcode" value={product?.barcode} />
				<DetailsSingle label="Name" value={product?.name} />
				<DetailsSingle label="Type" value={getProductType(product?.type)} />
				<DetailsSingle
					label="Unit of Measurement"
					value={getUnitOfMeasurement(product?.unit_of_measurement)}
				/>
				<DetailsSingle label="Print Details" value={product?.print_details} />
				<DetailsSingle label="Description" value={product?.description} />

				<Divider dashed />

				<DetailsHalf label="Reorder Point" value={product?.reorder_point} />
				<DetailsHalf label="Max Balance" value={product?.max_balance} />
				<DetailsHalf label="Cost (Piece)" value={product?.cost_per_piece} />
				<DetailsHalf label="Cost (Bulk)" value={product?.cost_per_bulk} />
				<DetailsHalf label="Price (Piece)" value={product?.price_per_piece} />
				<DetailsHalf label="Price (Bulk)" value={product?.price_per_bulk} />
				<DetailsHalf label="Allowable Spoilage (%)" value={product?.allowable_spoilage * 100} />
			</DetailsRow>
		</Modal>
	);
};
