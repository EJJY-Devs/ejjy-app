import { Col, Row, Table, Select, DatePicker } from 'antd';
import { EyeFilled } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { Box, Label } from 'components/elements';
import { useBranches, useQueryParams, filterOption } from 'ejjy-global';
import { useProductCategories } from 'hooks';
import { DEFAULT_PAGE, MAX_PAGE_SIZE, appTypes } from 'global';
import { useUserStore } from 'stores';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { getLocalApiUrl, getLocalBranchId, getAppType } from 'utils';

import { TransactionProductsService } from 'services';
import { ViewUnsoldItemModal } from 'components/modals/ViewUnsoldItemModal';

interface UnsoldItemSummaryItem {
	productId: number;
	name: string;
	code: string;
	unitOfMeasurement: string;
	quantity: number;
	branch_product_id?: number;
	online_id: number;
}

interface TableRow {
	key: string;
	date: string;
	formattedDate: string;
	totalUnsoldProducts?: number;
	branchName?: string;
	branchId?: number;
	actions?: React.ReactElement;
}

const UnsoldItemReport = () => {
	// STATES
	const [dataSource, setDataSource] = useState<TableRow[]>([]);
	const [viewUnsoldItemModalVisible, setViewUnsoldItemModalVisible] = useState(
		false,
	);
	const [selectedUnsoldSummary, setSelectedUnsoldSummary] = useState<
		UnsoldItemSummaryItem[]
	>([]);
	const [selectedBranch, setSelectedBranch] = useState<any>(null);
	const [isLoadingTableData, setIsLoadingTableData] = useState(false);
	const [isLoadingModalData, setIsLoadingModalData] = useState(false);
	const [selectedReportDate, setSelectedReportDate] = useState<string>('');

	// Filter states
	const [selectedDateRangeFilter, setSelectedDateRangeFilter] = useState('');
	const [selectedProductCategory, setSelectedProductCategory] = useState('');
	const [selectedDate, setSelectedDate] = useState<Moment>(moment());
	const [selectedMonth, setSelectedMonth] = useState('');

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);

	const { data: branchesData } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
		},
	});

	// Initialize filters from URL params
	useEffect(() => {
		if (params.month && params.month !== selectedMonth) {
			setSelectedMonth(params.month as string);
		}
		if (params.dateRange && params.dateRange !== selectedDateRangeFilter) {
			setSelectedDateRangeFilter(params.dateRange as string);
		}
		if (
			params.productCategory &&
			params.productCategory !== selectedProductCategory
		) {
			setSelectedProductCategory(params.productCategory as string);
		}
		if (params.selectedDate) {
			const paramDate = moment(params.selectedDate as string);
			if (paramDate.isValid() && !paramDate.isSame(selectedDate, 'day')) {
				setSelectedDate(paramDate);
			}
		}
	}, [params]);

	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// Set default branch for head office users, or local branch for back office users
	useEffect(() => {
		if (getAppType() === appTypes.HEAD_OFFICE) {
			if (branchesData?.list?.length > 0) {
				const defaultBranchId = branchesData.list[0].id;
				setQueryParams(
					{ branchId: defaultBranchId },
					{ shouldResetPage: false },
				);
			}
		} else {
			// Back office: default to local branch
			const localBranchId = getLocalBranchId();
			if (localBranchId) {
				setQueryParams(
					{ branchId: Number(localBranchId) },
					{ shouldResetPage: false },
				);
			}
		}
	}, [user.user_type, branchesData?.list?.length]);

	const getColumns = (): ColumnsType<TableRow> => {
		const columns: ColumnsType<TableRow> = [
			{
				title: 'Date',
				dataIndex: 'formattedDate',
				width: 800,
			},
		];

		// Add Branch column for head office users
		if (getAppType() === appTypes.HEAD_OFFICE) {
			columns.push({
				title: 'Branch',
				dataIndex: 'branchName',
				render: (branchName: string) => branchName || 'All Branches',
				width: 500,
			});
		}

		// Add Total Unsold Products column
		columns.push({
			title: 'Total Unsold Products',
			dataIndex: 'totalUnsoldProducts',
			render: (total: number) => total?.toLocaleString() || '0',
			width: 500,
		});

		// Add Actions column
		columns.push({
			title: 'Actions',
			dataIndex: 'actions',
			render: (_, record: TableRow) => (
				<EyeFilled
					style={{ fontSize: '20px', cursor: 'pointer', color: '#00a143ff' }}
					onClick={() => handleDateClick(record.date, record.branchId, record)}
				/>
			),
			width: 400,
		});

		return columns;
	};

	// METHODS
	const getMonthDates = () => {
		if (selectedMonth) {
			// Parse the selected month (format: YYYY-MM)
			const [year, month] = selectedMonth.split('-').map(Number);
			const startDate = moment({ year, month: month - 1, day: 1 });
			const endDate = startDate.clone().endOf('month');

			// Generate all dates in the month
			const dates = [];
			const current = startDate.clone();
			while (current.isSameOrBefore(endDate, 'day')) {
				dates.push(current.format('YYYY-MM-DD'));
				current.add(1, 'day');
			}

			return {
				startDate: startDate.format('YYYY-MM-DD'),
				endDate: endDate.format('YYYY-MM-DD'),
				dates,
			};
		}
		return null;
	};

	const getDateRanges = () => {
		if (selectedDateRangeFilter === 'last3days') {
			// Last 3 days: from 3 days before selected date to 1 day before selected date
			const endDate = selectedDate.clone().subtract(1, 'day');
			const startDate = selectedDate.clone().subtract(3, 'days');
			return {
				startDate: startDate.format('YYYY-MM-DD'),
				endDate: endDate.format('YYYY-MM-DD'),
				dates: [
					startDate.format('YYYY-MM-DD'),
					startDate.clone().add(1, 'day').format('YYYY-MM-DD'),
					endDate.format('YYYY-MM-DD'),
				],
			};
		}
		if (selectedDateRangeFilter === 'last7days') {
			// Last 7 days: from 7 days before selected date to 1 day before selected date
			const endDate = selectedDate.clone().subtract(1, 'day');
			const startDate = selectedDate.clone().subtract(7, 'days');
			const dates = [];
			for (let i = 0; i < 7; i += 1) {
				dates.push(
					selectedDate
						.clone()
						.subtract(7 - i, 'days')
						.format('YYYY-MM-DD'),
				);
			}
			return {
				startDate: startDate.format('YYYY-MM-DD'),
				endDate: endDate.format('YYYY-MM-DD'),
				dates,
			};
		}

		return null;
	};

	const fetchMonthUnsoldProducts = async (month: string, branchId?: number) => {
		try {
			const response = await TransactionProductsService.getUnsoldSummary(
				{
					month,
					branch_id: branchId,
					product_category: selectedProductCategory || undefined,
					ordering: '-quantity',
				},
				getLocalApiUrl(),
			);

			const { data } = response;
			return data.map((item: any) => ({
				productId: item.product_id,
				name: item.print_details,
				code: item.code,
				unitOfMeasurement: item.unit_of_measurement,
				quantity: Number(item.quantity),
				branch_product_id: item.branch_product_id,
				online_id: item.online_id,
			}));
		} catch (error) {
			console.error('Error fetching month unsold products:', error);
			return [];
		}
	};

	const fetchAggregatedUnsoldProducts = async (
		dates: string[],
		branchId?: number,
	) => {
		try {
			const productAggregation: Record<number, UnsoldItemSummaryItem> = {};

			// Fetch data for each date and aggregate
			const promises = dates.map(async (date) => {
				const response = await TransactionProductsService.getUnsoldSummary(
					{
						date,
						branch_id: branchId,
						product_category: selectedProductCategory || undefined,
						ordering: '-quantity',
					},
					getLocalApiUrl(),
				);
				return response.data;
			});

			const results = await Promise.all(promises);

			// Aggregate all results
			results.forEach((dailyData) => {
				dailyData.forEach((item: any) => {
					const productId = item.product_id;
					if (!productAggregation[productId]) {
						productAggregation[productId] = {
							productId,
							name: item.print_details,
							code: item.code,
							unitOfMeasurement: item.unit_of_measurement,
							quantity: 0,
							branch_product_id: item.branch_product_id,
							online_id: item.online_id,
						};
					}
					productAggregation[productId].quantity += Number(item.quantity);
				});
			});

			// Sort by quantity in descending order (highest to lowest)
			return Object.values(productAggregation).sort(
				(a, b) => b.quantity - a.quantity,
			);
		} catch (error) {
			console.error('Error fetching aggregated unsold products:', error);
			return [];
		}
	};

	const fetchTotalUnsoldProducts = async (date: string, branchId?: number) => {
		try {
			const response = await TransactionProductsService.getUnsoldSummary(
				{
					date,
					branch_id: branchId,
					product_category: selectedProductCategory || undefined,
					ordering: '-quantity',
				},
				getLocalApiUrl(),
			);

			const { data } = response;
			// Count the number of different products, not the sum of quantities
			return data.length;
		} catch (error) {
			console.error(
				'Error fetching total unsold products for date:',
				date,
				error,
			);
			return 0;
		}
	};

	const handleDateClick = async (
		date: string,
		branchId?: number,
		record?: TableRow,
	) => {
		// Open modal immediately and start loading
		setIsLoadingModalData(true);
		setViewUnsoldItemModalVisible(true);
		setSelectedUnsoldSummary([]); // Clear previous data
		// Always use formattedDate from record, which is already a proper string
		const reportDateString = String(record?.formattedDate || 'N/A');
		setSelectedReportDate(reportDateString);
		try {
			// Set the selected branch first (for immediate display)
			if (getAppType() === appTypes.HEAD_OFFICE) {
				if (record?.branchId) {
					// Head office user clicked on a specific branch row
					const branch = (branchesData as any)?.list?.find(
						(b: any) => b.id === record.branchId,
					);
					setSelectedBranch(branch || null);
				} else if (params?.branchId) {
					// Head office user has a specific branch selected
					const branch = (branchesData as any)?.list?.find(
						(b: any) => b.id === Number(params.branchId),
					);
					setSelectedBranch(branch || null);
				} else {
					// Head office user with no specific branch - should not happen with new logic
					setSelectedBranch(null);
				}
			} else {
				// Branch user - get their local branch
				const localBranchId = getLocalBranchId();
				const branch = (branchesData as any)?.list?.find(
					(b: any) => b.id === Number(localBranchId),
				);
				setSelectedBranch(branch || null);
			}

			let products: UnsoldItemSummaryItem[] = [];

			// Check if this is a month filter result
			if (selectedMonth && date.includes('-')) {
				const effectiveBranchId =
					branchId || (params?.branchId ? Number(params.branchId) : undefined);
				products = await fetchMonthUnsoldProducts(
					selectedMonth,
					effectiveBranchId,
				);
			} else if (selectedDateRangeFilter && date.includes('-')) {
				// This is a date range - fetch aggregated data
				const dateRanges = getDateRanges();
				if (dateRanges) {
					const effectiveBranchId =
						branchId ||
						(params?.branchId ? Number(params.branchId) : undefined);
					products = await fetchAggregatedUnsoldProducts(
						dateRanges.dates,
						effectiveBranchId,
					);
				}
			} else {
				// This is a single date - use the original logic
				const effectiveBranchId =
					branchId || (params?.branchId ? Number(params.branchId) : undefined);
				const response = await TransactionProductsService.getUnsoldSummary(
					{
						date,
						branch_id: effectiveBranchId,
						product_category: selectedProductCategory || undefined,
						ordering: '-quantity', // Sort by quantity in descending order
					},
					getLocalApiUrl(),
				);

				const { data } = response;

				products = data.map((item: any) => ({
					productId: item.product_id,
					name: item.print_details,
					code: item.code,
					unitOfMeasurement: item.unit_of_measurement,
					quantity: Number(item.quantity),
					branch_product_id: item.branch_product_id,
					online_id: item.online_id,
				}));
			}
			setSelectedUnsoldSummary(products);
			setIsLoadingModalData(false);
		} catch (error) {
			console.error('Error fetching unsold products for date:', error);
			// End loading on error
			setIsLoadingModalData(false);
		}
	};

	const handleViewUnsoldItemModalClose = () => {
		setViewUnsoldItemModalVisible(false);
		setSelectedUnsoldSummary([]);
		setSelectedBranch(null);
		setIsLoadingModalData(false);
	};

	useEffect(() => {
		const loadData = async () => {
			setIsLoadingTableData(true);

			try {
				// Handle month filtering first (highest priority)
				if (selectedMonth) {
					const monthDates = getMonthDates();
					if (!monthDates) {
						setDataSource([]);
						return;
					}

					const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

					// For head office users, wait for branches data to be loaded
					if (isHeadOffice && !branchesData?.list) {
						console.log(
							'Head office user - waiting for branches data to load...',
						);
						return;
					}

					const data: TableRow[] = [];

					if (isHeadOffice && !params?.branchId) {
						// Head office user without specific branch selected - show all branches
						const branches = (branchesData as any)?.list || [];

						const promises = branches.map(async (branch: any) => {
							const monthProducts = await fetchMonthUnsoldProducts(
								selectedMonth,
								branch.id,
							);
							const totalProductsCount = monthProducts.length;

							console.log('monthProducts', monthProducts);

							if (totalProductsCount > 0) {
								console.log(totalProductsCount);
								return {
									key: `${selectedMonth}-${branch.id}`,
									date: `${monthDates.startDate}-${monthDates.endDate}`,
									formattedDate: String(
										`${moment(monthDates.startDate).format('MMMM YYYY')}`,
									),
									totalUnsoldProducts: totalProductsCount,
									branchName: branch.name,
									branchId: branch.id,
								};
							}
							return null;
						});

						const results = await Promise.all(promises);
						data.push(...results.filter((item) => item !== null));
					} else {
						// Branch user or head office user with specific branch selected
						const branchId =
							getAppType() === appTypes.BACK_OFFICE
								? getLocalBranchId()
								: params?.branchId;

						const branchName =
							isHeadOffice && branchId
								? (branchesData as any)?.list?.find(
										(b: any) => b.id === Number(branchId),
								  )?.name
								: undefined;

						const monthProducts = await fetchMonthUnsoldProducts(
							selectedMonth,
							branchId ? Number(branchId) : undefined,
						);

						console.log('monthProducts', monthProducts);

						const totalProductsCount = monthProducts.length;

						if (totalProductsCount > 0) {
							data.push({
								key: selectedMonth,
								date: `${monthDates.startDate}-${monthDates.endDate}`,
								formattedDate: String(
									`${moment(monthDates.startDate).format('MMMM YYYY')}`,
								),
								totalUnsoldProducts: totalProductsCount,
								branchName,
								branchId: branchId ? Number(branchId) : undefined,
							});
						}
					}

					console.log('data', data);

					setDataSource(data);
					return;
				}

				// Handle date range filtering
				if (selectedDateRangeFilter) {
					const dateRanges = getDateRanges();
					if (!dateRanges) {
						setDataSource([]);
						return;
					}

					const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

					// For head office users, wait for branches data to be loaded
					if (isHeadOffice && !branchesData?.list) {
						console.log(
							'Head office user - waiting for branches data to load...',
						);
						return;
					}

					const data: TableRow[] = [];

					if (isHeadOffice && !params?.branchId) {
						// Head office user without specific branch selected - show all branches
						const branches = (branchesData as any)?.list || [];

						const promises = branches.map(async (branch: any) => {
							const aggregatedProducts = await fetchAggregatedUnsoldProducts(
								dateRanges.dates,
								branch.id,
							);
							const totalProductsCount = aggregatedProducts.length;

							if (totalProductsCount > 0) {
								return {
									key: `${selectedDateRangeFilter}-${branch.id}`,
									date: `${dateRanges.startDate}-${dateRanges.endDate}`,
									formattedDate: String(
										`${moment(dateRanges.startDate).format(
											'M/D/YY',
										)} - ${moment(dateRanges.endDate).format('M/D/YY')}`,
									),
									totalUnsoldProducts: totalProductsCount,
									branchName: branch.name,
									branchId: branch.id,
								};
							}
							return null;
						});

						const results = await Promise.all(promises);
						data.push(...results.filter((item) => item !== null));
					} else {
						// Branch user or head office user with specific branch selected
						const branchId = getAppType() === appTypes.BACK_OFFICE;
						const branchName =
							isHeadOffice && branchId
								? (branchesData as any)?.list?.find(
										(b: any) => b.id === Number(branchId),
								  )?.name
								: undefined;

						const aggregatedProducts = await fetchAggregatedUnsoldProducts(
							dateRanges.dates,
							branchId ? Number(branchId) : undefined,
						);

						const totalProductsCount = aggregatedProducts.length;

						if (totalProductsCount > 0) {
							data.push({
								key: selectedDateRangeFilter,
								date: `${dateRanges.startDate}-${dateRanges.endDate}`,
								formattedDate: String(
									`${moment(dateRanges.startDate).format('M/D/YY')} to ${moment(
										dateRanges.endDate,
									).format('M/D/YY')}`,
								),
								totalUnsoldProducts: totalProductsCount,
								branchName,
								branchId: branchId ? Number(branchId) : undefined,
							});
						}
					}

					setDataSource(data);
					return;
				}

				// Handle single date selection from calendar
				const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;
				const selectedDateString = selectedDate.format('YYYY-MM-DD');

				// For head office users, wait for branches data to be loaded
				if (isHeadOffice && !branchesData?.list) {
					console.log(
						'Head office user - waiting for branches data to load...',
					);
					return;
				}

				const data: TableRow[] = [];

				if (isHeadOffice && !params?.branchId) {
					// Head office user without specific branch selected - show all branches
					const branches = (branchesData as any)?.list || [];

					const promises = branches.map(async (branch: any) => {
						const totalUnsoldProducts = await fetchTotalUnsoldProducts(
							selectedDateString,
							branch.id,
						);
						if (totalUnsoldProducts > 0) {
							return {
								key: `${selectedDateString}-${branch.id}`,
								date: selectedDateString,
								formattedDate: String(selectedDate.format('MM/DD/YYYY')),
								totalUnsoldProducts,
								branchName: branch.name,
								branchId: branch.id,
							};
						}
						return null;
					});

					const results = await Promise.all(promises);
					data.push(...results.filter((item) => item !== null));
				} else {
					// Branch user or head office user with specific branch selected
					const branchId =
						getAppType() === appTypes.BACK_OFFICE
							? getLocalBranchId()
							: params?.branchId;

					const branchName =
						isHeadOffice && branchId
							? (branchesData as any)?.list?.find(
									(b: any) => b.id === Number(branchId),
							  )?.name
							: undefined;

					const totalUnsoldProducts = await fetchTotalUnsoldProducts(
						selectedDateString,
						branchId ? Number(branchId) : undefined,
					);

					if (totalUnsoldProducts > 0) {
						data.push({
							key: selectedDateString,
							date: selectedDateString,
							formattedDate: String(selectedDate.format('MM/DD/YYYY')),
							totalUnsoldProducts,
							branchName,
							branchId: branchId ? Number(branchId) : undefined,
						});
					}
				}

				setDataSource(data);
			} catch (error) {
				console.error('Error loading table data:', error);
			} finally {
				setIsLoadingTableData(false);
			}
		};

		loadData();
	}, [
		selectedDate,
		selectedDateRangeFilter,
		selectedMonth,
		user.user_type,
		params?.branchId,
		branchesData?.list?.length,
		selectedProductCategory,
	]);

	return (
		<Box>
			<br />

			{/* All filters in one row */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col span={6}>
					<Label label="Select Date" spacing />
					<DatePicker
						className="w-100"
						disabled={!!selectedMonth}
						value={selectedDate}
						onChange={(date: Moment | null) => {
							if (date) {
								setSelectedDate(date);
								// Clear month filter when date is selected
								setSelectedMonth('');
								setQueryParams(
									{
										selectedDate: date.format('YYYY-MM-DD'),
										month: undefined,
									},
									{ shouldResetPage: true },
								);
							}
						}}
					/>
				</Col>
				<Col span={6}>
					<Label label="Date Range" spacing />
					<Select
						className="w-100"
						disabled={!!selectedMonth}
						placeholder="Select Date Range"
						value={selectedDateRangeFilter || undefined}
						allowClear
						onChange={(value) => {
							setSelectedDateRangeFilter(value || '');
							// Clear month filter when date range is selected
							if (value) {
								setSelectedMonth('');
								setQueryParams(
									{
										dateRange: value,
										month: undefined,
									},
									{ shouldResetPage: true },
								);
							} else {
								setQueryParams(
									{ dateRange: undefined },
									{ shouldResetPage: true },
								);
							}
						}}
					>
						<Select.Option value="last3days">Last 3 Days</Select.Option>
						<Select.Option value="last7days">Last 7 Days</Select.Option>
					</Select>
				</Col>
				<Col span={6}>
					<Label label="Month" spacing />
					<DatePicker.MonthPicker
						className="w-100"
						format="MMMM YYYY"
						placeholder="Select Month"
						value={selectedMonth ? moment(selectedMonth) : undefined}
						allowClear
						onChange={(date) => {
							const monthValue = date ? date.format('YYYY-MM') : '';
							setSelectedMonth(monthValue);
							// Update URL params and clear other date filters when month is selected
							if (monthValue) {
								setSelectedDateRangeFilter('');
								setQueryParams(
									{
										month: monthValue,
										dateRange: undefined,
										selectedDate: undefined,
									},
									{ shouldResetPage: true },
								);
							} else {
								setQueryParams({ month: undefined }, { shouldResetPage: true });
							}
						}}
					/>
				</Col>
				<Col span={6}>
					<Label label="Product Category" spacing />
					<Select
						className="w-100"
						disabled={isFetchingProductCategories}
						filterOption={filterOption}
						optionFilterProp="children"
						placeholder="Select Category"
						value={selectedProductCategory || undefined}
						allowClear
						showSearch
						onChange={(value) => {
							setSelectedProductCategory(value || '');
							setQueryParams(
								{ productCategory: value || undefined },
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
				<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
					<Col span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							disabled={isLoadingTableData}
							filterOption={filterOption}
							optionFilterProp="children"
							placeholder="Select Branch"
							value={
								params.branchId && !Number.isNaN(Number(params.branchId))
									? Number(params.branchId)
									: undefined
							}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams({ branchId: value }, { shouldResetPage: true });
							}}
						>
							{(branchesData as any)?.list?.map(({ id, name }) => (
								<Select.Option key={id} value={id}>
									{name}
								</Select.Option>
							))}
						</Select>
					</Col>
				</Row>
			)}

			<Table
				columns={getColumns()}
				dataSource={dataSource}
				loading={isLoadingTableData}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: dataSource.length,
					pageSize: 10,
					onChange: (page) => setQueryParams({ page }),
					position: ['bottomCenter'],
					showSizeChanger: false,
				}}
			/>

			{viewUnsoldItemModalVisible && (
				<ViewUnsoldItemModal
					branch={selectedBranch}
					loading={isLoadingModalData}
					reportDate={selectedReportDate}
					unsoldItemSummary={selectedUnsoldSummary}
					onClose={handleViewUnsoldItemModalClose}
				/>
			)}
		</Box>
	);
};

export default UnsoldItemReport;
