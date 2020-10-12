import { Col, Row } from 'antd';
import cn from 'classnames';
import { upperFirst } from 'lodash';
import React, { useCallback } from 'react';
import { Label, Select } from '../../../../components/elements';
import { requisitionSlipActionsOptions } from '../../../../global/options';
import { request } from '../../../../global/types';
import { useRequisitionSlips } from '../../../../hooks/useRequisitionSlips';
import { formatDateTime } from '../../../../utils/function';
import '../style.scss';

export const requisitionSlipDetailsType = {
	SINGLE_VIEW: 'single_view',
	CREATE_EDIT: 'create_edit',
};

interface Props {
	requisitionSlip: any;
	type: string;
}

export const RequisitionSlipDetails = ({ requisitionSlip, type }: Props) => {
	const { editRequisitionSlip, status } = useRequisitionSlips();

	const getRequestor = useCallback(() => {
		const { first_name = '', last_name = '', branch = {} } = requisitionSlip?.requesting_user || {};
		return `${first_name} ${last_name} - ${branch?.name || ''}`;
	}, [requisitionSlip]);

	const onStatusChange = (status) => {
		if (requisitionSlip) {
			editRequisitionSlip(requisitionSlip.id, status);
		}
	};

	return (
		<Row className={cn({ details: type === requisitionSlipDetailsType.SINGLE_VIEW })}>
			<Col span={24} lg={12}>
				<Row gutter={[15, 15]} align="middle">
					<Col span={12}>
						<Label label="Date &amp; Time Created" />
					</Col>
					<Col span={12}>
						<span>{formatDateTime(requisitionSlip?.datetime_created)}</span>
					</Col>
				</Row>
				<Row gutter={[15, 15]} align="middle">
					<Col span={12}>
						<Label label="Requestor" />
					</Col>
					<Col span={12}>
						<span>{getRequestor()}</span>
					</Col>
				</Row>
				{type === requisitionSlipDetailsType.SINGLE_VIEW && (
					<Row gutter={[15, 15]} align="middle">
						<Col span={12}>
							<Label label="Request Type" />
						</Col>
						<Col span={12}>
							<span>{upperFirst(requisitionSlip?.type)}</span>
						</Col>
					</Row>
				)}
			</Col>

			<Col span={24} lg={12}>
				{type === requisitionSlipDetailsType.SINGLE_VIEW && (
					<Row gutter={[15, 15]}>
						<Col span={12}>
							<Label label="Status" />
						</Col>
						<Col span={12}>
							<Select
								classNames="status-select"
								options={requisitionSlipActionsOptions}
								placeholder="status"
								value={requisitionSlip?.action?.action}
								onChange={onStatusChange}
								disabled={status === request.REQUESTING}
							/>
						</Col>
					</Row>
				)}

				{type === requisitionSlipDetailsType.CREATE_EDIT && (
					<Row gutter={[15, 15]} align="middle">
						<Col span={12}>
							<Label label="F-RS1" />
						</Col>
						<Col span={12}>
							<span>{requisitionSlip?.id}</span>
						</Col>
					</Row>
				)}
			</Col>
		</Row>
	);
};
