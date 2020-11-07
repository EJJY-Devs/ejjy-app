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
			title={`[VIEW] Product Details`}
			className="modal-large"
			visible={visible}
			footer={[<Button text="Close" onClick={onClose} />]}
			onCancel={onClose}
			centered
			closable
		>
			<DetailsRow>
				<DetailsSingle label="Barcode" value={product?.barcode || product?.textcode} />
				<DetailsSingle label="Name" value={product?.name} />
				<DetailsSingle label="Type" value={getProductType(product?.type)} />
				<DetailsSingle
					label="Unit of Measurement"
					value={getUnitOfMeasurement(product?.unit_of_measurement)}
				/>

				<Divider dashed />

				<DetailsHalf label="Checking" value={product?.is_daily_checked ? 'Daily' : 'Random'} />
				<DetailsHalf label="Is Vat Exempted?" value={product?.is_vat_exempted ? 'Yes' : 'No'} />
				<DetailsHalf label="Reorder Point" value={product?.reorder_point} />
				<DetailsHalf label="Max Balance" value={product?.max_balance} />
				<DetailsHalf label="Price (Piece)" value={product?.price_per_piece} />
				<DetailsHalf label="Price (Bulk)" value={product?.price_per_bulk} />
				<DetailsHalf label="Allowable Spoilage (%)" value={product?.allowable_spoilage * 100} />
			</DetailsRow>
		</Modal>
	);
};
