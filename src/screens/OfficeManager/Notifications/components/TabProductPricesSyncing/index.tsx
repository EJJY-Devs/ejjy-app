import { Col, Row, Select, Table, Tag, Button, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader } from 'components';
import { Label } from 'components/elements';
import { filterOption } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import { useBranches, useProductSyncStatus, useQueryParams } from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray } from 'utils';
import { ToolOutlined } from '@ant-design/icons';
import { ResolveMismatchModal } from './ResolveMismatchModal';

const getPriceTypeName = (field: string) => {
	const mapping = {
		price_per_piece: 'Price Per Piece',
		wholesale_price: 'Wholesale Price',
		special_price: 'Special Price',
		credit_price: 'Credit Price',
	};
	return mapping[field] || field;
};

export const TabProductPricesSyncing = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();

	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedSyncStatus, setSelectedSyncStatus] = useState(null);

	const {
		data: { productSyncStatuses, total },
		isFetching: isFetchingProductSyncStatuses,
		error: productSyncStatusError,
	} = useProductSyncStatus({
		params: {
			...params,
			out_of_sync_only: true,
		},
		options: {
			refetchOnWindowFocus: true,
			refetchInterval: 30000,
		},
	});

	// VARIABLES
	const columns: ColumnsType = [
		{
			title: 'Product Name',
			dataIndex: 'productName',
			key: 'productName',
		},
		{
			title: 'Branch',
			dataIndex: 'branch',
			key: 'branch',
		},
		{
			title: 'Mismatches',
			dataIndex: 'mismatches',
			key: 'mismatches',
		},
		{
			title: 'Actions',
			dataIndex: 'actions',
			key: 'actions',
			width: 150,
			align: 'center',
		},
	];

	// METHODS
	useEffect(() => {
		const data = productSyncStatuses.map((status) => {
			const mismatches = status.sync_details?.mismatches || [];

			return {
				key: status.id,
				productName: status.product_name,
				branch: status.branch_name,
				mismatches: (
					<div>
						{status.status === 'not_found_on_head_office' ? (
							<Tag color="orange">Not Found on Head Office</Tag>
						) : (
							mismatches.map((mismatch) => (
								<Tag key={mismatch.field} color="red">
									{getPriceTypeName(mismatch.field)}
								</Tag>
							))
						)}
					</div>
				),
				actions: (
					<Tooltip title="Resolve Mismatches">
						<Button
							disabled={status.status === 'not_found_on_head_office'}
							icon={<ToolOutlined />}
							size="small"
							type="primary"
							ghost
							onClick={() => setSelectedSyncStatus(status)}
						/>
					</Tooltip>
				),
			};
		});

		setDataSource(data);
	}, [productSyncStatuses]);

	return (
		<>
			<TableHeader
				title="Product Prices Syncing"
				wrapperClassName="pt-2 px-0"
			/>

			<Filter isLoading={isFetchingProductSyncStatuses} />

			<RequestErrors errors={convertIntoArray(productSyncStatusError)} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingProductSyncStatuses}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, newPageSize) => {
						setQueryParams({
							page,
							pageSize: newPageSize,
						});
					},
					disabled: !dataSource,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				bordered
			/>

			{selectedSyncStatus && (
				<ResolveMismatchModal
					syncStatus={selectedSyncStatus}
					onClose={() => setSelectedSyncStatus(null)}
				/>
			)}
		</>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	return (
		<>
			<RequestErrors
				errors={convertIntoArray(branchErrors, 'Branches')}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="Branch" spacing />
					<Select
						className="w-100"
						disabled={isLoading || isFetchingBranches}
						filterOption={filterOption}
						loading={isFetchingBranches}
						optionFilterProp="children"
						value={params.branch_id ? Number(params.branch_id) : null}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ branch_id: value }, { shouldResetPage: true });
						}}
					>
						{branches.map((branch) => (
							<Select.Option key={branch.id} value={branch.id}>
								{branch.name}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>
		</>
	);
};
