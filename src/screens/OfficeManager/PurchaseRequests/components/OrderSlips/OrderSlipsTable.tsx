import React, { useEffect, useState } from 'react';
import { Table } from '../../../../../components';
import { ButtonLink } from '../../../../../components/elements';
import { orderSlipStatus as osStatus, request } from '../../../../../global/types';
import {
	calculateTableHeight,
	formatDateTime,
	getOrderSlipStatus,
	getOSDRStatus,
	sleep,
} from '../../../../../utils/function';
import { OrderSlipActions } from './OrderSlipActions';

const orderSlipsColumns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time Created', dataIndex: 'datetime_created' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'DR Status', dataIndex: 'dr_status' },
	{ title: 'Actions', dataIndex: 'actions' },
];

interface Props {
	orderSlips: any;
	orderSlipStatus: any;
	onViewDeliveryReceipt: any;
	onViewOrderSlip: any;
	onEditOrderSlip: any;
	onCreateDeliveryReceipt: any;
	loading: boolean;
}

export const OrderSlipsTable = ({
	orderSlips,
	orderSlipStatus,
	onViewDeliveryReceipt,
	onViewOrderSlip,
	onEditOrderSlip,
	onCreateDeliveryReceipt,
	loading,
}: Props) => {
	const [orderSlipsData, setOrderSlipsData] = useState([]);

	// Effect: Format order slips to be rendered in Table
	useEffect(() => {
		if (orderSlipStatus === request.SUCCESS) {
			const formattedOrderSlips = orderSlips.map((orderSlip) => {
				const { id, datetime_created, status, delivery_receipt } = orderSlip;
				const { value, percentage_fulfilled } = status;

				const onViewDR =
					value === osStatus.RECEIVED ? () => onViewDeliveryReceipt(orderSlip) : null;
				const onEdit = value === osStatus.PREPARING ? () => onEditOrderSlip(orderSlip) : null;
				const onCreateDR = value === osStatus.PREPARED ? () => onCreateDeliveryReceipt(id) : null;

				return {
					id: <ButtonLink text={id} onClick={() => onViewOrderSlip(orderSlip)} />,
					datetime_created: formatDateTime(datetime_created),
					status: getOrderSlipStatus(value, percentage_fulfilled * 100),
					dr_status: getOSDRStatus(delivery_receipt?.status),
					actions: <OrderSlipActions onView={onViewDR} onEdit={onEdit} onCreateDR={onCreateDR} />,
				};
			});
			sleep(500).then(() => setOrderSlipsData(formattedOrderSlips));
		}
	}, [
		orderSlips,
		orderSlipStatus,
		onViewDeliveryReceipt,
		onEditOrderSlip,
		onCreateDeliveryReceipt,
		onViewOrderSlip,
	]);

	return (
		<Table
			columns={orderSlipsColumns}
			dataSource={orderSlipsData}
			scroll={{ y: calculateTableHeight(orderSlipsData.length), x: '100%' }}
			loading={orderSlipStatus === request.REQUESTING || loading}
		/>
	);
};
