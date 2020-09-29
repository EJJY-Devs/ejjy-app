import React, { useEffect, useState } from 'react';
import { AddButtonIcon, Table } from '../../../../../components';
import { ButtonLink } from '../../../../../components/elements';
import { orderSlipStatus as osStatus, request } from '../../../../../global/types';
import {
	calculateTableHeight,
	formatDateTime,
	getOrderSlipStatus,
	sleep,
} from '../../../../../utils/function';

const orderSlipsColumns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time Created', dataIndex: 'datetime_created' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'Actions', dataIndex: 'actions' },
];

interface Props {
	orderSlips: any;
	orderSlipStatus: any;
	onViewOrderSlip;
	onReceiveDeliveryReceipt: any;
}

export const OrderSlipsTable = ({
	orderSlips,
	orderSlipStatus,
	onViewOrderSlip,
	onReceiveDeliveryReceipt,
}: Props) => {
	const [orderSlipsData, setOrderSlipsData] = useState([]);

	// Effect: Format order slips to be rendered in Table
	useEffect(() => {
		if (orderSlipStatus === request.SUCCESS) {
			const formattedOrderSlips = orderSlips.map((orderSlip) => {
				const { id, datetime_created, status } = orderSlip;
				const { value, percentage_fulfilled } = status;

				return {
					id: <ButtonLink text={id} onClick={() => onViewOrderSlip(orderSlip)} />,
					datetime_created: formatDateTime(datetime_created),
					status: getOrderSlipStatus(value, percentage_fulfilled * 100),
					actions:
						status.value === osStatus.DELIVERED ? (
							<AddButtonIcon
								onClick={() => onReceiveDeliveryReceipt(orderSlip)}
								tooltip="Receive"
							/>
						) : null,
				};
			});
			sleep(500).then(() => setOrderSlipsData(formattedOrderSlips));
		}
	}, [orderSlips, orderSlipStatus, onReceiveDeliveryReceipt, onViewOrderSlip]);

	return (
		<Table
			columns={orderSlipsColumns}
			dataSource={orderSlipsData}
			scroll={{ y: calculateTableHeight(orderSlipsData.length), x: '100%' }}
			loading={orderSlipStatus === request.REQUESTING}
		/>
	);
};
