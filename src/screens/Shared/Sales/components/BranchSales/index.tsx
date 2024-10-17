import { Col, Row, Statistic, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import { RequestErrors, TimeRangeFilter } from 'components';
import { MAX_PAGE_SIZE, refetchOptions, timeRangeTypes } from 'global';
import { useBranchMachines, useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, formatInPeso } from 'utils';

const columns: ColumnsType = [
	{ title: 'Machine Name', dataIndex: 'machineName', fixed: 'left' },
	{ title: 'Payments Received', dataIndex: 'paymentReceived' },
	{ title: 'Opening Fund', dataIndex: 'openingFund' },
	{ title: 'Cash In', dataIndex: 'cashIn' },
	{ title: 'Cash Out', dataIndex: 'cashOut' },
	{ title: 'Cash Collection', dataIndex: 'cashOut' },
	{ title: 'Cash On Hand', dataIndex: 'cashOnHand' },
	{ title: 'Cash SI', dataIndex: 'cashInvoice' },
	{ title: 'Charge SI', dataIndex: 'chargeInvoice' },
	{ title: 'Gross Sales of the Day', dataIndex: 'grossSales' },
	{ title: 'Returns', dataIndex: 'returns' },
	{ title: 'Voids', dataIndex: 'voidedTransactions' },
	{ title: 'Discounts', dataIndex: 'discounts' },
	{ title: 'VAT Amount (12%)', dataIndex: 'vatAmount' },
	{ title: 'Net Sales', dataIndex: 'netSales' },
];

const summaryInitialValues = {
	cashInvoice: 0,
	creditSales: 0,
	chargeInvoice: 0,
	cashOut: 0,
	cashIn: 0,
	cashOnHand: 0,
	cashCollection: 0,
	openingFund: 0,
	paymentReceived: 0,
	grossSales: 0,
};

interface Props {
	branchId: any;
}

export const BranchSales = ({ branchId }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [summary, setSummary] = useState(summaryInitialValues);

	// CUSTOM HOOKS
	const { params } = useQueryParams();
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		isFetched: isBranchMachinesFetched,
		error: branchMachinesError,
	} = useBranchMachines({
		params: {
			branchId,
			pageSize: MAX_PAGE_SIZE,
			salesTimeRange: params.timeRange || timeRangeTypes.DAILY,
		},
		options: {
			enabled: !!branchId,
			...refetchOptions,
		},
	});

	// METHODS
	useEffect(() => {
		const newSummary = _.clone(summaryInitialValues);

		const data = branchMachines.map((branchMachine) => {
			newSummary.cashInvoice += Number(branchMachine.sales.cash_sales);
			newSummary.chargeInvoice += Number(branchMachine.sales.credit_sales);
			newSummary.cashIn += Number(branchMachine.sales.cash_in);
			newSummary.cashOut += Number(branchMachine.sales.cash_out);
			newSummary.cashOnHand += Number(branchMachine.sales.cash_on_hand);
			newSummary.openingFund += Number(branchMachine.sales.opening_fund);
			newSummary.cashCollection += Number(branchMachine.sales.cash_collection);
			newSummary.paymentReceived += Number(
				branchMachine.sales.total_payments_received,
			);
			newSummary.grossSales += Number(branchMachine.sales.gross_sales);

			return {
				key: branchMachine.id,
				machineName: branchMachine.name,
				paymentReceived: formatInPeso(
					Number(branchMachine.sales.total_payments_received),
				),
				openingFund: formatInPeso(branchMachine.sales.opening_fund),
				cashIn: formatInPeso(
					Math.abs(
						branchMachine.sales.cash_in - branchMachine.sales.opening_fund,
					),
				), // The value of opening fund and cashin should be separated if opening fund is present in the report
				cashOut: formatInPeso(branchMachine.sales.cash_out),
				cashCollection: formatInPeso(branchMachine.sales.cash_collection),
				cashOnHand: formatInPeso(branchMachine.sales.cash_on_hand),
				cashInvoice: formatInPeso(branchMachine.sales.cash_sales),
				chargeInvoice: formatInPeso(branchMachine.sales.credit_sales),
				grossSales: formatInPeso(branchMachine.sales.gross_sales),
				returns: formatInPeso(branchMachine.sales.returns),
				voidedTransactions: formatInPeso(branchMachine.sales.voided_total),
				discounts: formatInPeso(branchMachine.sales.discount),
				vatAmount: formatInPeso(branchMachine.sales.vat_amount),
				netSales: formatInPeso(branchMachine.sales.net_sales),
			};
		});

		setSummary(newSummary);
		setDataSource(data);
	}, [branchMachines]);

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<RequestErrors
					errors={convertIntoArray(branchMachinesError)}
					withSpaceBottom
				/>

				<TimeRangeFilter />
			</Col>

			<Col span={24}>
				<div className="Summary">
					<Row gutter={[16, 16]}>
						<Col md={4}>
							<Statistic
								title="Gross Sales of the Day"
								value={formatInPeso(summary.paymentReceived)}
							/>
						</Col>
						<Col md={4}>
							<Statistic
								title="Cash Sales Invoice"
								value={formatInPeso(summary.cashInvoice)}
							/>
						</Col>
						<Col md={4}>
							<Statistic
								title="Charge Sales Invoice"
								value={formatInPeso(summary.chargeInvoice)}
							/>
						</Col>
					</Row>
				</div>
			</Col>

			<Col span={24}>
				<div className="Summary">
					<Row gutter={[16, 16]}>
						<Col md={4}>
							<Statistic
								title="Cash On Hand"
								value={[
									summary.cashOnHand < 0 ? '(' : '',
									formatInPeso(Math.abs(summary.cashOnHand)),
									summary.cashOnHand < 0 ? ')' : '',
								].join('')}
							/>
						</Col>
						<Col md={4}>
							<Statistic
								title="Payment Received"
								value={formatInPeso(summary.paymentReceived)}
							/>
						</Col>
						<Col md={4}>
							<Statistic
								title="Opening Fund"
								value={formatInPeso(summary.openingFund)}
							/>
						</Col>
						<Col md={4}>
							<Statistic
								title="Cash In"
								value={formatInPeso(
									Math.abs(summary.cashIn - summary.openingFund),
								)}
							/>
						</Col>
						<Col md={4}>
							<Statistic
								title="Cash Out"
								value={formatInPeso(summary.cashOut)}
							/>
						</Col>
						<Col md={4}>
							<Statistic
								title="Cash Collection"
								value={formatInPeso(summary.cashCollection)}
							/>
						</Col>
					</Row>
				</div>
			</Col>

			<Col span={24}>
				<Table
					columns={columns}
					dataSource={dataSource}
					loading={isFetchingBranchMachines && !isBranchMachinesFetched}
					pagination={false}
					scroll={{ x: 1500 }}
					bordered
				/>
			</Col>
		</Row>
	);
};
