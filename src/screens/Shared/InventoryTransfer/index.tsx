import { Button, Table, Row, Col, Radio, Select } from 'antd';
import {
	Content,
	ViewReceivingVoucherModal,
	ViewBackOrderModal,
	TimeRangeFilter,
} from 'components';
import { Box, Label } from 'components/elements';
import {
	useQueryParams,
	useReceivingVouchers,
	useBackOrders,
	useBranches,
} from 'hooks';
import { formatInPeso, getAppType, formatDateTime } from 'utils';
import React, { useState, useEffect } from 'react';
import { Cart } from 'screens/Shared/Cart';
import { EMPTY_CELL, filterOption, MAX_PAGE_SIZE } from 'ejjy-global';
import { pageSizeOptions, DEFAULT_PAGE, appTypes } from 'global';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';

import './style.scss';

export const InventoryTransfer = () => {
	const [dataSource, setDataSource] = useState([]);
	const [selectedReceivingVoucher, setSelectedReceivingVoucher] = useState(
		null,
	);
	const [selectedBackOrder, setSelectedBackOrder] = useState(null);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
	const [selectedType, setSelectedType] = useState('All');
	const [createSelectedType, setCreateSelectedType] = useState(
		'Delivery Receipt',
	);

	const { refetchData, setRefetchData } = useBoundStore();
	const { params, setQueryParams } = useQueryParams();

	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	const {
		data: { branches },
		isFetching: isFetchingBranches,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	const {
		data: { backOrders = [], total: backOrderTotal },
		isFetching: isFetchingBackOrders,
		refetch: refetchBackOrders,
	} = useBackOrders({
		params: {
			...params,
			// When showing 'All', fetch all data by setting a large pageSize
			...(selectedType === 'All' && { page: 1, pageSize: MAX_PAGE_SIZE }),
		},
	});

	const {
		data: { receivingVouchers = [], total: receivingVoucherTotal },
		isFetching: isFetchingReceivingVouchers,
		refetch: refetchReceivingVouchers,
	} = useReceivingVouchers({
		params: {
			...params,
			// When showing 'All', fetch all data by setting a large pageSize
			...(selectedType === 'All' && { page: 1, pageSize: MAX_PAGE_SIZE }),
		},
	});

	useEffect(() => {
		if (backOrders && receivingVouchers) {
			let filteredData = [];

			// Convert Back Orders to table rows
			const backOrdersData = backOrders.map((item) => ({
				key: `backorder-${item.id}`,
				datetime: formatDateTime(item.datetime_created),
				rawDatetime: item.datetime_created, // Keep raw datetime for sorting
				type: 'Delivery Receipt',
				id: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => setSelectedBackOrder(item)}
					>
						{item.reference_number}
					</Button>
				),
				supplierName: item.branch?.name || EMPTY_CELL, // The branch is the supplier/vendor
				customer: item.customer_name || EMPTY_CELL,
				amountPaid: formatInPeso(item.amount),
				overallRemarks: item.overall_remarks || EMPTY_CELL,
			}));

			// Convert Receiving Vouchers to table rows
			const receivingVouchersData = receivingVouchers.map((item) => ({
				key: `receiving-${item.id}`,
				datetime: formatDateTime(item.datetime_created),
				rawDatetime: item.datetime_created, // Keep raw datetime for sorting
				type: 'Receiving Report',
				id: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => setSelectedReceivingVoucher(item)}
					>
						{item.reference_number}
					</Button>
				),
				supplierName: item.supplier_name || EMPTY_CELL,
				customer: item.branch?.name || EMPTY_CELL, // The branch is the customer
				amountPaid: formatInPeso(item.amount_paid),
				overallRemarks: item.overall_remarks || EMPTY_CELL,
			}));

			// Filter data based on selectedType
			if (selectedType === 'All') {
				filteredData = [...backOrdersData, ...receivingVouchersData];
			} else if (selectedType === 'Delivery Receipt') {
				filteredData = backOrdersData;
			} else if (selectedType === 'Receiving Report') {
				filteredData = receivingVouchersData;
			}

			// Sort data by rawDatetime (descending order - newest first)
			filteredData.sort(
				(a, b) =>
					new Date(b.rawDatetime).getTime() - new Date(a.rawDatetime).getTime(),
			);

			setDataSource(filteredData);
		}
	}, [backOrders, receivingVouchers, selectedType]);

	useEffect(() => {
		if (refetchData) {
			refetchReceivingVouchers();
			refetchBackOrders();
			setRefetchData();
		}
	}, [
		refetchData,
		refetchReceivingVouchers,
		refetchBackOrders,
		setRefetchData,
	]);

	const columns = [
		{ title: 'ID', dataIndex: 'id' },
		{ title: 'Date/Time', dataIndex: 'datetime' },
		{ title: 'Type', dataIndex: 'type' },
		{ title: 'Vendor', dataIndex: 'supplierName' },
		{ title: 'Customer', dataIndex: 'customer' },
		{ title: 'Amount', dataIndex: 'amountPaid' },
		{
			title: 'Remarks',
			dataIndex: 'overallRemarks',
		},
	];

	let total = 0;

	if (selectedType === 'Delivery Receipt') {
		total = backOrderTotal;
	} else if (selectedType === 'Receiving Report') {
		total = receivingVoucherTotal;
	} else {
		total = backOrderTotal + receivingVoucherTotal;
	}
	return (
		<>
			<Content title="Inventory Transfer">
				<Box className="InventoryTransfer_box">
					<Filter
						branches={branches}
						isHeadOffice={isHeadOffice}
						isLoading={
							isFetchingReceivingVouchers ||
							isFetchingBackOrders ||
							isFetchingBranches
						}
					/>

					<div className="InventoryTransfer_buttons">
						<div className="InventoryTransfer_filter">
							<Label label="Transfer Type" spacing />
							<Radio.Group
								options={[
									{ label: 'All', value: 'All' },
									{ label: 'Delivery Receipt', value: 'Delivery Receipt' },
									{ label: 'Receiving Report', value: 'Receiving Report' },
								]}
								optionType="button"
								value={selectedType}
								onChange={(e) => {
									setSelectedType(e.target.value);
									setQueryParams({
										page: DEFAULT_PAGE,
										pageSize: e.target.value === 'All' ? 10 : 10,
									});
								}}
							/>
						</div>
						{!isHeadOffice && (
							<div className="InventoryTransfer_create">
								<Button
									type="primary"
									onClick={() => {
										setIsCartModalVisible(true);
										setCreateSelectedType('Delivery Receipt');
									}}
								>
									Create Delivery Receipt
								</Button>
								<Button
									type="primary"
									onClick={() => {
										setIsCartModalVisible(true);
										setCreateSelectedType('Receiving Report');
									}}
								>
									Create Receiving Report
								</Button>
							</div>
						)}
					</div>

					<Table
						className="InventoryTransfer_tableWrapper"
						columns={columns}
						dataSource={dataSource}
						loading={isFetchingReceivingVouchers || isFetchingBackOrders}
						pagination={{
							current: Number(params.page) || DEFAULT_PAGE,
							total,
							pageSize:
								selectedType === 'All' ? 10 : Number(params.pageSize) || 10,
							position: ['bottomCenter'],
							pageSizeOptions,
							onChange: (page, newPageSize) => {
								const adjustedPageSize =
									selectedType === 'All' ? 10 : newPageSize;
								setQueryParams({ page, pageSize: adjustedPageSize });
							},
							disabled: !dataSource,
						}}
						scroll={{ x: 800 }}
						bordered
					/>
				</Box>

				{selectedReceivingVoucher && (
					<ViewReceivingVoucherModal
						receivingVoucher={selectedReceivingVoucher}
						onClose={() => setSelectedReceivingVoucher(null)}
					/>
				)}

				{selectedBackOrder && (
					<ViewBackOrderModal
						backOrder={selectedBackOrder}
						onClose={() => setSelectedBackOrder(null)}
					/>
				)}

				{isCartModalVisible && (
					<Cart
						type={createSelectedType}
						onClose={() => setIsCartModalVisible(false)}
					/>
				)}
			</Content>
		</>
	);
};

const Filter = ({ isLoading, branches, isHeadOffice }) => {
	const { params, setQueryParams } = useQueryParams();

	return (
		<Row>
			<Col className="InventoryTransfer_timeRangeFilter">
				<TimeRangeFilter disabled={isLoading} />
			</Col>

			{isHeadOffice && (
				<Col className="InventoryTransfer_timeRangeFilter" lg={4}>
					<Label label="Branch" spacing />
					<Select
						className="w-100"
						disabled={isLoading}
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
						{branches?.map(({ id, name }) => (
							<Select.Option key={id} value={id}>
								{name}
							</Select.Option>
						))}
					</Select>
				</Col>
			)}
		</Row>
	);
};
