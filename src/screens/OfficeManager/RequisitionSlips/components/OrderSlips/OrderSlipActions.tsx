import { Popconfirm } from 'antd';
import React from 'react';
import { DeliverButtonIcon, EditButtonIcon } from '../../../../../components';

interface Props {
	onEdit?: any;
	onCreateDR?: any;
}

export const OrderSlipActions = ({ onEdit, onCreateDR }: Props) => (
	<div className="order-slip-actions">
		{onEdit && <EditButtonIcon onClick={onEdit} tooltip="Edit" />}
		{onCreateDR && (
			<Popconfirm
				placement="topLeft"
				title={'Please confirm the creation of delivery receipt for this order slip'}
				onConfirm={onCreateDR}
				okText="Confirm"
				cancelText="Cancel"
			>
				<DeliverButtonIcon onClick={null} tooltip="Create Delivery Receipt" />
			</Popconfirm>
		)}
	</div>
);
