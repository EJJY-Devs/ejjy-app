import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	CreateBalanceAdjustmentLogModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Label } from 'components/elements';
import { filterOption } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
	pageSizeOptions,
} from 'global';
import { useBranchProducts, useBranches, useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray, formatQuantity, isUserFromOffice } from 'utils';

const columns: ColumnsType = [
	{ title: 'Code', dataIndex: 'code' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Balance', dataIndex: 'balance' },
	{ title: 'Actions', dataIndex: 'actions' },
];

export const TabBranchProducts = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedBranchProduct, setSelectedBranchProduct] = useState(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branchProducts, total },
		isFetching: isFetchingBranchProducts,
		error: branchProductsError,
	} = useBranchProducts({
		params: {
			ordering: '-balance__datetime_updated',
			hasNegativeBalance: true,
			...params,
		},
	});

	// METHODS
	useEffect(() => {
		const data = branchProducts.map((branchProduct) => ({
			key: branchProduct.id,
			code:
				branchProduct.product.barcode ||
				branchProduct.product.selling_barcode ||
				branchProduct.product.textcode,
			name: branchProduct.product.name,
			balance: formatQuantity({
				unitOfMeasurement: branchProduct.product.unit_of_measurement,
				quantity: branchProduct.current_balance,
			}),
			actions: (
				<Tooltip title="Create Balance Adjustment">
					<Button
						icon={<PlusOutlined />}
						type="primary"
						ghost
						onClick={() => setSelectedBranchProduct(branchProduct)}
					/>
				</Tooltip>
			),
		}));

		setDataSource(data);
	}, [branchProducts]);

	return (
		<>
			<TableHeader title="Branch Products" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={convertIntoArray(branchProductsError)}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingBranchProducts}
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
				scroll={{ x: 800 }}
				bordered
			/>

			{selectedBranchProduct && (
				<CreateBalanceAdjustmentLogModal
					branchProduct={selectedBranchProduct}
					onClose={() => setSelectedBranchProduct(null)}
				/>
			)}
		</>
	);
};

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: isUserFromOffice(user.user_type) },
	});

	// METHODS
	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setQueryParams({ search }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<div className="mb-4">
			<RequestErrors
				errors={convertIntoArray(branchErrors, 'Branches')}
				withSpaceBottom
			/>

			<Row gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="Search" spacing />
					<Input
						defaultValue={params.search}
						prefix={<SearchOutlined />}
						allowClear
						onChange={(event) =>
							handleSearchDebounced(event.target.value.trim())
						}
					/>
				</Col>

				{isUserFromOffice(user.user_type) && (
					<Col lg={12} span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
							value={params.branchId ? Number(params.branchId) : null}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams({ branchId: value }, { shouldResetPage: true });
							}}
						>
							{branches.map((branch) => (
								<Select.Option key={branch.id} value={branch.id}>
									{branch.name}
								</Select.Option>
							))}
						</Select>
					</Col>
				)}
			</Row>
		</div>
	);
};
