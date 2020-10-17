import React from 'react';
import { DetailsHalf, DetailsRow } from '../../../../../components';
import { formatDateTime, getOrderSlipStatus } from '../../../../../utils/function';

interface Props {
	orderSlip: any;
}

export const OrderSlipDetails = ({ orderSlip }: Props) => {
	return (
		<DetailsRow>
			<DetailsHalf
				label="Date & Time Requested"
				value={formatDateTime(orderSlip?.datetime_created)}
			/>
			<DetailsHalf label="F-RS1" value={orderSlip?.requisition_slip?.id} />
			<DetailsHalf
				label="Requesting Branch"
				value={orderSlip?.requisition_slip?.requesting_user?.branch?.name}
			/>
			<DetailsHalf label="F-OS1" value={orderSlip?.id} />
			<DetailsHalf
				label="Created By"
				value={`${orderSlip?.requisition_slip?.requesting_user?.first_name} ${orderSlip?.requisition_slip?.requesting_user?.last_name}`}
			/>
			<DetailsHalf
				label="Status"
				value={getOrderSlipStatus(
					orderSlip?.status?.value,
					orderSlip?.status?.percentage_fulfilled * 100,
					orderSlip?.delivery_receipt?.status,
				)}
			/>
		</DetailsRow>
	);
};
