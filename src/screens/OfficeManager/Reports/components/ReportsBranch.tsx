/* eslint-disable no-mixed-spaces-and-tabs */
import { Col, DatePicker, Radio, Row, Select, Spin, Table } from 'antd';
import { ColumnsType, SorterResult } from 'antd/lib/table/interface';
import { isEmpty, toString } from 'lodash';
import debounce from 'lodash/debounce';
import moment from 'moment';
import * as queryString from 'query-string';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TableActions } from '../../../../components';
import { Label } from '../../../../components/elements';
import { RequestErrors } from '../../../../components/RequestErrors/RequestErrors';
import { RequestWarnings } from '../../../../components/RequestWarnings/RequestWarnings';
import { ALL_OPTION_KEY } from '../../../../global/constants';
import { pageSizeOptions } from '../../../../global/options';
import { request, timeRangeTypes } from '../../../../global/types';
import { useBranchProducts } from '../../../../hooks/useBranchProducts';
import { useProducts } from '../../../../hooks/useProducts';
import { useQueryParams } from '../../../../hooks/useQueryParams';
import { IProductCategory } from '../../../../models';
import {
	convertIntoArray,
	formatQuantity,
	getBranchProductStatus,
} from '../../../../utils/function';
import { EditBranchProductsModal } from './BranchProducts/EditBranchProductsModal';

const columns: ColumnsType = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		width: 150,
		fixed: 'left',
	},
	{
		title: 'Barcode',
		dataIndex: 'barcode',
		key: 'barcode',
	},
	{
		title: 'Balance',
		dataIndex: 'balance',
		key: 'balance',
		align: 'center',
		sorter: true,
	},
	{
		title: 'Remaining Bal',
		dataIndex: 'remaining_balance',
		key: 'remaining_balance',
		align: 'center',
	},
	{
		title: 'Quantity Sold',
		dataIndex: 'quantity_sold',
		key: 'quantity_sold',
		align: 'center',
		sorter: true,
	},
	{
		title: 'Daily Average Sold',
		dataIndex: 'daily_average_sold',
		key: 'daily_average_sold',
		align: 'center',
		sorter: true,
	},
	{
		title: 'Average Quantity Sold Percentage',
		dataIndex: 'daily_average_sold_percentage',
		key: 'daily_average_sold_percentage',
		align: 'center',
		sorter: true,
	},
	{
		title: 'Average Daily Consumption',
		dataIndex: 'average_daily_consumption',
		key: 'average_daily_consumption',
		align: 'center',
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
	},
	{
		title: 'Actions',
		dataIndex: 'actions',
		key: 'actions',
	},
];

const INTERVAL_MS = 30000;
const SEARCH_DEBOUNCE_TIME = 1000;

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

interface Props {
	branchId: number;
	productCategories: IProductCategory[];
	isActive: boolean;
}

