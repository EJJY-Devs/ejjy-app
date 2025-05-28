/* eslint-disable no-underscore-dangle */
import { Button, Col, Row, Select, Space, Table } from 'antd';
import { Content, RequestErrors, TimeRangeFilter } from 'components';
import { Box, Label } from 'components/elements';
import { Cart } from 'screens/Shared/Cart';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, EMPTY_CELL } from 'global';
import { useQueryParams, useRequisitionSlips } from 'hooks';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { convertIntoArray, formatDateTime } from 'utils';
import { capitalize } from 'lodash';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
	{ title: 'Type', dataIndex: 'type' },
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
		},
	});

	// METHODS
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const {
				id,
				datetime_created,
				reference_number,
				slip_type,
			} = requisitionSlip;

			return {
				key: id,
				id: (
					<Link to={`/branch-manager/requisition-slips/${id}`}>
						{reference_number}
					</Link>
				),
				type: capitalize(slip_type) || EMPTY_CELL,
				datetimeCreated: formatDateTime(datetime_created),
				status: EMPTY_CELL,
				remarks: EMPTY_CELL,
			};
		});

		setDataSource(formattedProducts);
	}, [requisitionSlips]);

	return (
		<>
			<Content title="Requisition Slips">
				<Box className="px-6">
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

					<Filter isLoading={isFetchingRequisitionSlips} />
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

const Filter = ({ isLoading }) => {
	const { params, setQueryParams } = useQueryParams();

	return (
		<Row className="mb-4" gutter={[24, 24]}>
			<Col span={24}>
				<div className="mb-3">
					<TimeRangeFilter disabled={isLoading} />
				</div>
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
								setQueryParams({ slipType: value }, { shouldResetPage: true });
							}}
						>
							<Select.Option value="customer">Customer</Select.Option>
							<Select.Option value="vendor">Vendor</Select.Option>
						</Select>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};
