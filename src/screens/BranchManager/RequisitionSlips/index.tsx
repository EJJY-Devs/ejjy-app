/* eslint-disable no-underscore-dangle */
import { Button, Col, Row, Select, Space, Table } from 'antd';
import { Content, RequestErrors } from 'components';
import { Box, Label } from 'components/elements';
import {
	filterOption,
	getRequestor,
	formatRequisitionSlipId,
} from 'ejjy-global';
import { Cart } from 'screens/Shared/Cart';
import {
	ALL_OPTION_KEY,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	requisitionSlipActionsOptionsWithAll,
} from 'global';
import { useQueryParams, useRequisitionSlips } from 'hooks';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { convertIntoArray, formatDateTime, getLocalBranchId } from 'utils';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'DateTime', dataIndex: 'datetimeCreated' },
	{ title: 'Branch', dataIndex: 'branch' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'Remarks', dataIndex: 'remarks' },
];

export const RequisitionSlips = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { requisitionSlips, total },
		isFetching: isFetchingRequisitionSlips,
		error: listError,
	} = useRequisitionSlips({
		params: {
			...params,
			branchId: getLocalBranchId(),
			status: params.status === ALL_OPTION_KEY ? null : params.status,
		},
	});

	// METHODS
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const { id, action: prAction, branch } = requisitionSlip;

			const { datetime_created } = prAction;
			const dateTime = formatDateTime(datetime_created);

			return {
				key: id,
				id: (
					<Link to={`/branch-manager/requisition-slips/${id}`}>
						{formatRequisitionSlipId(id)}
					</Link>
				),
				branch: branch?.name || EMPTY_CELL,
				datetimeCreated: dateTime,
				requestor: getRequestor(requisitionSlip),
				status: EMPTY_CELL,
				remarks: EMPTY_CELL,
			};
		});

		setDataSource(formattedProducts);
	}, [requisitionSlips]);

	return (
		<>
			<Content title="Requisition Slips">
				<Box>
					<div className="pa-6 d-flex justify-end">
						<Space>
							<Button
								type="primary"
								onClick={() => {
									setIsCartModalVisible(true);
								}}
							>
								Create Requisition Slip
							</Button>
						</Space>
					</div>

					<RequestErrors
						className="px-6"
						errors={[
							// ...convertIntoArray(retrieveError, 'Pending Count'),
							...convertIntoArray(listError),
						]}
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
						scroll={{ x: 1000 }}
						bordered
					/>
				</Box>
			</Content>

			{isCartModalVisible && (
				<Cart
					type="Requisition Slip"
					onClose={() => setIsCartModalVisible(false)}
				/>
			)}
		</>
	);
};

const Filter = () => {
	const { params, setQueryParams } = useQueryParams();

	return (
		<Row className="mb-4 px-6" gutter={[16, 16]}>
			<Col lg={12} span={24}>
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
	);
};
