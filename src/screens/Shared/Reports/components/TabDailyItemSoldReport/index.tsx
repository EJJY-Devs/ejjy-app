import { Col, Row, Table, Typography, Select, DatePicker } from 'antd';
import { EyeFilled } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { Box, Label } from 'components/elements';
import {
	ViewDailyItemSoldModal,
	useBranches,
	useQueryParams,
	filterOption,
} from 'ejjy-global';
import { useProductCategories } from 'hooks';
import { DEFAULT_PAGE, MAX_PAGE_SIZE } from 'global';
import { useUserStore } from 'stores';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import {
	getLocalApiUrl,
	getLocalBranchId,
	isUserFromBranch,
	isUserFromOffice,
} from 'utils';
import { TransactionProductsService } from 'services';

interface DailyItemSoldSummaryItem {
	productId: number;
	name: string;
	code: string;
	unitOfMeasurement: string;
	quantity: number;
}

interface TableRow {
	key: string;
	date: string;
	formattedDate: string;
	totalProductsSold?: number;
	branchName?: string;
	branchId?: number;
	actions?: React.ReactElement;
}

const DailyItemSoldReport = () => {
	// STATES
	const [dataSource, setDataSource] = useState<TableRow[]>([]);
	const [
		viewDailyItemSoldModalVisible,
		setViewDailyItemSoldModalVisible,
	] = useState(false);
	const [selectedDailySummary, setSelectedDailySummary] = useState<
		DailyItemSoldSummaryItem[]
	>([]);
	const [selectedBranch, setSelectedBranch] = useState<any>(null);
	const [isLoadingTableData, setIsLoadingTableData] = useState(false);
	const [isLoadingModalData, setIsLoadingModalData] = useState(false);
	const [selectedReportDate, setSelectedReportDate] = useState<string>('');

	// Filter states
	const [selectedDateRangeFilter, setSelectedDateRangeFilter] = useState('');
	const [selectedProductCategory, setSelectedProductCategory] = useState('');
	const [selectedDate, setSelectedDate] = useState<Moment>(moment());

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

	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	const getColumns = (): ColumnsType<TableRow> => {
		const columns: ColumnsType<TableRow> = [
			{
				title: 'Date',
				dataIndex: 'formattedDate',
				width: 800,
			},
		];

		// Add Branch column for head office users
		if (isUserFromOffice(user.user_type)) {
			columns.push({
				title: 'Branch',
				dataIndex: 'branchName',
				render: (branchName: string) => branchName || 'All Branches',
				width: 500,
			});
		}

		// Add Total Products Sold column
		columns.push({
			title: 'Total Products Sold',
			dataIndex: 'totalProductsSold',
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

	const fetchAggregatedProductsSold = async (
		dates: string[],
		branchId?: number,
	) => {
		try {
			const productAggregation: Record<number, DailyItemSoldSummaryItem> = {};

			// Fetch data for each date and aggregate
			const promises = dates.map(async (date) => {
				const response = await TransactionProductsService.getDailySummary(
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
							name: item.name,
							code: item.code,
							unitOfMeasurement: item.unit_of_measurement,
							quantity: 0,
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
			console.error('Error fetching aggregated products sold:', error);
			return [];
		}
	};

	const fetchTotalProductsSold = async (date: string, branchId?: number) => {
		try {
			const response = await TransactionProductsService.getDailySummary(
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
				'Error fetching total products sold for date:',
				date,
				error,
			);
			return 0;
		}
	};

	useEffect(() => {
		const loadData = async () => {
			setIsLoadingTableData(true);

			try {
				// Handle date range filtering first
				if (selectedDateRangeFilter) {
					const dateRanges = getDateRanges();
					if (!dateRanges) {
						setDataSource([]);
						return;
					}

					const isHeadOffice = isUserFromOffice(user.user_type);

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
							const aggregatedProducts = await fetchAggregatedProductsSold(
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
									totalProductsSold: totalProductsCount,
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
						const branchId = isUserFromBranch(user.user_type)
							? getLocalBranchId()
							: params?.branchId;

						const branchName =
							isHeadOffice && branchId
								? (branchesData as any)?.list?.find(
										(b: any) => b.id === Number(branchId),
								  )?.name
								: undefined;

						const aggregatedProducts = await fetchAggregatedProductsSold(
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
								totalProductsSold: totalProductsCount,
								branchName,
								branchId: branchId ? Number(branchId) : undefined,
							});
						}
					}

					setDataSource(data);
					return;
				}

				// Handle single date selection from calendar
				const isHeadOffice = isUserFromOffice(user.user_type);
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
						const totalProductsSold = await fetchTotalProductsSold(
							selectedDateString,
							branch.id,
						);
						if (totalProductsSold > 0) {
							return {
								key: `${selectedDateString}-${branch.id}`,
								date: selectedDateString,
								formattedDate: String(selectedDate.format('MM/DD/YYYY')),
								totalProductsSold,
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
					const branchId = isUserFromBranch(user.user_type)
						? getLocalBranchId()
						: params?.branchId;

					const branchName =
						isHeadOffice && branchId
							? (branchesData as any)?.list?.find(
									(b: any) => b.id === Number(branchId),
							  )?.name
							: undefined;

					const totalProductsSold = await fetchTotalProductsSold(
						selectedDateString,
						branchId ? Number(branchId) : undefined,
					);

					if (totalProductsSold > 0) {
						data.push({
							key: selectedDateString,
							date: selectedDateString,
							formattedDate: String(selectedDate.format('MM/DD/YYYY')),
							totalProductsSold,
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
		user.user_type,
		params?.branchId,
		branchesData?.list?.length,
		selectedProductCategory,
	]);

	// Handle date click to open modal with products for that date
	const handleDateClick = async (
		date: string,
		branchId?: number,
		record?: TableRow,
	) => {
		// Open modal immediately and start loading
		setIsLoadingModalData(true);
		setViewDailyItemSoldModalVisible(true);
		setSelectedDailySummary([]); // Clear previous data
		// Always use formattedDate from record, which is already a proper string
		const reportDateString = String(record?.formattedDate || 'N/A');
		setSelectedReportDate(reportDateString);

		try {
			// Set the selected branch first (for immediate display)
			if (isUserFromOffice(user.user_type)) {
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

			let products: DailyItemSoldSummaryItem[] = [];

			// Check if this is a date range filter result
			if (selectedDateRangeFilter && date.includes('-')) {
				// This is a date range - fetch aggregated data
				const dateRanges = getDateRanges();
				if (dateRanges) {
					products = await fetchAggregatedProductsSold(
						dateRanges.dates,
						!isUserFromBranch(user.user_type) && (branchId || params?.branchId)
							? branchId || Number(params.branchId as string | number)
							: undefined,
					);
				}
			} else {
				// This is a single date - use the original logic
				const response = await TransactionProductsService.getDailySummary(
					{
						date,
						branch_id:
							!isUserFromBranch(user.user_type) &&
							(branchId || params?.branchId)
								? branchId || Number(params.branchId as string | number)
								: undefined,
						product_category: selectedProductCategory || undefined,
						ordering: '-quantity', // Sort by quantity in descending order
					},
					getLocalApiUrl(),
				);

				const { data } = response;

				products = data.map((item: any) => ({
					productId: item.product_id,
					name: item.name,
					code: item.code,
					unitOfMeasurement: item.unit_of_measurement,
					quantity: Number(item.quantity),
				}));
			}

			setSelectedDailySummary(products);
			setIsLoadingModalData(false);
		} catch (error) {
			console.error('Error fetching products for date:', error);
			// End loading on error
			setIsLoadingModalData(false);
		}
	};

	const handleViewDailyItemSoldModalClose = () => {
		setViewDailyItemSoldModalVisible(false);
		setSelectedDailySummary([]);
		setSelectedBranch(null);
		setIsLoadingModalData(false);
	};

	return (
		<Box>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Typography.Title level={5}>Daily Item Sold Report</Typography.Title>
				</Col>
			</Row>

			<br />

			{/* All filters in one row */}
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col span={8}>
					<Label label="Select Date" spacing />
					<DatePicker
						className="w-100"
						value={selectedDate}
						onChange={(date: Moment | null) => {
							if (date) {
								setSelectedDate(date);
							}
						}}
					/>
				</Col>
				<Col span={8}>
					<Label label="Date Range" spacing />
					<Select
						className="w-100"
						placeholder="Select Date Range"
						value={selectedDateRangeFilter || undefined}
						allowClear
						onChange={(value) => {
							setSelectedDateRangeFilter(value || '');
						}}
					>
						<Select.Option value="last3days">Last 3 Days</Select.Option>
						<Select.Option value="last7days">Last 7 Days</Select.Option>
					</Select>
				</Col>
				<Col span={8}>
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
						onChange={(value) => setSelectedProductCategory(value || '')}
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
				<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
					<Col span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							disabled={isLoadingTableData}
							filterOption={filterOption}
							optionFilterProp="children"
							placeholder="Select Branch"
							value={params.branchId ? Number(params.branchId) : undefined}
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

			{viewDailyItemSoldModalVisible && (
				<ViewDailyItemSoldModal
					branch={selectedBranch}
					dailyItemSoldSummary={selectedDailySummary}
					loading={isLoadingModalData}
					reportDate={selectedReportDate}
					onClose={handleViewDailyItemSoldModalClose}
				/>
			)}
		</Box>
	);
};

export default DailyItemSoldReport;
