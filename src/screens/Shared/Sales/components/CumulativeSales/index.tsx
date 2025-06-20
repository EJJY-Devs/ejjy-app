import { Col, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import { RequestErrors, TimeRangeFilter } from 'components';
import { MAX_PAGE_SIZE, refetchOptions, timeRangeTypes } from 'global';
import { useBranchMachines, useQueryParams } from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, formatInPeso } from 'utils';

const columns: ColumnsType = [
	{
		title: 'Total Gross Sales of the Day',
		dataIndex: 'totalGrossSalesOfTheDay',
		fixed: 'left',
		width: 180,
	},
	{
		title: 'Total Cash Sales Invoice',
		dataIndex: 'totalCashSalesInvoice',
		width: 150,
	},
	{
		title: 'Total Charge Sales Invoice',
		dataIndex: 'totalChargeSalesInvoice',
		width: 150,
	},
	{
		title: 'Total Payments Received',
		dataIndex: 'totalPaymentsReceived',
		width: 150,
	},
];

export const CumulativeSales = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params } = useQueryParams();
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		isFetched: isBranchMachinesFetched,
		error: branchMachinesError,
	} = useBranchMachines({
		params: {
			pageSize: MAX_PAGE_SIZE,
			salesTimeRange: params.timeRange || timeRangeTypes.DAILY,
		},
		options: {
			...refetchOptions,
		},
	});

	// METHODS
	useEffect(() => {
		const grossSalesArr = (branchMachines ?? []).map((bm: any) =>
			Number(bm.sales.gross_sales),
		);
		const cashSalesArr = (branchMachines ?? []).map((bm: any) =>
			Number(bm.sales.total_cash_sales_payments),
		);
		const chargeSalesArr = (branchMachines ?? []).map((bm: any) =>
			Number(bm.sales.total_charge_sales_payments),
		);
		const paymentsReceivedArr = (branchMachines ?? []).map((bm: any) =>
			Number(bm.sales.total_payments_received),
		);

		const totalGrossSalesOfTheDay = grossSalesArr.reduce((a, b) => a + b, 0);
		const totalCashSalesInvoice = cashSalesArr.reduce((a, b) => a + b, 0);
		const totalChargeSalesInvoice = chargeSalesArr.reduce((a, b) => a + b, 0);
		const totalPaymentsReceived = paymentsReceivedArr.reduce(
			(a, b) => a + b,
			0,
		);

		setDataSource([
			{
				key: 'total',
				totalGrossSalesOfTheDay: formatInPeso(totalGrossSalesOfTheDay),
				totalCashSalesInvoice: formatInPeso(totalCashSalesInvoice),
				totalChargeSalesInvoice: formatInPeso(totalChargeSalesInvoice),
				totalPaymentsReceived: formatInPeso(totalPaymentsReceived),
			},
		]);
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
				<div style={{ overflowX: 'auto' }}>
					<Table
						columns={columns}
						dataSource={dataSource}
						loading={isFetchingBranchMachines && !isBranchMachinesFetched}
						pagination={false}
						scroll={{ x: 'max-content' }}
						bordered
					/>
				</div>
			</Col>
		</Row>
	);
};
