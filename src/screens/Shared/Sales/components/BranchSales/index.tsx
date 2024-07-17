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
	{ title: 'Cash Sales', dataIndex: 'cashSales' },
	{ title: 'Credit Payments', dataIndex: 'creditPayments' },
	{ title: 'Cash In', dataIndex: 'cashIn' },
	{ title: 'Cash Out', dataIndex: 'cashOut' },
	{ title: 'Cash On Hand', dataIndex: 'cashOnHand' },
	{ title: 'Credit Sales', dataIndex: 'creditSales' },
	{ title: 'Gross Sales of the Day', dataIndex: 'grossSales' },
	{ title: 'Voided Transactions', dataIndex: 'voidedTransactions' },
	{ title: 'Discounts', dataIndex: 'discounts' },
	{ title: 'Net Sales (VAT Inclusive)', dataIndex: 'netSalesVAT' },
	{ title: 'VAT Amount (12%)', dataIndex: 'vatAmount' },
	{ title: 'Net Sales (VAT Exclusive)', dataIndex: 'netSalesNVAT' },
];

const summaryInitialValues = {
	cashSales: 0,
	creditSales: 0,
	creditPayments: 0,
	cashOut: 0,
	cashIn: 0,
	cashOnHand: 0,
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
			newSummary.cashSales += Number(branchMachine.sales.cash_sales);
			newSummary.creditSales += Number(branchMachine.sales.credit_sales);
			newSummary.creditPayments += Number(branchMachine.sales.credit_payments);
			newSummary.cashIn += Number(branchMachine.sales.cash_in);
			newSummary.cashOut += Number(branchMachine.sales.cash_out);
			newSummary.cashOnHand += Number(branchMachine.sales.cash_on_hand);

			return {
				key: branchMachine.id,
				machineName: branchMachine.name,
				cashSales: formatInPeso(branchMachine.sales.cash_sales),
				creditPayments: formatInPeso(branchMachine.sales.credit_payments),
				cashIn: formatInPeso(branchMachine.sales.cash_in),
				cashOut: formatInPeso(branchMachine.sales.cash_out),
				cashOnHand: formatInPeso(branchMachine.sales.cash_on_hand),
				creditSales: formatInPeso(branchMachine.sales.credit_sales),
				grossSales: formatInPeso(branchMachine.sales.gross_sales),
				voidedTransactions: formatInPeso(branchMachine.sales.voided_total),
				discounts: formatInPeso(branchMachine.sales.discount),
				netSalesVAT: formatInPeso(branchMachine.sales.net_sales_vat_inclusive),
				vatAmount: formatInPeso(branchMachine.sales.vat_amount),
				netSalesNVAT: formatInPeso(branchMachine.sales.net_sales_vat_exclusive),
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
						<Col md={5}>
							<Statistic
								title="Gross Sales of the Day"
								value={formatInPeso(summary.cashSales + summary.creditSales)}
							/>
						</Col>
						<Col md={5}>
							<Statistic
								title="Cash Sales"
								value={formatInPeso(summary.cashSales)}
							/>
						</Col>
						<Col md={5}>
							<Statistic
								title="Credit Sales"
								value={formatInPeso(summary.creditSales)}
							/>
						</Col>
					</Row>
				</div>
			</Col>

			<Col span={24}>
				<div className="Summary">
					<Row gutter={[16, 16]}>
						<Col md={5}>
							<Statistic
								title="Cash On Hand"
								value={[
									summary.cashOnHand < 0 ? '(' : '',
									formatInPeso(Math.abs(summary.cashOnHand)),
									summary.cashOnHand < 0 ? ')' : '',
								].join('')}
							/>
						</Col>
						<Col md={5}>
							<Statistic
								title="Cash Sales"
								value={formatInPeso(summary.cashSales)}
							/>
						</Col>
						<Col md={5}>
							<Statistic
								title="Credit Payments"
								value={formatInPeso(summary.creditPayments)}
							/>
						</Col>
						<Col md={5}>
							<Statistic title="Cash In" value={formatInPeso(summary.cashIn)} />
						</Col>
						<Col md={4}>
							<Statistic
								title="Cash Out"
								value={formatInPeso(summary.cashOut)}
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
