import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Content } from 'components';
import { Box } from 'components/elements';
import { useQueryParams, useReceivingVouchers, useBackOrders } from 'hooks';
import { formatDateTime, formatInPeso } from 'utils';
import React, { useState, useEffect, useMemo } from 'react';
import { CreateInventoryTransfer } from 'components';
import { useHistory } from 'react-router-dom';
import { backOrderTypes, EMPTY_CELL } from 'ejjy-global';

import './style.scss';

export const InventoryTransfer = ({ onClose, onSuccess }) => {
	const [dataSource, setDataSource] = useState([]);
	const [sortedInfo, setSortedInfo] = useState(null);
	const [isReceivingVoucherSorted, setIsReceivingVoucherSorted] = useState(
		false,
	); // Track if "Receiving Voucher" is sorted
	const [
		isCreateInventoryTransferModalVisible,
		setIsCreateInventoryTransferModalVisible,
	] = useState(false);

	const history = useHistory();

	const handleDtrClick = () => {
		if (!history.location.pathname.includes('inventory-tansfer/create')) {
			history.push('inventory-transfer/create');
		}
	};

	const [inventoryTransferType, setInventoryTransferType] = useState(null);

	const { params } = useQueryParams();

	// Fetch back orders
	const {
		data: { backOrders, total: backOrderTotal },
		isFetching: isFetchingBackOrders,
	} = useBackOrders({
		params: {
			...params,
			type: backOrderTypes.FOR_RETURN,
		},
	});

	// Fetch receiving vouchers
	const {
		data: { receivingVouchers, total: receivingVoucherTotal },
		isFetching: isFetchingReceivingVouchers,
	} = useReceivingVouchers({ params });

	// Merge data only once when either `receivingVouchers` or `backOrders` changes
	useEffect(() => {
		if (receivingVouchers && backOrders) {
			// Create unique data sets
			const receivingVouchersData = receivingVouchers.map((item) => ({
				key: `receiving-${item.id}`,
				id: item.id,
				datetimeCreated: item.datetime_created
					? formatDateTime(item.datetime_created)
					: EMPTY_CELL,
				type: 'Receiving Voucher',
				supplierName: item.supplier_name ? item.supplier_name : EMPTY_CELL,
				customer: item.customer_name ? item.customer_name : EMPTY_CELL,
				amountPaid: formatInPeso(item.amount_paid),
			}));

			const backOrdersData = backOrders.map((item) => ({
				key: `backorder-${item.id}`,
				id: item.id,
				datetimeCreated: item.datetime_created
					? formatDateTime(item.datetime_created)
					: EMPTY_CELL,
				type: 'Delivery Receipt',
				supplierName: item.vendor_name ? item.vendor_name : EMPTY_CELL,
				customer: item.customer_name ? item.customer_name : EMPTY_CELL,
				amountPaid: formatInPeso(item.amount_due),
			}));

			// Combine data and update state (no duplicates)
			setDataSource([...receivingVouchersData, ...backOrdersData]);
		}
	}, [receivingVouchers, backOrders]);

	const handleTableChange = (_, __, sorter) => {
		if (sorter.field === 'type' && sorter.order) {
			const sortedData = [...dataSource].sort((a, b) => {
				const order = sorter.order === 'ascend' ? 1 : -1;
				return a.type.localeCompare(b.type) * order;
			});
			setDataSource(sortedData);

			// Check if "Receiving Voucher" column is sorted
			if (sorter.order && sorter.field === 'type') {
				setIsReceivingVoucherSorted(sorter.order === 'ascend');
			}
		}
		setSortedInfo(sorter);
	};

	// Columns with sorting logic for `type`
	const columns: ColumnsType = useMemo(
		() => [
			{ title: 'ID', dataIndex: 'id' },
			{ title: 'Date/Time', dataIndex: 'datetimeCreated' },
			{
				title: 'Type',
				dataIndex: 'type',
				sorter: true,
				sortOrder: sortedInfo?.field === 'type' ? sortedInfo.order : null,
				sortDirections: ['ascend', 'descend', 'ascend'],
			},
			{ title: 'Vendor', dataIndex: 'supplierName' },
			{ title: 'Customer', dataIndex: 'customer' },
			{ title: 'Amount', dataIndex: 'amountPaid' },
		],
		[sortedInfo],
	);

	return (
		<>
			<Content title="Inventory Transfer">
				<Box className="InventoryTransfer_box">
					<div className="InventoryTransfer_buttons">
						<Button
							className="button"
							type="primary"
							onClick={() => {
								setIsCreateInventoryTransferModalVisible(true);
								setInventoryTransferType('receiving');
								handleDtrClick();
							}}
						>
							Create Receiving Voucher
						</Button>
						<Button
							className="button"
							type="primary"
							onClick={() => {
								setIsCreateInventoryTransferModalVisible(true);
								setInventoryTransferType('delivery');
							}}
						>
							Create Delivery Receipt
						</Button>
					</div>

					<Table
						className="InventoryTransfer_tableWrapper"
						columns={columns}
						dataSource={dataSource}
						loading={isFetchingReceivingVouchers || isFetchingBackOrders}
						pagination={{
							current: Number(params.page) || 1,
							total: receivingVoucherTotal + backOrderTotal,
							pageSize: Number(params.pageSize) || 10,
							disabled: !dataSource,
							position: ['bottomCenter'],
							pageSizeOptions: ['10', '20', '30'],
						}}
						scroll={{ x: 800 }}
						showSorterTooltip={{
							title: isReceivingVoucherSorted
								? 'Sort by Receiving Voucher'
								: 'Sort by Delivery Receipt',
						}}
						bordered
						onChange={handleTableChange}
					/>
				</Box>
			</Content>

			{/* {isCreateInventoryTransferModalVisible && (
				<CreateInventoryTransferModal
					type={inventoryTransferType}
					onClose={() => {
						setIsCreateInventoryTransferModalVisible(false);
					}}
				/>
			)} */}
		</>
	);
};
