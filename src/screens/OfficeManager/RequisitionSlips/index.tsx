import { Col, Row, Select, Table } from 'antd';
import {
	Content,
	RequestErrors,
	TableHeaderRequisitionSlip,
	TimeRangeFilter,
} from 'components';
import { Box, Label } from 'components/elements';
import { filterOption } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
} from 'global';
import { useQueryParams, useRequisitionSlips, useBranches } from 'hooks';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { convertIntoArray, formatDateTime } from 'utils';
import './style.scss';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
	{ title: 'Customer', dataIndex: 'branch' },
	{ title: 'Vendor', dataIndex: 'vendor' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'Remarks', dataIndex: 'overallRemarks' },
];

export const RequisitionSlips = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { requisitionSlips, total },
		isFetching: isFetchingRequisitionSlips,
		error: listError,
	} = useRequisitionSlips({
		params: {
			...params,
		},
	});

	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// METHODS
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const {
				id,
				branch,
				datetime_created,
				reference_number,
				vendor,
				overall_remarks,
			} = requisitionSlip;

			return {
				key: id,
				id: (
					<Link to={`/office-manager/requisition-slips/${id}`}>
						{reference_number}
					</Link>
				),
				branch: branch?.name || EMPTY_CELL,
				vendor: vendor?.name || EMPTY_CELL,
				datetimeCreated: formatDateTime(datetime_created),
				status: EMPTY_CELL,
				overallRemarks: overall_remarks,
			};
		});

		setDataSource(formattedProducts);
	}, [requisitionSlips]);

	return (
		<Content className="RequisitionSlips" title="Requisition Slips">
			<Box className="px-6">
				<TableHeaderRequisitionSlip />

				<RequestErrors
					className="px-6"
					errors={[
						...convertIntoArray(listError),
						...convertIntoArray(branchErrors),
					]}
					withSpaceBottom
				/>

				<Filter
					branches={branches}
					isLoading={isFetchingRequisitionSlips || isFetchingBranches}
				/>

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={isFetchingRequisitionSlips}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total,
						pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
						onChange: (page, newPageSize) => {
							setQueryParams({
								page,
								pageSize: newPageSize,
							});
						},
						disabled: !dataSource,
						position: ['bottomCenter'],
						pageSizeOptions: ['5', '10', '15'],
					}}
					bordered
				/>
			</Box>
		</Content>
	);
};

const Filter = ({ isLoading, branches }) => {
	const { params, setQueryParams } = useQueryParams();
	return (
		<Row className="mb-4" gutter={[24, 24]}>
			<Col span={24}>
				<div className="mb-3">
					<TimeRangeFilter disabled={isLoading} />
				</div>
				<Row gutter={16}>
					<Col style={{ minWidth: 500 }}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							defaultValue={
								params.branchId ? Number(params.branchId) : undefined
							}
							disabled={isLoading}
							filterOption={filterOption}
							optionFilterProp="children"
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams({ branchId: value }, { shouldResetPage: true });
							}}
						>
							{branches?.map(({ id, name }) => (
								<Select.Option key={id} value={id}>
									{name}
								</Select.Option>
							))}
						</Select>
					</Col>

					<Row gutter={16}>
						<Col style={{ minWidth: 500 }}>
							<Label label="Type" spacing />
							<Select
								className="w-100"
								defaultValue={params.slipType || undefined}
								disabled={isLoading}
								allowClear
								showSearch
								onChange={(value) => {
									setQueryParams(
										{ slipType: value },
										{ shouldResetPage: true },
									);
								}}
							>
								<Select.Option value="customer">Customer</Select.Option>
								<Select.Option value="vendor">Vendor</Select.Option>
							</Select>
						</Col>
					</Row>
				</Row>
			</Col>
		</Row>
	);
};
