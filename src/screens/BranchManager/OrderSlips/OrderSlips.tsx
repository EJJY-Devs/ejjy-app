/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Container, Table, TableHeader } from '../../../components';
import { useOrderSlips } from '../hooks/useOrderSlips';
import { selectors as authSelectors } from '../../../ducks/auth';
import { useSelector } from 'react-redux';
import {
	calculateTableHeight,
	formatDateTime,
	getOrderSlipStatus,
	sleep,
} from '../../../utils/function';
import { Box, ButtonLink } from '../../../components/elements';
import { request } from '../../../global/types';
import { ViewOrderSlipModal } from './components/ViewOrderSlipModal';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time Created', dataIndex: 'datetime_created' },
	{ title: 'Status', dataIndex: 'status' },
];

const OrderSlips = () => {
	const [orderSlipsData, setOrderSlipsData] = useState([]);
	const [selectedOrderSlip, setSelectedOrderSlip] = useState(null);
	const [viewOrderSlipVisible, setViewOrderSlipVisible] = useState(false);

	const user = useSelector(authSelectors.selectUser());
	const { orderSlips, getOrderSlipsExtended, status } = useOrderSlips();

	// Effect: Fetch order slips
	useEffect(() => {
		getOrderSlipsExtended(user.branch.id, null);
	}, [user]);

	// Effect: Format order slips to be rendered in Table
	useEffect(() => {
		if (orderSlips) {
			const formattedOrderSlips = orderSlips.map((orderSlip) => {
				const { id, datetime_created, status, delivery_receipt } = orderSlip;
				const { value, percentage_fulfilled } = status;

				return {
					id: <ButtonLink text={id} onClick={() => onViewOrderSlip(orderSlip)} />,
					datetime_created: formatDateTime(datetime_created),
					status: getOrderSlipStatus(value, percentage_fulfilled * 100, delivery_receipt?.status),
				};
			});
			sleep(500).then(() => setOrderSlipsData(formattedOrderSlips));
		}
	}, [orderSlips]);

	const onViewOrderSlip = (orderSlip) => {
		setSelectedOrderSlip(orderSlip);
		setViewOrderSlipVisible(true);
	};

	return (
		<Container title="Order Slips">
			<section className="OrderSlips">
				<Box>
					<TableHeader title="F-OS1" />

					<Table
						columns={columns}
						dataSource={orderSlipsData}
						scroll={{ y: calculateTableHeight(orderSlipsData.length), x: '100%' }}
						loading={status === request.REQUESTING}
					/>

					<ViewOrderSlipModal
						visible={viewOrderSlipVisible}
						orderSlip={selectedOrderSlip}
						onClose={() => setViewOrderSlipVisible(false)}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default OrderSlips;
