import { Descriptions } from 'antd';
import { getFullName } from 'ejjy-global';
import React from 'react';
import { formatDateTime, getOrderSlipStatusBranchManager } from 'utils';

interface Props {
	orderSlip: any;
}

export const OrderSlipDetails = ({ orderSlip }: Props) => (
	<Descriptions column={1} bordered>
		<Descriptions.Item label="Date & Time Requested">
			{formatDateTime(orderSlip.datetime_created)}
		</Descriptions.Item>
		<Descriptions.Item label="F-RS1">
			{orderSlip.requisition_slip?.id}
		</Descriptions.Item>
		<Descriptions.Item label="Requesting Branch">
			{orderSlip.requisition_slip?.requesting_user?.branch?.name}
		</Descriptions.Item>
		<Descriptions.Item label="F-OS1">{orderSlip.id}</Descriptions.Item>
		<Descriptions.Item label="Created By">
			{getFullName(orderSlip.requisition_slip?.requesting_user)}
		</Descriptions.Item>
		<Descriptions.Item label="Status">
			{getOrderSlipStatusBranchManager(
				orderSlip.status?.value,
				null,
				orderSlip.status?.percentage_fulfilled * 100,
				orderSlip.delivery_receipt?.status,
			)}
		</Descriptions.Item>
	</Descriptions>
);
