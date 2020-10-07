import { Divider, Modal } from 'antd';
import React from 'react';
import { DetailsHalf, DetailsRow, DetailsSingle } from '../../../../../components';
import { Button } from '../../../../../components/elements';

interface Props {
	visible: boolean;
	branchName: string;
	branchProduct: any;
	onClose: any;
}

export const ViewBranchProductModal = ({ branchProduct, branchName, visible, onClose }: Props) => {
	return (
		<Modal
			className="ViewBranchProductModal"
			title={`[VIEW] Product Details (${branchName})`}
			visible={visible}
			footer={[<Button text="Close" onClick={onClose} />]}
			onCancel={onClose}
			centered
			closable
		>
			<DetailsRow>
				<DetailsSingle label="Barcode" value={branchProduct?.product?.barcode} />
				<DetailsSingle label="Name" value={branchProduct?.product?.name} />

				<Divider dashed />

				<DetailsHalf
					label="Is Daily Checked?"
					value={branchProduct?.is_daily_checked ? 'Yes' : 'No'}
				/>
				<DetailsHalf
					label="Is Randomly Checked?"
					value={branchProduct?.is_randomly_checked ? 'Yes' : 'No'}
				/>
				<DetailsHalf label="Reorder Point" value={branchProduct?.reorder_point} />
				<DetailsHalf label="Max Balance" value={branchProduct?.max_balance} />
				<DetailsHalf label="Price (Piece)" value={branchProduct?.price_per_piece} />
				<DetailsHalf label="Price (Bulk)" value={branchProduct?.price_per_bulk} />
				<DetailsHalf
					label="Allowable Spoilage (%)"
					value={branchProduct?.allowable_spoilage * 100}
				/>
				<DetailsHalf label="Current Balance" value={branchProduct?.current_balance} />
			</DetailsRow>
		</Modal>
	);
};
