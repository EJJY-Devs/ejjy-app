import { QuestionCircleOutlined } from '@ant-design/icons';
import { Col, Row, Select, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import {
	useBranches,
	useBranchMachines,
	useQueryParams,
	useSubsidiarySales,
} from 'hooks';
import React, { useMemo } from 'react';
import { formatDateTime, formatInPeso } from 'utils';

export interface SubsidiarySaleEntry {
	id: number;
	date: string;
	payor?: string | null;
	tin?: string | null;
	invoice: string;
	description?: string | null;
	salesVatExclusive: number;
	vatOutput: number;
	totalSales: number;
	collectionReference?: string | null;
	remarks?: string | null;
}

interface Props {
	isHeadOffice: boolean;
	localBranchId: number;
}

const notYetAvailableTooltip = (
	<Tooltip title="Not yet computed — what this column should hold is still being confirmed on the BIR Compliance card.">
		<QuestionCircleOutlined />
	</Tooltip>
);

export const SubsidiarySalesTab = ({ isHeadOffice, localBranchId }: Props) => {
	const { params, setQueryParams } = useQueryParams();
	const { data: { branches } = { branches: [] } } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const selectedBranchId = useMemo(() => {
		if (!isHeadOffice) return localBranchId || undefined;
		if (params.branchId === 'all' || !params.branchId) return undefined;
		return Number(params.branchId);
	}, [isHeadOffice, localBranchId, params.branchId]);

	const selectedBranchMachineId = useMemo(() => {
		if (params.branchMachineId === 'all' || !params.branchMachineId) {
			return undefined;
		}
		return Number(params.branchMachineId);
	}, [params.branchMachineId]);

	const {
		data: { branchMachines } = { branchMachines: [] },
	} = useBranchMachines({
		params: {
			branchId: selectedBranchId,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const {
		data: { subsidiarySales, total },
		isFetching,
	} = useSubsidiarySales({
		params: {
			page: params.page,
			pageSize: params.pageSize,
			timeRange: params.subsidiarySalesTimeRange,
			...(selectedBranchId && { branchId: selectedBranchId }),
			...(selectedBranchMachineId && {
				branchMachineId: selectedBranchMachineId,
			}),
		},
	});

	const entries: SubsidiarySaleEntry[] = (subsidiarySales || []).map(
		(entry: any) => ({
			id: entry.id,
			date: formatDateTime(entry.date, true),
			payor: entry.payor,
			tin: entry.tin,
			invoice: entry.invoice,
			description: entry.description,
			salesVatExclusive: entry.sales_vat_exclusive,
			vatOutput: entry.vat_output,
			totalSales: entry.total_sales,
			collectionReference: entry.collection_reference,
			remarks: entry.remarks,
		}),
	);

	const columns: ColumnsType<SubsidiarySaleEntry> = [
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			align: 'left',
		},
		{
			title: 'Payor',
			dataIndex: 'payor',
			key: 'payor',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'TIN',
			dataIndex: 'tin',
			key: 'tin',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'Invoice',
			dataIndex: 'invoice',
			key: 'invoice',
			align: 'left',
		},
		{
			title: <>Description {notYetAvailableTooltip}</>,
			dataIndex: 'description',
			key: 'description',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: 'Sales / Income - VAT Exclusive',
			dataIndex: 'salesVatExclusive',
			key: 'salesVatExclusive',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'VAT Output',
			dataIndex: 'vatOutput',
			key: 'vatOutput',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: 'Total Sales',
			dataIndex: 'totalSales',
			key: 'totalSales',
			align: 'left',
			render: (value: number) => formatInPeso(value, '₱ '),
		},
		{
			title: <>Collection Reference {notYetAvailableTooltip}</>,
			dataIndex: 'collectionReference',
			key: 'collectionReference',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
		{
			title: <>Remarks {notYetAvailableTooltip}</>,
			dataIndex: 'remarks',
			key: 'remarks',
			align: 'left',
			render: (value: string | null) => value || EMPTY_CELL,
		},
	];

	return (
		<>
			<div className="BooksOfAccounts_header">
				<Row className="BooksOfAccounts_filters" gutter={[16, 16]}>
					<Col className="BooksOfAccounts_timeRangeFilter">
						<TimeRangeFilter
							dateRangeLabel="Select Date"
							queryName="subsidiarySalesTimeRange"
							useSingleDateForDateRange
						/>
					</Col>
					{isHeadOffice && (
						<Col className="BooksOfAccounts_timeRangeFilter" lg={4}>
							<Label label="Branch" spacing />
							<Select
								className="w-100"
								optionFilterProp="children"
								placeholder="Select Branch"
								value={(() => {
									if (params.branchId === 'all') return 'all';
									if (params.branchId) return Number(params.branchId);
									return undefined;
								})()}
								allowClear
								showSearch
								onChange={(value) => {
									setQueryParams(
										{ branchId: value, branchMachineId: undefined },
										{ shouldResetPage: true },
									);
								}}
							>
								<Select.Option value="all">All</Select.Option>
								{branches.map(({ id, name }: any) => (
									<Select.Option key={id} value={id}>
										{name}
									</Select.Option>
								))}
							</Select>
						</Col>
					)}
					<Col className="BooksOfAccounts_timeRangeFilter" lg={4}>
						<Label label="Branch Machine" spacing />
						<Select
							className="w-100"
							optionFilterProp="children"
							placeholder="Select Branch Machine"
							value={(() => {
								if (params.branchMachineId === 'all') return 'all';
								if (params.branchMachineId)
									return Number(params.branchMachineId);
								return undefined;
							})()}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams(
									{ branchMachineId: value },
									{ shouldResetPage: true },
								);
							}}
						>
							<Select.Option value="all">All</Select.Option>
							{branchMachines.map(({ id, name }: any) => (
								<Select.Option key={id} value={id}>
									{name}
								</Select.Option>
							))}
						</Select>
					</Col>
				</Row>
			</div>
			<Table
				className="BooksOfAccounts_table"
				columns={columns}
				dataSource={entries}
				loading={isFetching}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, pageSize) => {
						setQueryParams({
							page,
							pageSize,
						});
					},
					disabled: !entries?.length,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				rowKey="id"
				scroll={{ x: 1500 }}
				bordered
			/>
		</>
	);
};
