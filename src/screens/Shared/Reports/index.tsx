import { EditFilled } from '@ant-design/icons';
import { Button, Col, Radio, Row, Select, Spin, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SorterResult } from 'antd/lib/table/interface';
import {
	Content,
	DailyItemSoldModal,
	EditBranchProductBalanceModal,
	RequestErrors,
	TimeRangeFilter,
} from 'components';
import { Box, Label } from 'components/elements';
import { filterOption, getProductCode } from 'ejjy-global';
import {
	ALL_OPTION_KEY,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
	pageSizeOptions,
	productStatus,
	quantityTypes,
	refetchOptions,
	timeRangeTypes,
} from 'global';
import {
	useBranchProductsWithAnalytics,
	useBranches,
	useProductCategories,
	useProducts,
	useQueryParams,
} from 'hooks';
import _ from 'lodash';
import { IProductCategory } from 'models';
import React, {
	useCallback,
	useEffect,
	useState,
	useMemo,
	useRef,
} from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	convertToBulk,
	formatQuantity,
	getBranchProductStatus,
	getLocalBranchId,
	isUserFromBranch,
	isUserFromOffice,
} from 'utils';

const sorts = {
	CURRENT_BALANCE_ASC: 'current_balance',
	CURRENT_BALANCE_DES: '-current_balance',
	QUANTITY_SOLD_ASC: 'quantity_sold',
	QUANTITY_SOLD_DES: '-quantity_sold',
	DAILY_AVERAGE_SOLD_ASC: 'daily_average_sold',
	DAILY_AVERAGE_SOLD_DES: '-daily_average_sold',
	DAILY_AVERAGE_SOLD_PERCENTAGE_ASC: 'daily_average_sold_percentage',
	DAILY_AVERAGE_SOLD_PERCENTAGE_DES: '-daily_average_sold_percentage',
};

const getSortOrder = (column, order) => {
	let sortOrder = null;

	if (!order) {
		return sortOrder;
	}

	if (column === 'balance') {
		sortOrder =
			order === 'ascend'
				? sorts.CURRENT_BALANCE_ASC
				: sorts.CURRENT_BALANCE_DES;
	} else if (column === 'quantity_sold') {
		sortOrder =
			order === 'ascend' ? sorts.QUANTITY_SOLD_ASC : sorts.QUANTITY_SOLD_DES;
	} else if (column === 'daily_average_sold') {
		sortOrder =
			order === 'ascend'
				? sorts.DAILY_AVERAGE_SOLD_ASC
				: sorts.DAILY_AVERAGE_SOLD_DES;
	} else if (column === 'daily_average_sold_percentage') {
		sortOrder =
			order === 'ascend'
				? sorts.DAILY_AVERAGE_SOLD_PERCENTAGE_ASC
				: sorts.DAILY_AVERAGE_SOLD_PERCENTAGE_DES;
	}

	return sortOrder;
};

