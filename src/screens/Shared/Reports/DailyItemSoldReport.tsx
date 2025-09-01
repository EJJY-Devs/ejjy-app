import { Col, Row, Table, Typography, Select, Button } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TimeRangeFilter } from 'components';
import { Box, Label } from 'components/elements';
import {
	ViewDailyItemSoldModal,
	convertIntoArray,
	useBranches,
	useQueryParams,
	filterOption,
} from 'ejjy-global';
import { DEFAULT_PAGE, MAX_PAGE_SIZE } from 'global';
import { useUserStore } from 'stores';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
	getLocalApiUrl,
	getLocalBranchId,
	isUserFromBranch,
	isUserFromOffice,
} from 'utils';
import { TransactionProductsService } from 'services';
import { useTransactionProductDates } from 'hooks/useTransactionProducts';

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

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);

	// Fetch available dates for all time ranges
	const {
		data: availableDates,
		isFetching: isFetchingDates,
		error: datesError,
	} = useTransactionProductDates({
		params: {
			timeRange: Array.isArray(params.timeRange)
				? params.timeRange.join(',')
				: params.timeRange,
			branchId: isUserFromBranch(user.user_type)
				? getLocalBranchId()
				: (params?.branchId as string | number),
		},
		options: {
			enabled: !!params.timeRange, // Fetch for all time ranges
		},
	});

	const { data: branchesData } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
		},
	});

	const getColumns = (): ColumnsType<TableRow> => {
		const columns: ColumnsType<TableRow> = [
			{
				title: 'Date',
				dataIndex: 'formattedDate',
				render: (formattedDate: string, record: TableRow) => (
					<Button
						style={{ padding: 0 }}
						type="link"
						onClick={() =>
							handleDateClick(record.date, record.branchId, record)
						}
					>
						{formattedDate}
					</Button>
				),
			},
		];

		// Add Branch column for head office users
		if (isUserFromOffice(user.user_type)) {
			columns.push({
				title: 'Branch',
				dataIndex: 'branchName',
				render: (branchName: string) => branchName || 'All Branches',
			});
		}

		// Add Total Products Sold column
		columns.push({
			title: 'Total Products Sold',
			dataIndex: 'totalProductsSold',
			render: (total: number) => total?.toLocaleString() || '0',
		});

		return columns;
	};

	// METHODS
	const fetchTotalProductsSold = async (date: string, branchId?: number) => {
		try {
			const response = await TransactionProductsService.getDailySummary(
				{
					date,
					branch_id: branchId,
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
			// Start loading immediately
			setIsLoadingTableData(true);

			try {
				// Only proceed if we have dates
				if (!availableDates || availableDates.length === 0) {
					console.log('No available dates, skipping data load');
					setDataSource([]);
					return;
				}

				const isHeadOffice = isUserFromOffice(user.user_type);

				// For head office users, wait for branches data to be loaded
				if (isHeadOffice && !branchesData?.list) {
					console.log(
						'Head office user - waiting for branches data to load...',
					);
					return; // Keep loading state true
				}

				const data: TableRow[] = [];

				if (isHeadOffice && !params?.branchId) {
					// Head office user without specific branch selected - show all branches
					const branches = (branchesData as any)?.list || [];

					const promises = availableDates.flatMap((date: string) =>
						branches.map(async (branch: any) => {
							const totalProductsSold = await fetchTotalProductsSold(
								date,
								branch.id,
							);
							if (totalProductsSold > 0) {
								return {
									key: `${date}-${branch.id}`,
									date,
									formattedDate: moment(date).format('MM/DD/YYYY'),
									totalProductsSold,
									branchName: branch.name,
									branchId: branch.id,
								};
							}
							return null;
						}),
					);

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

					const promises = availableDates.map(async (date: string) => {
						const totalProductsSold = await fetchTotalProductsSold(
							date,
							branchId ? Number(branchId) : undefined,
						);
						return {
							key: date,
							date,
							formattedDate: moment(date).format('MM/DD/YYYY'),
							totalProductsSold,
							branchName,
							branchId: branchId ? Number(branchId) : undefined,
						};
					});

					const results = await Promise.all(promises);
					data.push(...results);
				}

				setDataSource(data);
			} catch (error) {
				console.error('Error loading table data:', error);
			} finally {
				// Always end loading state
				setIsLoadingTableData(false);
			}
		};

		loadData();
	}, [
		availableDates,
		user.user_type,
		params?.branchId,
		branchesData?.list?.length, // Only react to length change, not the entire object
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

			const response = await TransactionProductsService.getDailySummary(
				{
					date,
					branch_id:
						!isUserFromBranch(user.user_type) && (branchId || params?.branchId)
							? branchId || (params.branchId as string | number)
							: undefined,
					ordering: '-quantity', // Sort by quantity in descending order
				},
				getLocalApiUrl(),
			);

			const { data } = response;

			const products: DailyItemSoldSummaryItem[] = data.map((item: any) => ({
				productId: item.product_id,
				name: item.name,
				code: item.code,
				unitOfMeasurement: item.unit_of_measurement,
				quantity: Number(item.quantity),
			}));

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

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col span={24}>
					<TimeRangeFilter disabled={isFetchingDates} />
				</Col>
			</Row>

			{isUserFromOffice(user.user_type) && (
				<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
					<Col span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							disabled={isFetchingDates}
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

			<RequestErrors
				errors={[...convertIntoArray(datesError, 'Available Dates')]}
				withSpaceBottom
			/>

			<Table
				columns={getColumns()}
				dataSource={dataSource}
				loading={isFetchingDates || isLoadingTableData}
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
					onClose={handleViewDailyItemSoldModalClose}
				/>
			)}
		</Box>
	);
};

export default DailyItemSoldReport;
