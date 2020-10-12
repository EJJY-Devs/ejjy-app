import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table } from '../../../../../components';
import { ButtonLink } from '../../../../../components/elements';
import { orderSlipStatus as osStatus } from '../../../../../global/types';
import {
	calculateTableHeight,
	formatDateTime,
	getOrderSlipStatus,
	sleep,
} from '../../../../../utils/function';
import { OrderSlipActions } from './OrderSlipActions';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time Created', dataIndex: 'datetime_created' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'DR', dataIndex: 'dr' },
	{ title: 'Actions', dataIndex: 'actions' },
];

interface Props {
	orderSlips: any;
	onViewOrderSlip: any;
	onEditOrderSlip: any;
	onCreateDeliveryReceipt: any;
	loading: boolean;
}

export const OrderSlipsTable = ({
	orderSlips,
	onViewOrderSlip,
	onEditOrderSlip,
	onCreateDeliveryReceipt,
	loading,
}: Props) => {
	const [orderSlipsData, setOrderSlipsData] = useState([]);

	// Effect: Format order slips to be rendered in Table
	useEffect(() => {
		if (orderSlips) {
			const formattedOrderSlips = orderSlips.map((orderSlip) => {
				const { id, datetime_created, status, delivery_receipt } = orderSlip;
				const { value, percentage_fulfilled } = status;

				const deliveryReceipt =
					value === osStatus.RECEIVED ? (
						<Link to={`/requisition-slips/delivery-receipt/${delivery_receipt?.id}`}>
							{delivery_receipt?.id}
						</Link>
					) : null;
				const onEdit = value === osStatus.PREPARING ? () => onEditOrderSlip(orderSlip) : null;
				const onCreateDR = value === osStatus.PREPARED ? () => onCreateDeliveryReceipt(id) : null;

				return {
					id: <ButtonLink text={id} onClick={() => onViewOrderSlip(orderSlip)} />,
					datetime_created: formatDateTime(datetime_created),
					status: getOrderSlipStatus(value, percentage_fulfilled * 100, delivery_receipt?.status),
					dr: deliveryReceipt,
					actions: <OrderSlipActions onEdit={onEdit} onCreateDR={onCreateDR} />,
				};
			});
			sleep(500).then(() => setOrderSlipsData(formattedOrderSlips));
		}
	}, [orderSlips, onEditOrderSlip, onCreateDeliveryReceipt, onViewOrderSlip]);

	return (
		<Table
			columns={columns}
			dataSource={orderSlipsData}
			scroll={{ y: calculateTableHeight(orderSlipsData.length), x: '100%' }}
			loading={loading}
		/>
	);
};
