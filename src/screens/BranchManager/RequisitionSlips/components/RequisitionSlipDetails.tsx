import { Col, Row } from 'antd';
import cn from 'classnames';
import { upperFirst } from 'lodash';
import React, { useCallback } from 'react';
import { Label } from '../../../../components/elements';
import { formatDateTime, getRequisitionSlipStatus } from '../../../../utils/function';
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
	const getRequestor = useCallback(() => {
		const { first_name = '', last_name = '', branch = {} } = requisitionSlip?.requesting_user || {};
		return `${first_name} ${last_name} - ${branch?.name || ''}`;
	}, [requisitionSlip]);

	return (
		<Row className={cn({ details: type === requisitionSlipDetailsType.SINGLE_VIEW })}>
			<Col span={24} lg={12}>
				<Row gutter={[15, 15]} align="middle">
					<Col span={12}>
						<Label label="Date &amp; Time Created" />
					</Col>
					<Col span={12}>
						<strong>{formatDateTime(requisitionSlip?.datetime_created)}</strong>
					</Col>
				</Row>
				<Row gutter={[15, 15]} align="middle">
					<Col span={12}>
						<Label label="Requestor" />
					</Col>
					<Col span={12}>
						<strong>{getRequestor()}</strong>
					</Col>
				</Row>
				{type === requisitionSlipDetailsType.SINGLE_VIEW && (
					<Row gutter={[15, 15]} align="middle">
						<Col span={12}>
							<Label label="Request Type" />
						</Col>
						<Col span={12}>
							<strong>{upperFirst(requisitionSlip?.type)}</strong>
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
						<Col span={12}>{getRequisitionSlipStatus(requisitionSlip?.action?.action)}</Col>
					</Row>
				)}

				{type === requisitionSlipDetailsType.CREATE_EDIT && (
					<Row gutter={[15, 15]} align="middle">
						<Col span={12}>
							<Label label="F-RS1" />
						</Col>
						<Col span={12}>
							<strong>{requisitionSlip?.id}</strong>
						</Col>
					</Row>
				)}
			</Col>
		</Row>
	);
};
