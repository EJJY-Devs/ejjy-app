import { EditFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors } from 'components';
import { Box, Label } from 'components/elements';
import { Cart } from 'screens/Shared/Cart';
import { filterOption } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	SEARCH_DEBOUNCE_TIME,
} from 'global';
import {
	useBranchProductBalances,
	useBranches,
	useProductCategories,
	useQueryParams,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray, isUserFromOffice } from 'utils';

const BranchProductBalances = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
	const [selectedBalance, setSelectedBalance] = useState(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);

	// DYNAMIC COLUMNS
	const columns: ColumnsType = [
		{ title: 'Barcode', dataIndex: 'barcode' },
		{ title: 'Description', dataIndex: 'description' },
		{ title: 'Value', dataIndex: 'value', align: 'right' },
		...(isUserFromOffice(user.user_type)
			? [{ title: 'Action', dataIndex: 'action' }]
			: []),
	];

	const {
		data: { branchProductBalances, total },
		isFetching: isFetchingBranchProductBalances,
		error: branchProductBalancesError,
		refetch: refetchBranchProductBalances,
	} = useBranchProductBalances({
		params: {
			...params,
			page: params?.page || DEFAULT_PAGE,
			pageSize: params?.pageSize || DEFAULT_PAGE_SIZE,
		},
	});

	// EFFECTS
	useEffect(() => {
		const data = branchProductBalances.map((balance) => {
			const baseData: any = {
				key: balance.id,
				barcode: balance.branch_product?.product?.barcode || EMPTY_CELL,
				description: balance.branch_product?.product?.name || EMPTY_CELL,
				value: Number(balance.value).toFixed(3),
			};

			// Only add action for head office users
			if (isUserFromOffice(user.user_type)) {
				baseData.action = (
					<Tooltip title="Create Adjustment Slip">
						<Button
							icon={<EditFilled />}
							type="primary"
							ghost
							onClick={() => handleCreateAdjustmentSlip(balance)}
						/>
					</Tooltip>
				);
			}

			return baseData;
		});

		setDataSource(data);
	}, [branchProductBalances, user.user_type]);

	// METHODS
	const handleCreateAdjustmentSlip = (balance) => {
		setSelectedBalance(balance);
		setIsCartModalVisible(true);
	};

	const handleModalClose = () => {
		setSelectedBalance(null);
		setIsCartModalVisible(false);
	};

	return (
		<Box>
			<RequestErrors
				errors={convertIntoArray(branchProductBalancesError)}
				withSpaceBottom
			/>

			<Filter />

			{isCartModalVisible && (
				<Cart
					prePopulatedProduct={selectedBalance}
					type="Adjustment Slip"
					onClose={handleModalClose}
					onRefetch={refetchBranchProductBalances}
				/>
			)}

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingBranchProductBalances}
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
		</Box>
	);
};

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: isUserFromOffice(user.user_type) },
	});
	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
		error: productCategoriesError,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// EFFECTS
	useEffect(() => {
		// Set first branch as default if user is from office, branches are loaded, and no branch is currently selected
		if (
			isUserFromOffice(user.user_type) &&
			branches.length > 0 &&
			!params.branchId &&
			!isFetchingBranches
		) {
			setQueryParams({ branchId: branches[0].id }, { shouldResetPage: true });
		}
	}, [
		branches,
		params.branchId,
		user.user_type,
		isFetchingBranches,
		setQueryParams,
	]);

	// METHODS
	const getBranchSelectValue = () => {
		if (params.branchId) {
			return Number(params.branchId);
		}
		if (branches.length > 0) {
			return branches[0].id;
		}
		return null;
	};
	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setQueryParams({ search }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<div className="mb-4">
			<RequestErrors
				errors={[
					...convertIntoArray(branchesError, 'Branches'),
					...convertIntoArray(productCategoriesError, 'Product Categories'),
				]}
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

				<Col lg={12} span={24}>
					<Label label="Category" spacing />
					<Select
						className="w-100"
						filterOption={filterOption}
						loading={isFetchingProductCategories}
						optionFilterProp="children"
						value={params.productCategory ? params.productCategory : null}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ productCategory: value },
								{ shouldResetPage: true },
							);
						}}
					>
						{productCategories.map(({ id, name }) => (
							<Select.Option key={id} value={name}>
								{name}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>

			{isUserFromOffice(user.user_type) && (
				<Row className="mt-4" gutter={[16, 16]}>
					<Col lg={24} span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
							value={getBranchSelectValue()}
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
				</Row>
			)}
		</div>
	);
};

export default BranchProductBalances;
