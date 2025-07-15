import { Button, Col, Modal, Row, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TimeRangeFilter } from 'components';
import {
	DATE_FORMAT,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	TransactionProduct,
	ViewDailyItemSoldModal,
	convertIntoArray,
	useBranches,
	useQueryParams,
	useTransactionProducts,
} from 'ejjy-global';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { getLocalApiUrl } from 'utils';

interface Props {
	branchId?: any; // Optional branch prop
	onClose: () => void;
}

interface TableRow {
	key: string;
	date: string;
	formattedDate: string;
}

interface DailyItemSoldSummaryItem {
	productId: number;
	name: string;
	quantity: number;
}

export const DailyItemSoldModal = ({ branchId, onClose }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState<TableRow[]>([]);
	const [
		viewDailyItemSoldModalVisible,
		setViewDailyItemSoldModalVisible,
	] = useState(false);
	const [selectedDailySummary, setSelectedDailySummary] = useState<
		DailyItemSoldSummaryItem[]
	>([]);
	const { params, setQueryParams } = useQueryParams();

	const {
		data: transactionProductsData,
		isFetching: isFetchingTransactionProducts,
		error: transactionProductsError,
	} = useTransactionProducts({
		params: {
			...params,
			branchId,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
		},
	});

	const { data: branchesData } = useBranches({
		params: {
			pageSize: 10,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
		},
	});

	// Handle date click - will open ViewDailyItemSoldModal
	const handleDateClick = (date: string) => {
		// Get transaction products for the selected date
		const selectedDateProducts = transactionProductsData?.list?.filter(
			(transactionProduct) =>
				moment(transactionProduct.datetime_created).format(DATE_FORMAT) ===
				date,
		);

		// Create daily item sold summary
		const dailyItemSoldSummary = selectedDateProducts?.reduce(
			(acc, transactionProduct) => {
				const productId = transactionProduct.branch_product.product.id;
				const productName = transactionProduct.branch_product.product.name;
				const quantity = Number(transactionProduct.quantity);

				if (!acc[productId]) {
					acc[productId] = {
						name: productName,
						quantity: 0,
					};
				}

				acc[productId].quantity += quantity;
				return acc;
			},
			{} as Record<
				number,
				{
					name: string;
					quantity: number;
				}
			>,
		);

		// Convert to array format for the modal
		const dailyItemSoldSummaryArray: DailyItemSoldSummaryItem[] = Object.entries(
			dailyItemSoldSummary || {},
		).map(([productId, summary]) => ({
			productId: Number(productId),
			name: (summary as { name: string; quantity: number }).name,
			quantity: (summary as { name: string; quantity: number }).quantity,
		}));

		// Open ViewDailyItemSoldModal with the summary
		setSelectedDailySummary(dailyItemSoldSummaryArray);
		setViewDailyItemSoldModalVisible(true);
	};

	const columns: ColumnsType<TableRow> = [
		{
			title: 'Date',
			dataIndex: 'formattedDate',
			render: (text: string, record: TableRow) => {
				const isDisabled = false;
				const button = (
					<Button
						disabled={isDisabled}
						style={{ padding: 0, height: 'auto' }}
						type="link"
						onClick={() => handleDateClick(record.date)}
					>
						{text}
					</Button>
				);

				return isDisabled ? (
					<Tooltip title="Loading branch information...">{button}</Tooltip>
				) : (
					button
				);
			},
		},
	];

	// METHODS
	useEffect(() => {
		if (transactionProductsData?.list) {
			// Group transaction products by date
			const dateGroups = transactionProductsData.list.reduce(
				(acc, transactionProduct) => {
					const date = moment(transactionProduct.datetime_created).format(
						DATE_FORMAT,
					);
					if (!acc[date]) {
						acc[date] = [];
					}
					acc[date].push(transactionProduct);
					return acc;
				},
				{} as Record<string, TransactionProduct[]>,
			);

			// Convert to table data format
			const data = Object.keys(dateGroups).map((date) => ({
				key: date,
				date,
				formattedDate: moment(date).format('MM/DD/YYYY'),
			}));

			setDataSource(data);
		}
	}, [transactionProductsData?.list]);

	const handleClose = () => {
		const today = moment().format(DATE_FORMAT);
		setQueryParams({
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
			timeRange: [today, today].join(','),
		});

		onClose();
	};

	const handleViewDailyItemSoldModalClose = () => {
		setViewDailyItemSoldModalVisible(false);
		setSelectedDailySummary([]);
	};

	return (
		<>
			<Modal
				footer={null}
				title="Daily Item Sold"
				width={600}
				centered
				closable
				open
				onCancel={handleClose}
			>
				<Filter isLoading={isFetchingTransactionProducts} />

				<RequestErrors
					errors={[
						...convertIntoArray(
							transactionProductsError,
							'Transaction Products',
						),
					]}
					withSpaceBottom
				/>

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={isFetchingTransactionProducts}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total: transactionProductsData?.total || 0,
						pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
						onChange: (page) => setQueryParams({ page }),
						disabled: !dataSource,
						showSizeChanger: false,
						position: ['bottomCenter'],
					}}
					scroll={{ x: 500 }}
				/>
			</Modal>

			{viewDailyItemSoldModalVisible && (
				<ViewDailyItemSoldModal
					branch={
						(branchesData as any)?.list?.find(
							(b) => b.id === branchId || b.id === Number(branchId),
						) || null
					}
					dailyItemSoldSummary={selectedDailySummary}
					onClose={handleViewDailyItemSoldModalClose}
				/>
			)}
		</>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => (
	<Row className="mb-4" gutter={[16, 16]}>
		<Col span={24}>
			<TimeRangeFilter disabled={isLoading} />
		</Col>
	</Row>
);
