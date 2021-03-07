import { Divider, Modal } from 'antd';
import React from 'react';
import { DetailsHalf, DetailsRow, DetailsSingle } from '../../../../../components';
import { Button } from '../../../../../components/elements';
import { numberWithCommas } from '../../../../../utils/function';

interface Props {
	visible: boolean;
	branchName: string;
	branchProduct: any;
	onClose: any;
}

export const ViewBranchProductModal = ({ branchProduct, branchName, visible, onClose }: Props) => {
	return (
		<Modal
			className="ViewBranchProductModal modal-large"
			title={`[VIEW] Product Details (${branchName})`}
			visible={visible}
			footer={[<Button text="Close" onClick={onClose} />]}
			onCancel={onClose}
			centered
			closable
		>
			<DetailsRow>
				<DetailsSingle
					label="Barcode"
					value={branchProduct?.product?.barcode || branchProduct?.product?.textcode}
				/>
				<DetailsSingle label="Name" value={branchProduct?.product?.name} />

				<Divider dashed />

				<DetailsHalf
					label="Checking"
					value={branchProduct?.is_daily_checked ? 'Daily' : 'Random'}
				/>

				<DetailsHalf
					label="Is Shown in Scale List?"
					value={branchProduct?.is_shown_in_scale_list ? 'Yes' : 'No'}
				/>

				<DetailsHalf label="Reorder Point" value={branchProduct?.reorder_point} />
				<DetailsHalf label="Max Balance" value={branchProduct?.max_balance} />

				<DetailsHalf
					label="Allowable Spoilage (%)"
					value={branchProduct?.allowable_spoilage * 100}
				/>
				<DetailsHalf label="Current Balance" value={branchProduct?.current_balance} />

				<Divider />

				<DetailsSingle
					label="Price (Piece)"
					value={`₱${numberWithCommas(Number(branchProduct?.price_per_piece).toFixed(2))}`}
				/>
				<DetailsSingle
					label="Discounted Price 1 (Piece)"
					value={`₱${numberWithCommas(
						Number(branchProduct?.discounted_price_per_piece1).toFixed(2),
					)}`}
				/>
				<DetailsSingle
					label="Discounted Price 2 (Piece)"
					value={`₱${numberWithCommas(
						Number(branchProduct?.discounted_price_per_piece2).toFixed(2),
					)}`}
				/>

				<DetailsSingle
					label="Price (Bulk)"
					value={`₱${numberWithCommas(Number(branchProduct?.price_per_bulk).toFixed(2))}`}
				/>
				<DetailsSingle
					label="Discounted Price 1 (Bulk)"
					value={`₱${numberWithCommas(
						Number(branchProduct?.discounted_price_per_bulk1).toFixed(2),
					)}`}
				/>
				<DetailsSingle
					label="Discounted Price 2 (Bulk)"
					value={`₱${numberWithCommas(
						Number(branchProduct?.discounted_price_per_bulk2).toFixed(2),
					)}`}
				/>
			</DetailsRow>
		</Modal>
	);
};
