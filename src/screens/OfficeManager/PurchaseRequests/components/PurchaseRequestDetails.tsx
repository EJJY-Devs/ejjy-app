import { Col, Row } from 'antd';
import cn from 'classnames';
import { upperFirst } from 'lodash';
import React, { useCallback } from 'react';
import { Label, Select } from '../../../../components/elements';
import { purchaseRequestActionsOptions } from '../../../../global/options';
import { request } from '../../../../global/types';
import { usePurchaseRequests } from '../../../../hooks/usePurchaseRequests';
import { formatDateTime } from '../../../../utils/function';
import '../style.scss';

export const purchaseRequestDetailsType = {
	SINGLE_VIEW: 'single_view',
	CREATE_EDIT: 'create_edit',
};

interface Props {
	purchaseRequest: any;
	type: string;
}

export const PurchaseRequestDetails = ({ purchaseRequest, type }: Props) => {
	const { editPurchaseRequest, status } = usePurchaseRequests();

	const getRequestor = useCallback(() => {
		const { first_name = '', last_name = '', branch = {} } = purchaseRequest?.requesting_user || {};
		return `${first_name} ${last_name} - ${branch?.name || ''}`;
	}, [purchaseRequest]);

	const onStatusChange = (status) => {
		if (purchaseRequest) {
			editPurchaseRequest(purchaseRequest.id, status);
		}
	};

	return (
		<Row className={cn({ details: type === purchaseRequestDetailsType.SINGLE_VIEW })}>
			<Col span={24} lg={12}>
				<Row gutter={[15, 15]} align="middle">
					<Col span={12}>
						<Label label="Date &amp; Time Created" />
					</Col>
					<Col span={12}>
						<span>{formatDateTime(purchaseRequest?.datetime_created)}</span>
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
				{type === purchaseRequestDetailsType.SINGLE_VIEW && (
					<Row gutter={[15, 15]} align="middle">
						<Col span={12}>
							<Label label="Request Type" />
						</Col>
						<Col span={12}>
							<span>{upperFirst(purchaseRequest?.type)}</span>
						</Col>
					</Row>
				)}
			</Col>

			<Col span={24} lg={12}>
				{type === purchaseRequestDetailsType.SINGLE_VIEW && (
					<Row gutter={[15, 15]}>
						<Col span={12}>
							<Label label="Status" />
						</Col>
						<Col span={12}>
							<Select
								classNames="status-select"
								options={purchaseRequestActionsOptions}
								placeholder="status"
								value={purchaseRequest?.action?.action}
								onChange={onStatusChange}
								disabled={status === request.REQUESTING}
							/>
						</Col>
					</Row>
				)}

				{type === purchaseRequestDetailsType.CREATE_EDIT && (
					<Row gutter={[15, 15]} align="middle">
						<Col span={12}>
							<Label label="F-RS1" />
						</Col>
						<Col span={12}>
							<span>{purchaseRequest?.id}</span>
						</Col>
					</Row>
				)}
			</Col>
		</Row>
	);
};
