import { PrinterOutlined } from '@ant-design/icons';
import { Button, Descriptions } from 'antd';
import { ViewRequisitionSlipModal } from 'components';
import { EMPTY_CELL, getFullName } from 'ejjy-global';
import { requisitionSlipDetailsType } from 'global';
import { upperFirst } from 'lodash';
import React, { useState } from 'react';
import { formatDateTime } from 'utils';

interface Props {
	requisitionSlip: any;
	type: string;
}

export const RequisitionSlipDetails = ({ requisitionSlip, type }: Props) => {
	// STATES
	const [isPrintPreviewVisible, setIsPrintPreviewVisible] = useState(false);

	// METHODS
	// const handleStatusChange = (status) => {
	// 	editRequisitionSlip(requisitionSlip.id, status);
	// };

	return (
		<>
			<Descriptions
				className="pa-6 pb-0 w-100"
				column={2}
				labelStyle={{ width: 200 }}
				size="small"
				bordered
			>
				<Descriptions.Item label="Date & Time Created">
					{formatDateTime(requisitionSlip.datetime_created)}
				</Descriptions.Item>

				<Descriptions.Item label="Requestor">
					{getFullName(requisitionSlip.approved_by) || EMPTY_CELL}
				</Descriptions.Item>

				{type === requisitionSlipDetailsType.SINGLE_VIEW && (
					<>
						<Descriptions.Item label="Status">
							{requisitionSlip.status || EMPTY_CELL}
						</Descriptions.Item>

						{/* {!isUserFromBranch(user.user_type) && (
							<Descriptions.Item label="Status">
								<Select
									classNames="status-select"
									disabled={requisitionSlipsStatus === request.REQUESTING}
									options={requisitionSlipActionsOptions}
									placeholder="status"
									value={requisitionSlip?.action?.action}
									onChange={handleStatusChange}
								/>
							</Descriptions.Item>
						)} */}

						<Descriptions.Item label="Customer">
							{requisitionSlip.branch?.name || EMPTY_CELL}
						</Descriptions.Item>

						<Descriptions.Item label="Remarks">
							{upperFirst(requisitionSlip.type) || EMPTY_CELL}
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
