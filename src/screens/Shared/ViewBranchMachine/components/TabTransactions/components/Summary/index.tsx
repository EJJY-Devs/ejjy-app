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
						<Col md={8} sm={0} xs={0}>
							<Statistic
								title="Gross Sales of the Day"
								value={formatInPeso(summary?.total_gross_sales)}
							/>
						</Col>
					</Row>

					<Row gutter={[16, 16]}>
						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="VAT-Exempt Sales"
								value={formatInPeso(summary?.vat_exempt_sales)}
							/>
						</Col>

						<Col md={8} sm={0} xs={0}>
							<Statistic
								title="Returns"
								value={formatInPeso(summary?.returns)}
							/>
						</Col>
						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="Gross Sales of the Day"
								value={formatInPeso(summary?.total_gross_sales)}
							/>
						</Col>
					</Row>
					<Row gutter={[16, 16]}>
						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="VATable Sales"
								value={formatInPeso(summary?.vatable_sales)}
							/>
						</Col>

						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="Voids"
								value={formatInPeso(summary?.total_voided_sales)}
							/>
						</Col>

						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="Deductions"
								value={formatInPeso(summary?.total_deductions)}
							/>
						</Col>
					</Row>
					<Row gutter={[16, 16]}>
						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="VAT Amount (12%)"
								value={formatInPeso(summary?.vat_amount)}
							/>
						</Col>

						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="Discounts"
								value={formatInPeso(summary?.total_discount)}
							/>
						</Col>

						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="VAT Amount (12%)"
								value={formatInPeso(summary?.vat_amount)}
							/>
						</Col>
					</Row>
					<Row gutter={[16, 16]}>
						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="Zero-Rated Sales"
								value={formatInPeso(summary?.zero_rated_sales)}
							/>
						</Col>
						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="Deductions"
								value={formatInPeso(summary?.total_deductions)}
							/>
						</Col>
						<Col md={8} sm={8} xs={24}>
							<Statistic
								title="Net Sales"
								value={formatInPeso(summary?.net_sales)}
							/>
						</Col>
					</Row>
				</Space>
			</Spin>
		</div>
	);
};
