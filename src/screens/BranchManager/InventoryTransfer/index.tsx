import { Button, Table, Row, Col, Radio } from 'antd';
import {
	Content,
	ViewReceivingVoucherModal,
	ViewBackOrderModal,
	TimeRangeFilter,
} from 'components';
import { Box, Label } from 'components/elements';
import { useQueryParams, useReceivingVouchers, useBackOrders } from 'hooks';
import { formatDateTime, formatInPeso } from 'utils';
import React, { useState, useEffect } from 'react';
import { Cart } from 'screens/Shared/Cart';
import { backOrderTypes, EMPTY_CELL } from 'ejjy-global';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';

import './style.scss';

export const InventoryTransfer = () => {
	const [dataSource, setDataSource] = useState([]);
	const [selectedReceivingVoucher, setSelectedReceivingVoucher] = useState(
		null,
	);
	const [selectedBackOrder, setSelectedBackOrder] = useState(null);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
	const [selectedType, setSelectedType] = useState('Delivery Receipt');
	const [createSelectedType, setCreateSelectedType] = useState(
		'Delivery Receipt',
	);

	const { refetchData, setRefetchData } = useBoundStore();

	const { params, setQueryParams } = useQueryParams();

	const {
		data: { backOrders, total: backOrderTotal },
		isFetching: isFetchingBackOrders,
		refetch: refetchBackOrders,
	} = useBackOrders({
		params: {
			...params,
			type: backOrderTypes.FOR_RETURN,
			timeRange: params?.timeRange,
		},
	});

	const {
		data: { receivingVouchers, total: receivingVoucherTotal },
		isFetching: isFetchingReceivingVouchers,
		refetch: refetchReceivingVouchers,
	} = useReceivingVouchers({
		params: { ...params, timeRange: params?.timeRange },
	});

	// Merge data only once when either `receivingVouchers` or `backOrders` changes
	useEffect(() => {
		if (receivingVouchers && backOrders) {
			let filteredData = [];

			if (selectedType === 'Delivery Receipt') {
				filteredData = backOrders.map((item) => ({
					key: `backorder-${item.id}`,
					id: (
						<Button
							className="pa-0"
							type="link"
							onClick={() => setSelectedBackOrder(item)}
						>
							{item.id}
						</Button>
					),
					datetimeCreated: item.datetime_created
						? formatDateTime(item.datetime_created)
						: EMPTY_CELL,
					type: 'Delivery Receipt',
					supplierName: item.vendor_name || EMPTY_CELL,
					customer: item.customer_name || EMPTY_CELL,
					amountPaid: formatInPeso(item.amount),
				}));
			} else if (selectedType === 'Receiving Report') {
				filteredData = receivingVouchers.map((item) => ({
					key: `receiving-${item.id}`,
					id: (
						<Button
							className="pa-0"
							type="link"
							onClick={() => setSelectedReceivingVoucher(item)}
						>
							{item.id}
						</Button>
					),
					datetimeCreated: item.datetime_created
						? formatDateTime(item.datetime_created)
						: EMPTY_CELL,
					type: 'Receiving Report',
					supplierName: item.supplier_name || EMPTY_CELL,
					customer: item.customer_name || EMPTY_CELL,
					amountPaid: formatInPeso(item.amount_paid),
				}));
			}

			setDataSource(filteredData);
		}
	}, [receivingVouchers, backOrders, selectedType]); // Only update if necessary

	useEffect(() => {
		if (refetchData) {
			refetchReceivingVouchers(); // Trigger manual refetch
			refetchBackOrders();
			setRefetchData(); // Reset refetch flag after refetching
		}
	}, [refetchData, refetchReceivingVouchers, setRefetchData]);

	const columns = [
		{ title: 'ID', dataIndex: 'id' },
		{ title: 'Date/Time', dataIndex: 'datetimeCreated' },
		{ title: 'Type', dataIndex: 'type' },
		{ title: 'Vendor', dataIndex: 'supplierName' },
		{ title: 'Customer', dataIndex: 'customer' },
		{ title: 'Amount', dataIndex: 'amountPaid' },
	];

	return (
		<>
			<Content title="Inventory Transfer">
				<Box className="InventoryTransfer_box">
					<Filter
						isLoading={isFetchingReceivingVouchers || isFetchingBackOrders}
					/>

					<div className="InventoryTransfer_buttons">
						<div className="InventoryTransfer_filter">
							<Label label="Transfer Type" spacing />
							<Radio.Group
								options={[
									{ label: 'Delivery Receipt', value: 'Delivery Receipt' },
									{ label: 'Receiving Report', value: 'Receiving Report' },
								]}
								optionType="button"
								value={selectedType}
								onChange={(e) => setSelectedType(e.target.value)}
							/>
						</div>
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
					</div>

					<Table
						className="InventoryTransfer_tableWrapper"
						columns={columns}
						dataSource={dataSource}
						loading={isFetchingReceivingVouchers || isFetchingBackOrders}
						pagination={{
							current: Number(params.page) || 1,
							total: receivingVoucherTotal
								? selectedType === 'Receiving Report'
								: backOrderTotal,
							pageSize: Number(params.pageSize) || 10,
							position: ['bottomCenter'],
							pageSizeOptions: ['10', '20', '30'],
							onChange: (page, newPageSize) => {
								setQueryParams({
									page,
									pageSize: newPageSize,
								});
							},
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

type FilterProps = {
	isLoading: boolean;
};

const Filter = ({ isLoading }: FilterProps) => {
	return (
		<>
			<Row className="m-10" gutter={[24, 24]}>
				<Col className="InventoryTransfer_timeRangeFilter" lg={12} span={24}>
					<TimeRangeFilter disabled={isLoading} />
				</Col>
			</Row>
		</>
	);
};
