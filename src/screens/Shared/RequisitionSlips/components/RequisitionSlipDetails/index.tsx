import { PrinterOutlined } from '@ant-design/icons';
import { Button, Descriptions, Tag } from 'antd';
import { ViewRequisitionSlipModal } from 'components';
import { EMPTY_CELL, getFullName } from 'ejjy-global';
import { requisitionSlipDetailsType } from 'global';
import { startCase } from 'lodash';
import React, { useState } from 'react';
import { formatDateTime } from 'utils';

interface Props {
	requisitionSlip: any;
	type: string;
}

export const RequisitionSlipDetails = ({ requisitionSlip, type }: Props) => {
	// STATES
	const [isPrintPreviewVisible, setIsPrintPreviewVisible] = useState(false);

	// VARIABLES
	const actionLabel = requisitionSlip?.action?.action
		? startCase(requisitionSlip.action.action)
		: null;

	return (
		<>
			<Descriptions
				className="w-100"
				column={2}
				labelStyle={{ width: 200 }}
				size="small"
				bordered
			>
				<Descriptions.Item label="Date & Time Created">
					{formatDateTime(requisitionSlip.datetime_created)}
				</Descriptions.Item>

				<Descriptions.Item label="Authorizer">
					{getFullName(requisitionSlip.authorizer) || EMPTY_CELL}
				</Descriptions.Item>

				{type === requisitionSlipDetailsType.SINGLE_VIEW && (
					<>
						<Descriptions.Item label="Status">
							{actionLabel ? <Tag color="blue">{actionLabel}</Tag> : EMPTY_CELL}
						</Descriptions.Item>

						<Descriptions.Item label="Customer">
							{requisitionSlip.branch?.name || EMPTY_CELL}
						</Descriptions.Item>

						<Descriptions.Item label="Vendor">
							{requisitionSlip.vendor?.name || EMPTY_CELL}
						</Descriptions.Item>

						<Descriptions.Item label="Remarks">
							{requisitionSlip.overall_remarks || EMPTY_CELL}
						</Descriptions.Item>
					</>
				)}

				{type === requisitionSlipDetailsType.CREATE_EDIT && (
					<Descriptions.Item label="F-RS1">
						{requisitionSlip.id || EMPTY_CELL}
					</Descriptions.Item>
				)}

				<Descriptions.Item label="Actions" span={2}>
					<Button
						icon={<PrinterOutlined />}
						type="primary"
						onClick={() => {
							setIsPrintPreviewVisible(true);
						}}
					>
						Print Preview
					</Button>
				</Descriptions.Item>
			</Descriptions>

			{isPrintPreviewVisible && (
				<ViewRequisitionSlipModal
					requisitionSlip={requisitionSlip}
					onClose={() => setIsPrintPreviewVisible(false)}
				/>
			)}
		</>
	);
};
