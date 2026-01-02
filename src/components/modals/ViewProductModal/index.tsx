import { Button, Descriptions, Divider, Modal, Spin, Tabs, Tag } from 'antd';
import { RequestErrors } from 'components';
import { appTypes, MAX_PAGE_SIZE } from 'global';
import { useBranches, useBranchProducts } from 'hooks';
import _, { upperFirst } from 'lodash';
import React, { useEffect, useState } from 'react';
import {
	convertIntoArray,
	formatInPeso,
	formatQuantity,
	getAppType,
	getProductType,
	getUnitOfMeasurement,
} from 'utils';

interface Props {
	product: any;
	onClose: any;
}

export const ViewProductModal = ({ product, onClose }: Props) => {
	// STATES
	const [activeBranch, setActiveBranch] = useState(null);

	// CUSTOM HOOKS
	const {
		data: { branchProducts },
		isFetching: isFetchingBranchProducts,
		isFetchedAfterMount: isBranchProductsFetchedAfterMount,
		error: branchProductError,
	} = useBranchProducts({
		params: { productIds: product?.id },
		options: {
			enabled: product !== null && getAppType() !== appTypes.BACK_OFFICE,
		},
	});
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		isFetchedAfterMount: isBranchesFetchedAfterMount,
		error: branchesErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: getAppType() !== appTypes.BACK_OFFICE },
	});

	useEffect(() => {
		if (branches.length > 0) {
			setActiveBranch(_.toString(branches?.[0]?.id));
		}
	}, [branches]);

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={<Button onClick={onClose}>Close</Button>}
			title="View Product"
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				className="px-6 pt-6"
				errors={[
					...convertIntoArray(branchesErrors, 'Branches'),
					...convertIntoArray(branchProductError, 'Branch Products'),
				]}
			/>

			<Descriptions
				className="w-100"
				column={2}
				labelStyle={{ width: 200 }}
				size="small"
				bordered
			>
				<Descriptions.Item label="Name" span={2}>
					{product.name}
				</Descriptions.Item>
				<Descriptions.Item label="Barcode">{product.barcode}</Descriptions.Item>
				<Descriptions.Item label="Scale Barcode">
					{product.selling_barcode}
				</Descriptions.Item>
				<Descriptions.Item label="Packing Barcode">
					{product.packing_barcode}
				</Descriptions.Item>
				<Descriptions.Item label="Textcode">
					{product.textcode}
				</Descriptions.Item>
				<Descriptions.Item label="Product Category" span={2}>
					{upperFirst(product.product_category) || 'None'}
				</Descriptions.Item>
				<Descriptions.Item label="Print Details (Receipt)" span={2}>
					{product.print_details}
				</Descriptions.Item>
				<Descriptions.Item
					label="Print Details (Price Tag)"
					span={2}
					style={{ whiteSpace: 'pre-line' }}
				>
					{product.price_tag_print_details}
				</Descriptions.Item>
				<Descriptions.Item label="Description" span={2}>
					{product.description}
				</Descriptions.Item>
				<Descriptions.Item label="Include in Scale">
					{product.is_shown_in_scale_list ? 'Yes' : 'No'}
				</Descriptions.Item>
			</Descriptions>

			<Divider orientation="left">Tags</Divider>

			<Descriptions
				className="w-100"
				column={1}
				labelStyle={{ width: 200 }}
				size="small"
				bordered
			>
				<Descriptions.Item label="TT-001">
					{getProductType(product.type)}
				</Descriptions.Item>
				<Descriptions.Item label="TT-002">
					{getUnitOfMeasurement(product.unit_of_measurement)}
				</Descriptions.Item>
				<Descriptions.Item label="TT-002 (Scale Barcode)">
					{getUnitOfMeasurement(product.selling_barcode_unit_of_measurement)}
				</Descriptions.Item>
				<Descriptions.Item label="TT-002 (Packing Barcode)">
					{getUnitOfMeasurement(product.packing_barcode_unit_of_measurement)}
				</Descriptions.Item>
				<Descriptions.Item label="TT-003">
					{product.is_vat_exempted ? 'VAT-EXEMPTED' : 'VAT'}
				</Descriptions.Item>

				{product.point_system_tag && (
					<Descriptions.Item label="Point System Tag">
						{product.point_system_tag.name}
					</Descriptions.Item>
				)}

				<Descriptions.Item label="Qty Allowance">
					{product.has_quantity_allowance ? 'Yes' : 'No'}
				</Descriptions.Item>
			</Descriptions>

			<Divider orientation="left">Quantity</Divider>

			<Descriptions
				className="w-100"
				column={2}
				labelStyle={{ width: 200 }}
				size="small"
				bordered
			>
				<Descriptions.Item label="Reorder Point">
					{product.reorder_point}
				</Descriptions.Item>
				<Descriptions.Item label="Max Balance">
					{formatQuantity({
						unitOfMeasurement: product.unit_of_measurement,
						quantity: product.max_balance,
					})}
				</Descriptions.Item>
				<Descriptions.Item label="Pieces in Bulk">
					{product.pieces_in_bulk}
				</Descriptions.Item>
				<Descriptions.Item label="Allowable Spoilage (%)">
					{product.allowable_spoilage * 100}
				</Descriptions.Item>
			</Descriptions>

			<Divider orientation="left">Money</Divider>

			<Descriptions
				className="w-100"
				column={2}
				labelStyle={{ width: 200 }}
				size="small"
				bordered
			>
				<Descriptions.Item label="Cost (Piece)">
					{formatInPeso(product.cost_per_piece)}
				</Descriptions.Item>
				<Descriptions.Item label="Cost (Bulk)">
					{formatInPeso(product.cost_per_bulk)}
				</Descriptions.Item>
				<Descriptions.Item label="Price (Piece)">
					{formatInPeso(product.price_per_piece)}
				</Descriptions.Item>
				<Descriptions.Item label="Price (Bulk)">
					{formatInPeso(product.price_per_bulk)}
				</Descriptions.Item>
			</Descriptions>

			{getAppType() !== appTypes.BACK_OFFICE && (
				<>
					<Divider orientation="left">Branch Product</Divider>

					<Spin
						spinning={
							(!isBranchProductsFetchedAfterMount &&
								isFetchingBranchProducts) ||
							(!isBranchesFetchedAfterMount && isFetchingBranches)
						}
					>
						<Tabs
							activeKey={activeBranch}
							tabPosition="left"
							type="card"
							destroyInactiveTabPane
							onTabClick={setActiveBranch}
						>
							{branches.map((branch) => {
								const branchProduct = branchProducts?.find(
									(bp) => bp.branch_id === branch.id,
								);

								return branchProduct ? (
									<Tabs.TabPane key={branch.id} tab={branch.name}>
										<Descriptions
											className="w-100"
											column={2}
											labelStyle={{ width: 200 }}
											size="small"
											bordered
										>
											<Descriptions.Item label="In Stock" span={2}>
												{branchProduct.is_sold_in_branch ? (
													<Tag color="green">Yes</Tag>
												) : (
													<Tag color="red">No</Tag>
												)}
											</Descriptions.Item>
											<Descriptions.Item label="Checking" span={2}>
												{branchProduct.is_daily_checked ? (
													<Tag color="purple">Daily</Tag>
												) : (
													<Tag color="blue">Random</Tag>
												)}
											</Descriptions.Item>
											<Descriptions.Item label="Reorder Point">
												{branchProduct.reorder_point}
											</Descriptions.Item>
											<Descriptions.Item label="Max Balance">
												{formatQuantity({
													unitOfMeasurement:
														branchProduct.product.unit_of_measurement,
													quantity: branchProduct.max_balance,
												})}
											</Descriptions.Item>
											<Descriptions.Item label="Price (Piece)">
												{formatInPeso(branchProduct.price_per_piece)}
											</Descriptions.Item>
											<Descriptions.Item label="Price (Bulk)">
												{formatInPeso(branchProduct.price_per_bulk)}
											</Descriptions.Item>
											<Descriptions.Item label="Wholesale Price (Piece)">
												{formatInPeso(branchProduct?.markdown_price_per_piece1)}
											</Descriptions.Item>
											<Descriptions.Item label="Wholesale Price (Bulk)">
												{formatInPeso(branchProduct?.markdown_price_per_bulk1)}
											</Descriptions.Item>
											<Descriptions.Item label="Special Price (Piece)">
												{formatInPeso(branchProduct?.markdown_price_per_piece2)}
											</Descriptions.Item>
											<Descriptions.Item label="Special Price (Bulk)">
												{formatInPeso(branchProduct?.markdown_price_per_bulk2)}
											</Descriptions.Item>
										</Descriptions>
									</Tabs.TabPane>
								) : undefined;
							})}
						</Tabs>
					</Spin>
				</>
			)}
		</Modal>
	);
};
