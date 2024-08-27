import { Col, Row, Space, Spin, Statistic } from 'antd';
import { RequestErrors } from 'components';
import { refetchOptions, timeRangeTypes } from 'global';
import { useQueryParams, useTransactionsSummary } from 'hooks';
import React from 'react';
import { convertIntoArray, formatInPeso } from 'utils';
import './style.scss';

type Props = {
	branchMachineId: number;
};

export const Summary = ({ branchMachineId }: Props) => {
	const { params } = useQueryParams();

	const {
		data: { summary = null } = {},
		error: transactionsSummaryError,
		isLoading: isTransactionsSummaryLoading,
	} = useTransactionsSummary({
		params: {
			...params,
			branchMachineId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
		},
		options: {
			...refetchOptions,
			notifyOnChangeProps: ['data', 'isLoading'],
		},
	});

	return (
		<div className="Summary mb-4">
			<RequestErrors
				errors={convertIntoArray(transactionsSummaryError)}
				withSpaceBottom
			/>

			<Spin spinning={isTransactionsSummaryLoading}>
				<Space className="w-100" direction="vertical" size={16}>
					<Row gutter={[16, 16]}>
						<Col md={6} sm={8} xs={24}>
							<Statistic title="Payments Received" value={formatInPeso(0)} />
						</Col>

						<Col md={6} sm={8} xs={24}>
							<Statistic title="Cash Sales Invoice" value={formatInPeso(0)} />
							<Statistic title="Collection Receipt" value={formatInPeso(0)} />
						</Col>

						<Col md={6} sm={8} xs={24}>
							<Statistic title="Cash" value={formatInPeso(0)} />
							<Statistic title="Check" value={formatInPeso(0)} />
						</Col>

						<Col md={6} sm={8} xs={24}>
							<Statistic title="Other(s)" value={formatInPeso(0)} />
						</Col>
					</Row>
				</Space>
			</Spin>
		</div>
	);
};
