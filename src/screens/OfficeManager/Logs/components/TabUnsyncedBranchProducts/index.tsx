import { Col, Row, Select, Table, Tag } from 'antd';
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

export const TabUnsyncedBranchProducts = () => {
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
	];

	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { productSyncStatuses, total },
		isFetching: isFetchingProductSyncStatuses,
		error: productSyncStatusError,
	} = useProductSyncStatus({
		params: {
			...params,
			out_of_sync_only: true,
		},
	});

	// METHODS
	useEffect(() => {
		const getPriceTypeName = (field: string) => {
			const mapping = {
				price_per_piece: 'Price Per Piece',
				wholesale_price: 'Wholesale Price',
				special_price: 'Special Price',
				credit_price: 'Credit Price',
			};
			return mapping[field] || field;
		};

		const data = productSyncStatuses.map((status) => ({
			key: status.id,
			productName: status.product_name,
			branch: status.branch_name,
			mismatches: (
				<div>
					{status.sync_details?.mismatches &&
					status.sync_details.mismatches.length > 0 ? (
						status.sync_details.mismatches.map((mismatch, index) => (
							<Tag key={index} color="red">
								{getPriceTypeName(mismatch)}
							</Tag>
						))
					) : (
						<Tag color="gray">No mismatches</Tag>
					)}
				</div>
			),
		}));

		setDataSource(data);
	}, [productSyncStatuses]);

	return (
		<>
			<TableHeader
				title="Unsynced Branch Products"
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
