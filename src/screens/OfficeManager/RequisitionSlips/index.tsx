import { Col, Row, Select, Table } from 'antd';
import { Content, RequestErrors, TableHeaderRequisitionSlip } from 'components';
import { Box, Label } from 'components/elements';
import {
	filterOption,
	useBranches,
	ServiceType,
	formatRequisitionSlipId,
} from 'ejjy-global';
import {
	ALL_OPTION_KEY,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	requisitionSlipActionsOptionsWithAll,
	MAX_PAGE_SIZE,
} from 'global';
import { useQueryParams, useRequisitionSlips } from 'hooks';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
	convertIntoArray,
	formatDateTime,
	getLocalApiUrl,
	isStandAlone,
} from 'utils';
import './style.scss';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
	{ title: 'Branch', dataIndex: 'branch' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'Remarks', dataIndex: 'remarks' },
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
			branchId: params.branchId === ALL_OPTION_KEY ? null : params.branchId,
			status: params.status === ALL_OPTION_KEY ? null : params.status,
		},
	});

	// METHODS
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const { id, branch, datetime_created } = requisitionSlip;

			return {
				key: id,
				id: (
					<Link to={`/office-manager/requisition-slips/${id}`}>
						{formatRequisitionSlipId(id)}
					</Link>
				),
				branch: branch?.name || EMPTY_CELL,
				datetimeCreated: formatDateTime(datetime_created),
				status: EMPTY_CELL,
				remarks: EMPTY_CELL,
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
					errors={[...convertIntoArray(listError)]}
					withSpaceBottom
				/>

				<Filter />

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

const Filter = () => {
	const { data: branchesData } = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	const { params, setQueryParams } = useQueryParams();
	return (
		<>
			<Row className="mb-4" gutter={[16, 16]}>
				<Col lg={5} span={24}>
					<Label label="Branch" spacing />
					<Select
						className="w-100"
						defaultValue={
							params.branchId ? Number(params.branchId) : ALL_OPTION_KEY
						}
						filterOption={filterOption}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ branchId: value }, { shouldResetPage: true });
						}}
					>
						<Select.Option value="all">All</Select.Option>
						{branchesData?.list?.map(({ id, name }) => (
							<Select.Option key={id} value={id}>
								{name}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>

			<Row className="pb-4" gutter={[16, 16]}>
				<Col lg={5} span={24}>
					<Label label="Status" spacing />
					<Select
						className="w-100"
						defaultValue={params.status || ALL_OPTION_KEY}
						filterOption={filterOption}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ status: value }, { shouldResetPage: true });
						}}
					>
						{requisitionSlipActionsOptionsWithAll.map(({ name, value }) => (
							<Select.Option key={value} value={value}>
								{name}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>
		</>
	);
};
