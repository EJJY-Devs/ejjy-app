import { EditFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Spin, Table, Tooltip } from 'antd';
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
	appTypes,
} from 'global';
import {
	useBranchProductBalances,
	useBranches,
	useProductCategories,
	useQueryParams,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { convertIntoArray, getAppType, getLocalBranchId } from 'utils';

const BranchProductBalances = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
	const [selectedBalance, setSelectedBalance] = useState(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();

	// Set default branch: 'all' for head office users, local branch for back office
	useEffect(() => {
		if (!params.branchId) {
			if (getAppType() === appTypes.HEAD_OFFICE) {
				// Head office: default to 'all'
				setQueryParams({ branchId: 'all' }, { shouldResetPage: false });
			} else {
				// Back office: default to local branch
				const localBranchId = getLocalBranchId();
				if (localBranchId) {
					setQueryParams(
						{ branchId: localBranchId },
						{ shouldResetPage: false },
					);
				}
			}
		}
	}, []);

	// DYNAMIC COLUMNS
	const columns: ColumnsType = [
		{ title: 'Barcode', dataIndex: 'barcode' },
		{
			title: 'Description',
			dataIndex: 'description',
		},
		{
			title: 'Value',
			dataIndex: 'value',
			align: 'right',
			sorter: true,
			sortOrder: (() => {
				if (params?.ordering === 'value') return 'ascend';
				if (params?.ordering === '-value') return 'descend';
				return null;
			})(),
			sortDirections: ['ascend', 'descend', 'ascend'],
			onHeaderCell: () => ({
				onClick: () => {
					let ordering;
					if (!params?.ordering || params?.ordering === '-value') {
						ordering = 'value';
					} else if (params?.ordering === 'value') {
						ordering = '-value';
					}
					setQueryParams({ ordering }, { shouldResetPage: true });
				},
			}),
		},
		...(getAppType() === appTypes.HEAD_OFFICE
			? [{ title: 'Action', dataIndex: 'action' }]
			: []),
	];

	const isAllBranches =
		getAppType() === appTypes.HEAD_OFFICE && params.branchId === 'all';

	const {
		data: { branchProductBalances, total },
		isFetching: isFetchingBranchProductBalances,
		error: branchProductBalancesError,
		refetch: refetchBranchProductBalances,
	} = useBranchProductBalances({
		params: {
			...params,
			page: Number(params?.page) || DEFAULT_PAGE,
			pageSize: Number(params?.pageSize) || DEFAULT_PAGE_SIZE,
		},
	});

	// EFFECTS
	useEffect(() => {
		if (isAllBranches) {
			// Backend already aggregated the data, just format it for display
			const data = branchProductBalances.map((balance) => {
				const isWeighing = balance.is_weighing;
				return {
					key: balance.id,
					barcode: balance.barcode || EMPTY_CELL,
					description: balance.name || EMPTY_CELL,
					value: isWeighing
						? Number(balance.value).toFixed(3)
						: Number(balance.value).toFixed(0),
				};
			});

			setDataSource(data);
		} else {
			// Normal display for single branch
			const data = branchProductBalances.map((balance) => {
				const isWeighing =
					balance.branch_product?.product?.unit_of_measurement === 'weighing';
				const baseData: any = {
					key: balance.id,
					barcode: balance.branch_product?.product?.barcode || EMPTY_CELL,
					description: balance.branch_product?.product?.name || EMPTY_CELL,
					value: isWeighing
						? Number(balance.value).toFixed(3)
						: Number(balance.value).toFixed(0),
				};

				// Only add action for head office users
				if (getAppType() === appTypes.HEAD_OFFICE) {
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
		}
	}, [branchProductBalances, params.branchId]);

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

			<Spin spinning={isFetchingBranchProductBalances}>
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
			</Spin>
		</Box>
	);
};

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: getAppType() === appTypes.HEAD_OFFICE },
	});
	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
		error: productCategoriesError,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// METHODS
	const getBranchSelectValue = () => {
		if (!params.branchId && getAppType() === appTypes.HEAD_OFFICE) {
			return 'all';
		}
		if (params.branchId === 'all') {
			return 'all';
		}
		// Parse as number to match with Option values
		const numValue = Number(params.branchId);
		return !Number.isNaN(numValue) ? numValue : 'all';
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

			{getAppType() === appTypes.HEAD_OFFICE && (
				<Row className="mt-4" gutter={[16, 16]}>
					<Col lg={24} span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
							value={getBranchSelectValue()}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams(
									{ branchId: value || 'all' },
									{ shouldResetPage: true },
								);
							}}
						>
							<Select.Option value="all">All</Select.Option>
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