export const Reports = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedBranchProduct, setSelectedBranchProduct] = useState(null);
	const [
		isDailyItemSoldModalVisible,
		setIsDailyItemSoldModalVisible,
	] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
		error: productCategoriesErrors,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		data: { branchProducts, total },
		isFetching: isFetchingBranchProducts,
		isFetchedAfterMount: isBranchProductsFetchedAfterMount,
		error: branchProductsError,
	} = useBranchProductsWithAnalytics({
		params: {
			...params,
			branchId: isUserFromBranch(user.user_type)
				? getLocalBranchId()
				: params?.branchId,
			hasBoBalance: params.hasBoBalance === 'true' ? true : undefined,
			isSoldInBranch:
				params?.isSoldInBranch === ALL_OPTION_KEY || !params?.isSoldInBranch
					? undefined
					: true,
			productIds:
				params?.productIds?.length > 0 ? params.productIds : undefined,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
		},
		options: refetchOptions,
	});

	const columns: ColumnsType = useMemo(() => {
		const getSortOrderFromParam = (field: string) => {
			switch (params?.ordering) {
				case sorts.QUANTITY_SOLD_ASC:
					return field === 'quantity_sold' ? 'ascend' : null;
				case sorts.QUANTITY_SOLD_DES:
					return field === 'quantity_sold' ? 'descend' : null;
				case sorts.DAILY_AVERAGE_SOLD_ASC:
					return field === 'daily_average_sold' ? 'ascend' : null;
				case sorts.DAILY_AVERAGE_SOLD_DES:
					return field === 'daily_average_sold' ? 'descend' : null;
				case sorts.DAILY_AVERAGE_SOLD_PERCENTAGE_ASC:
					return field === 'daily_average_sold_percentage' ? 'ascend' : null;
				case sorts.DAILY_AVERAGE_SOLD_PERCENTAGE_DES:
					return field === 'daily_average_sold_percentage' ? 'descend' : null;
				default:
					return null;
			}
		};

		return [
			{ title: 'Name', dataIndex: 'name', width: 150, fixed: 'left' },
			{ title: 'Code', dataIndex: 'code' },
			{
				title: 'Balance',
				children: [
					{ title: 'Current Balance', dataIndex: 'balance', align: 'center' },
					{ title: 'BO Balance', dataIndex: 'boBalance', align: 'center' },
				],
			},
			{
				title: (
					<div style={{ textAlign: 'center' }}>
						<div>Quantity Sold</div>
						<Button
							size="small"
							style={{
								marginTop: 20,
								fontSize: '11px',
								padding: '2px 8px',
							}}
							type="primary"
							onClick={(e) => {
								e.stopPropagation();
								setIsDailyItemSoldModalVisible(true);
							}}
						>
							View Daily Item Sold
						</Button>
					</div>
				),
				dataIndex: 'quantitySold',
				align: 'center',
				sorter: true,
				sortOrder: getSortOrderFromParam('quantity_sold'),
			},
			{
				title: 'Daily Average Sold',
				dataIndex: 'dailyAverageSold',
				align: 'center',
				sorter: true,
				sortOrder: getSortOrderFromParam('daily_average_sold'),
			},
			{
				title: 'Average Quantity Sold Percentage',
				dataIndex: 'dailyAverageSoldPercentage',
				align: 'center',
				sorter: true,
				sortOrder: getSortOrderFromParam('daily_average_sold_percentage'),
			},
			{
				title: 'Average Daily Consumption',
				dataIndex: 'averageDailyConsumption',
				align: 'center',
			},
			{ title: 'Status', dataIndex: 'status' },
			{ title: 'Actions', dataIndex: 'actions' },
		];
	}, [params?.ordering]);

	useEffect(() => {
		const data = branchProducts.map((branchProduct) => {
			const {
				product,
				bo_balance,
				max_balance,
				current_balance,
				product_status,
				quantity_sold,
				daily_average_sold,
				daily_average_sold_percentage,
				average_daily_consumption,
			} = branchProduct;
			const { name, unit_of_measurement, pieces_in_bulk } = product;

			const convertQuantity = (quantity) =>
				params?.quantityType === quantityTypes.BULK
					? convertToBulk(quantity, pieces_in_bulk)
					: quantity;

			const currentBalance = formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: convertQuantity(current_balance),
			});

			const quantitySold = formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: convertQuantity(quantity_sold),
			});

			const maxBalance = formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: convertQuantity(max_balance),
			});

			const boBalance = formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: convertQuantity(bo_balance),
			});

			return {
				key: branchProduct.id,
				code: getProductCode(product),
				name,
				balance: `${currentBalance} / ${maxBalance}`,
				boBalance,
				quantitySold,
				dailyAverageSold: daily_average_sold,
				dailyAverageSoldPercentage: `${daily_average_sold_percentage}%`,
				averageDailyConsumption: formatQuantity({
					unitOfMeasurement: unit_of_measurement,
					quantity: convertQuantity(average_daily_consumption),
				}),
				status: getBranchProductStatus(product_status),
				actions: (
					<Tooltip title="Edit">
						<Button
							icon={<EditFilled />}
							type="primary"
							ghost
							onClick={() => setSelectedBranchProduct(branchProduct)}
						/>
					</Tooltip>
				),
			};
		});

		setDataSource(data);
	}, [branchProducts, params?.quantityType]);

	return (
		<Content title="Reports">
			<Box>
				<Spin spinning={isFetchingProductCategories}>
					<RequestErrors
						className="px-6 pt-6"
						errors={[
							...convertIntoArray(
								productCategoriesErrors,
								'Product Categories',
							),
							...convertIntoArray(branchProductsError, 'Branch Products'),
						]}
					/>

					<Filter productCategories={productCategories} />

					<Table
						columns={columns}
						dataSource={dataSource}
						loading={
							isFetchingBranchProducts && !isBranchProductsFetchedAfterMount
						}
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
						scroll={{ x: 1600 }}
						bordered
						onChange={(
							_pagination,
							_filters,
							sorter: SorterResult<any>,
							extra,
						) => {
							if (extra.action === 'sort' && sorter.field) {
								// sorter.field refers to dataIndex (e.g., 'quantitySold')
								const fieldMapping = {
									quantitySold: 'quantity_sold',
									dailyAverageSold: 'daily_average_sold',
									dailyAverageSoldPercentage: 'daily_average_sold_percentage',
								};

								const field = fieldMapping[sorter.field as string];

								setQueryParams(
									{ ordering: getSortOrder(field, sorter.order) },
									{ shouldResetPage: true },
								);
							}
						}}
					/>

					{selectedBranchProduct && (
						<EditBranchProductBalanceModal
							branchProduct={selectedBranchProduct}
							onClose={() => setSelectedBranchProduct(null)}
						/>
					)}

					{isDailyItemSoldModalVisible && (
						<DailyItemSoldModal
							branchId={
								isUserFromBranch(user.user_type)
									? getLocalBranchId()
									: params.branchId
							}
							onClose={() => setIsDailyItemSoldModalVisible(false)}
						/>
					)}
				</Spin>
			</Box>
		</Content>
	);
};