export const ReportsBranch = ({
	isActive,
	branchId,
	productCategories,
}: Props) => {
	// STATES
	const [data, setData] = useState([]);
	const [isCompletedInitialFetch, setIsCompletedInitialFetch] = useState(false);
	const [selectedBranchProduct, setSelectedBranchProduct] = useState(null);

	// CUSTOM HOOKS
	const history = useHistory();
	const {
		branchProducts,
		pageCount,
		pageSize,
		currentPage,
		getBranchProductsWithAnalytics,
		status: branchProductsStatus,
		errors,
		warnings,
	} = useBranchProducts();

	const { refreshList, setQueryParams } = useQueryParams({
		page: currentPage,
		pageSize,
		onQueryParamChange: (params) => {
			if (isActive) {
				const newData = {
					...params,
					productIds:
						params?.productIds?.length > 0 ? params.productIds : undefined,
					isSoldInBranch:
						params?.isSoldInBranch === ALL_OPTION_KEY || !params?.isSoldInBranch
							? undefined
							: true,
				};

				getBranchProductsWithAnalytics(newData, true);

				clearInterval(intervalRef.current);
				intervalRef.current = setInterval(() => {
					getBranchProductsWithAnalytics(newData, true);
				}, INTERVAL_MS);
			}
		},
	});

	// REFS
	const intervalRef = useRef(null);

	// METHODS
	useEffect(
		() => () => {
			// Cleanup in case logged out due to single sign on
			clearInterval(intervalRef.current);
		},
		[],
	);

	useEffect(() => {
		const params = queryString.parse(history.location.search);
		const ordering = toString(params.ordering);

		switch (ordering) {
			case sorts.CURRENT_BALANCE_ASC:
				columns[2].sortOrder = 'ascend';
				break;
			case sorts.CURRENT_BALANCE_DES:
				columns[2].sortOrder = 'descend';
				break;
			case sorts.QUANTITY_SOLD_ASC:
				columns[4].sortOrder = 'ascend';
				break;
			case sorts.QUANTITY_SOLD_DES:
				columns[4].sortOrder = 'descend';
				break;
			case sorts.DAILY_AVERAGE_SOLD_ASC:
				columns[5].sortOrder = 'ascend';
				break;
			case sorts.DAILY_AVERAGE_SOLD_DES:
				columns[5].sortOrder = 'descend';
				break;
			case sorts.DAILY_AVERAGE_SOLD_PERCENTAGE_ASC:
				columns[6].sortOrder = 'ascend';
				break;
			case sorts.DAILY_AVERAGE_SOLD_PERCENTAGE_DES:
				columns[6].sortOrder = 'descend';
				break;
			default:
			// Do nothing
		}
	}, []);

	useEffect(() => {
		if (!isActive) {
			clearInterval(intervalRef.current);
		}
	}, [isActive]);

	useEffect(() => {
		if (!isCompletedInitialFetch && branchProducts.length) {
			setIsCompletedInitialFetch(true);
		}

		const newBranchProducts = branchProducts?.map((branchProduct) => {
			const {
				product,
				max_balance,
				current_balance,
				product_status,
				quantity_sold,
				daily_average_sold,
				daily_average_sold_percentage,
				average_daily_consumption,
			} = branchProduct;
			const { barcode, name, textcode, unit_of_measurement } = product;
			const remainingBalance =
				(Number(current_balance) / Number(max_balance)) * 100;

			const currentBalance = formatQuantity(
				unit_of_measurement,
				current_balance,
			);

			const quantitySold = formatQuantity(unit_of_measurement, quantity_sold);

			const maxBalance = formatQuantity(unit_of_measurement, max_balance);

			return {
				barcode: barcode || textcode,
				name,
				balance: `${currentBalance} / ${maxBalance}`,
				remaining_balance: `${remainingBalance.toFixed(2)}%`,
				quantity_sold: quantitySold,
				daily_average_sold,
				daily_average_sold_percentage: `${daily_average_sold_percentage}%`,
				average_daily_consumption: formatQuantity(
					unit_of_measurement,
					average_daily_consumption,
				),
				status: getBranchProductStatus(product_status),
				actions: (
					<TableActions
						onEdit={() => {
							setSelectedBranchProduct(branchProduct);
						}}
					/>
				),
			};
		});

		setData(newBranchProducts);
	}, [branchProducts]);

	return (
		<div className="ReportsBranch">
			<RequestErrors
				errors={convertIntoArray(errors, 'Branch Product')}
				withSpaceBottom
			/>

			<RequestWarnings
				warnings={convertIntoArray(warnings, 'Branch Product')}
				withSpaceBottom
			/>

			<Filter
				productCategories={productCategories}
				setQueryParams={(params, shouldResetPage) => {
					setIsCompletedInitialFetch(false);
					setQueryParams(params, shouldResetPage);
				}}
			/>

			<Table
				className="ReportsBranch_table TableNoPadding"
				columns={columns}
				dataSource={data}
				scroll={{ x: 1400 }}
				pagination={{
					current: currentPage,
					total: pageCount,
					pageSize,
					position: ['bottomCenter'],
					onChange: (page, newPageSize) => {
						setQueryParams({
							page,
							pageSize: newPageSize,
						});
					},
					disabled: !data,
					pageSizeOptions,
				}}
				onChange={(_pagination, _filters, sorter: SorterResult<any>, extra) => {
					if (extra.action === 'sort') {
						columns[2].sortOrder = null;
						columns[4].sortOrder = null;
						columns[5].sortOrder = null;
						columns[6].sortOrder = null;
						// eslint-disable-next-line no-param-reassign
						sorter.column.sortOrder = sorter.order;

						setIsCompletedInitialFetch(false);
						setQueryParams({
							ordering: getSortOrder(sorter.columnKey, sorter.order),
						});
					}
				}}
				loading={
					isCompletedInitialFetch
						? false
						: branchProductsStatus === request.REQUESTING
				}
			/>

			{selectedBranchProduct && (
				<EditBranchProductsModal
					branchId={branchId}
					branchProduct={selectedBranchProduct}
					onSuccess={refreshList}
					onClose={() => setSelectedBranchProduct(false)}
				/>
			)}
		</div>
	);
};

interface FilterProps {
	productCategories: IProductCategory[];
	setQueryParams: any;
}

