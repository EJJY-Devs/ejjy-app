import { Col, Row, Space, Spin, Statistic } from 'antd';
import { RequestErrors } from 'components';
import { useQueryParams, usePaymentsSummary } from 'hooks';
import { timeRangeTypes } from 'global';
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
		isFetching: isFetchingPaymentSummaryData,
		error: paymentSummaryError,
	} = usePaymentsSummary({
		params: {
			...params,
			branchMachineId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
		},
	});

	return (
		<div className="Summary mb-4">
			<RequestErrors
				errors={convertIntoArray(paymentSummaryError)}
				withSpaceBottom
			/>

			<Spin spinning={isFetchingPaymentSummaryData}>
				<Space className="w-100" direction="vertical" size={16}>
					<Row gutter={[16, 16]}>
						<Col md={6} sm={8} xs={24}>
							<Statistic
								title="Payments Received"
								value={formatInPeso(summary?.total_payments_received)}
							/>
						</Col>

						<Col md={6} sm={8} xs={24}>
							<Statistic
								title="Cash Sales Invoice"
								value={formatInPeso(summary?.cash_invoice_payments)}
							/>
							<Statistic
								title="Collection Receipt"
								value={formatInPeso(summary?.collection_receipts_payments)}
							/>
						</Col>

						<Col md={6} sm={8} xs={24}>
							<Statistic
								title="Cash"
								value={formatInPeso(summary?.cash_payments)}
							/>
							<Statistic
								title="Check"
								value={formatInPeso(summary?.check_payments)}
							/>
						</Col>

						<Col md={6} sm={8} xs={24}>
							<Statistic
								title="Other(s)"
								value={formatInPeso(summary?.other_payments)}
							/>
							<Statistic
								title="Cancelled"
								value={formatInPeso(summary?.cancelled_payments)}
							/>
						</Col>
					</Row>
				</Space>
			</Spin>
		</div>
	);
};