interface FilterProps {
	productCategories: IProductCategory[];
}

const Filter = ({ productCategories }: FilterProps) => {
	// STATES
	const [productOptions, setProductOptions] = useState([]);
	const [selectedProducts, setSelectedProducts] = useState([]);
	const [searchKeyword, setSearchKeyword] = useState('');

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
		data: { products },
		isFetching: isFetchingProducts,
		error: useProductsError,
	} = useProducts({
		params: { search: searchKeyword || undefined },
	});
	const {
		data: { products: paramProducts },
		isFetching: isFetchingParamProducts,
		error: useProductIdsError,
	} = useProducts({
		params: { ids: params?.productIds },
		options: { enabled: selectedProducts.length === 0 },
	});

	// METHODS
	useEffect(() => {
		setProductOptions(
			products.map((product) => ({
				label: product.name,
				value: product.id,
			})),
		);
	}, [products]);

	useEffect(() => {
		const productIds = _.toString(params.productIds)
			.split(',')
			.map((id) => Number(id));
		const options = paramProducts
			.filter((product) => productIds.includes(product.id))
			.map((product) => ({
				label: product.name,
				value: product.id,
			}));

		setSelectedProducts(options);
	}, [paramProducts]);

	const hasSetDefaultBranch = useRef(false);

	useEffect(() => {
		if (
			!hasSetDefaultBranch.current &&
			!params.branchId &&
			branches.length > 0 &&
			isUserFromOffice(user.user_type)
		) {
			setQueryParams({ branchId: branches[0].id }, { shouldResetPage: true });
			hasSetDefaultBranch.current = true;
		}
	}, [params.branchId, branches, user.user_type]);

	const handleSearchDebounced = useCallback(
		_.debounce((keyword) => {
			setProductOptions([]);
			setSearchKeyword(keyword.toLowerCase());
		}, SEARCH_DEBOUNCE_TIME),
		[params],
	);

	return (
		<>
			<RequestErrors
				errors={[
					...convertIntoArray(useProductsError, 'Products'),
					...convertIntoArray(useProductIdsError, 'Products'),
					...convertIntoArray(branchesError, 'Branches'),
				]}
				withSpaceBottom
			/>
			<Row className="pa-6" gutter={[16, 16]}>
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

				<Col lg={12} span={24}>
					<Label label="Product Name" spacing />
					<Select
						className="w-100"
						filterOption={false}
						mode="multiple"
						notFoundContent={
							isFetchingProducts || isFetchingParamProducts ? (
								<Spin size="small" />
							) : null
						}
						options={productOptions}
						value={selectedProducts}
						labelInValue
						onChange={(values) => {
							setSelectedProducts(values);
							setQueryParams(
								{ productIds: values.map(({ value }) => value).join(',') },
								{ shouldResetPage: true },
							);
						}}
						onSearch={handleSearchDebounced}
					/>
				</Col>

				<Col lg={12} span={24}>
					<Label label="Product Category" spacing />
					<Select
						className="w-100"
						defaultValue={params.productCategory}
						filterOption={filterOption}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ productCategory: value },
								{ shouldResetPage: true },
							);
						}}
					>
						{productCategories.map(({ name }) => (
							<Select.Option key={name} value={name}>
								{name}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col lg={12} span={24}>
					<Label label="Product Status" spacing />
					<Select
						className="w-100"
						filterOption={filterOption}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ productStatus: value },
								{ shouldResetPage: true },
							);
						}}
					>
						<Select.Option value={productStatus.AVAILABLE}>
							Available
						</Select.Option>
						<Select.Option value={productStatus.REORDER}>Reorder</Select.Option>
						<Select.Option value={productStatus.OUT_OF_STOCK}>
							Out of Stock
						</Select.Option>
					</Select>
				</Col>

				<Col lg={12} span={24}>
					<TimeRangeFilter />
				</Col>

				<Col lg={12} span={24}>
					<Label label="Show Sold In Branch" spacing />
					<Radio.Group
						defaultValue={params.isSoldInBranch}
						options={[
							{ label: 'Show All', value: ALL_OPTION_KEY },
							{ label: 'In Stock', value: '1' },
						]}
						optionType="button"
						value={params.isSoldInBranch || ALL_OPTION_KEY}
						onChange={(e) => {
							setQueryParams(
								{ isSoldInBranch: e.target.value },
								{ shouldResetPage: true },
							);
						}}
					/>
				</Col>

				<Col lg={12} span={24}>
					<Label label="Show has BO Balance" spacing />
					<Radio.Group
						defaultValue={null}
						options={[
							{ label: 'Show All', value: null },
							{ label: 'Has BO Balance', value: true },
						]}
						optionType="button"
						value={params.hasBoBalance}
						onChange={(e) => {
							setQueryParams(
								{ hasBoBalance: e.target.value },
								{ shouldResetPage: true },
							);
						}}
					/>
				</Col>

				<Col lg={12} span={24}>
					<Label label="Quantity Type" spacing />
					<Radio.Group
						defaultValue={null}
						options={[
							{ label: 'Piece', value: quantityTypes.PIECE },
							{ label: 'Bulk', value: quantityTypes.BULK },
						]}
						optionType="button"
						value={params.quantityType || quantityTypes.PIECE}
						onChange={(e) => {
							setQueryParams(
								{ quantityType: e.target.value },
								{ shouldResetPage: true },
							);
						}}
					/>
				</Col>
			</Row>
		</>
	);
};