const Filter = ({ productCategories, setQueryParams }: FilterProps) => {
	// STATES
	const [productOptions, setProductOptions] = useState([]);
	const [isTimeRange, setIsTimeRange] = useState(false);
	const [isDefaultProductFetched, setIsDefaultProductFetched] = useState(false);
	const [selectedProducts, setSelectedProducts] = useState([]);

	// CUSTOM HOOKS
	const history = useHistory();
	const params = queryString.parse(history.location.search);
	const { products, getProducts, status: productsStatus } = useProducts();

	// METHODS
	useEffect(() => {
		getProducts(
			{
				ids: params?.productIds,
				page: 1,
				pageSize: 10,
			},
			true,
		);

		const newParams = {};

		const timeRange = toString(params.timeRange);
		if (!timeRange) {
			// eslint-disable-next-line dot-notation
			newParams['timeRange'] = timeRangeTypes.DAILY;
		} else if (timeRange?.includes(',')) {
			setIsTimeRange(true);
		}

		const isSoldInBranch = toString(params.isSoldInBranch);
		if (!isSoldInBranch) {
			// eslint-disable-next-line dot-notation
			newParams['isSoldInBranch'] = '1';
		}

		if (!isEmpty(newParams)) {
			setQueryParams({ ...newParams, ...params });
		}
	}, []);

	useEffect(() => {
		setProductOptions(
			products.map((product) => ({
				label: product.name,
				value: product.id,
			})),
		);

		if (!isDefaultProductFetched) {
			const productIds = toString(params.productIds)
				.split(',')
				.map((x) => Number(x));
			const options = products
				.filter((product) => productIds.includes(product.id))
				.map((product) => ({
					label: product.name,
					value: product.id,
				}));

			setSelectedProducts(options);

			// Only set default product fetched true if exact same length;
			if (options.length === productIds.length) {
				setIsDefaultProductFetched(true);
			}
		}
	}, [products]);

	const onSearchDebounced = useCallback(
		debounce((keyword) => {
			setProductOptions([]);

			getProducts(
				{ search: keyword.toLowerCase(), page: 1, pageSize: 25 },
				true,
			);
		}, SEARCH_DEBOUNCE_TIME),
		[params],
	);

	return (
		<Row gutter={[15, 15]}>
			<Col lg={12} span={24}>
				<Label label="Product Name" spacing />
				<Select
					mode="multiple"
					style={{ width: '100%' }}
					filterOption={false}
					onSearch={onSearchDebounced}
					notFoundContent={
						productsStatus === request.REQUESTING ? <Spin size="small" /> : null
					}
					options={productOptions}
					value={selectedProducts}
					onChange={(values) => {
						setSelectedProducts(values);

						setQueryParams(
							{ productIds: values.map(({ value }) => value).join(',') },
							true,
						);
					}}
					labelInValue
				/>
			</Col>
			<Col lg={12} span={24}>
				<Label label="Product Category" spacing />
				<Select
					style={{ width: '100%' }}
					defaultValue={params.productCategory}
					onChange={(value) => {
						setQueryParams({ productCategory: value }, true);
					}}
					allowClear
				>
					{productCategories.map(({ name }) => (
						<Select.Option value={name}>{name}</Select.Option>
					))}
				</Select>
			</Col>
			<Col lg={12} span={24}>
				<Label label="Quantity Sold Date" spacing />
				<Radio.Group
					options={[
						{ label: 'Daily', value: timeRangeTypes.DAILY },
						{ label: 'Monthly', value: timeRangeTypes.MONTHLY },
						{
							label: 'Select Date Range',
							value: timeRangeTypes.DATE_RANGE,
						},
					]}
					onChange={(e) => {
						const { value } = e.target;

						if (value !== timeRangeTypes.DATE_RANGE) {
							setQueryParams({ timeRange: value }, true);
						} else {
							setIsTimeRange(true);
						}
					}}
					defaultValue={(() => {
						const timeRange = toString(params.timeRange);

						if (
							[timeRangeTypes.DAILY, timeRangeTypes.MONTHLY].includes(timeRange)
						) {
							return timeRange;
						}

						if (timeRange?.indexOf(',')) {
							return timeRangeTypes.DATE_RANGE;
						}

						return timeRangeTypes.DAILY;
					})()}
					optionType="button"
				/>
				{isTimeRange && (
					<DatePicker.RangePicker
						format="MM/DD/YY"
						onCalendarChange={(dates, dateStrings) => {
							if (dates?.[0] && dates?.[1]) {
								setQueryParams({ timeRange: dateStrings.join(',') }, true);
							}
						}}
						defaultValue={
							toString(params.timeRange).split(',')?.length === 2
								? [
										moment(toString(params.timeRange).split(',')[0]),
										moment(toString(params.timeRange).split(',')[1]),
								  ]
								: undefined
						}
						defaultPickerValue={
							toString(params.timeRange).split(',')?.length === 2
								? [
										moment(toString(params.timeRange).split(',')[0]),
										moment(toString(params.timeRange).split(',')[1]),
								  ]
								: undefined
						}
					/>
				)}
			</Col>
			<Col lg={12} span={24}>
				<Label label="Show Sold In Branch" spacing />
				<Radio.Group
					options={[
						{ label: 'Show All', value: ALL_OPTION_KEY },
						{ label: 'In Stock', value: '1' },
					]}
					value={params.isSoldInBranch}
					onChange={(e) => {
						setQueryParams({ isSoldInBranch: e.target.value }, true);
					}}
					// eslint-disable-next-line react/jsx-boolean-value
					defaultValue={params.isSoldInBranch}
					optionType="button"
				/>
			</Col>
		</Row>
	);
};
