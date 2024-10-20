/* eslint-disable no-underscore-dangle */
import { Button, Col, message, Row, Select, Space, Table } from 'antd';
import { Content, RequestErrors } from 'components';
import { Box, Label } from 'components/elements';
import { filterOption, getRequestor } from 'ejjy-global';
import {
	ALL_OPTION_KEY,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	requisitionSlipActionsOptionsWithAll,
	requisitionSlipTypes,
	userTypes,
} from 'global';
import {
	useQueryParams,
	useRequisitionSlipCreate,
	useRequisitionSlips,
} from 'hooks';
import { upperFirst } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDateTime,
	getRequisitionSlipStatus,
} from 'utils';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date Requested', dataIndex: 'datetimeCreated' },
	{ title: 'Requestor', dataIndex: 'requestor' },
	{ title: 'Request Type', dataIndex: 'type' },
	{ title: 'Actions', dataIndex: 'action' },
	{ title: 'Progress', dataIndex: 'progress' },
];

export const RequisitionSlips = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const history = useHistory();
	const user = useUserStore((state) => state.user);
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { requisitionSlips, total },
		isFetching: isFetchingRequisitionSlips,
		error: listError,
	} = useRequisitionSlips({
		params: {
			...params,
			// TODO: Temporarily remove branch id from the payload until we figure out to pass the online id
			// branchId: user?.branch?.id,
			status: params.status === ALL_OPTION_KEY ? null : params.status,
		},
	});
	const { mutateAsync: createRequisitionSlip } = useRequisitionSlipCreate();

	// TODO: Temporarily remove pending count until we figure out to pass the online id of user
	// const {
	// 	data: pendingCount,
	// 	isFetching: isFetchingPendingCount,
	// 	error: retrieveError,
	// } = useRequisitionSlipsRetrievePendingCount({
	// 	params: { userId: user.id },
	// });

	// METHODS
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const {
				id,
				type,
				requesting_user,
				progress,
				action: prAction,
			} = requisitionSlip;
			const { datetime_created, action } = prAction;
			const dateTime = formatDateTime(datetime_created);

			const isOwnRequisitionSlip =
				user?.branch_assignment?.branch?.id === requesting_user?.branch?.id;
			const _action = isOwnRequisitionSlip
				? getRequisitionSlipStatus(action, userTypes.BRANCH_MANAGER)
				: EMPTY_CELL;
			let _progress = progress
				? `${progress.current} / ${progress.total}`
				: EMPTY_CELL;
			_progress = isOwnRequisitionSlip ? _progress : EMPTY_CELL;

			return {
				key: id,
				id: <Link to={`/branch-manager/requisition-slips/${id}`}>{id}</Link>,
				datetimeCreated: dateTime,
				requestor: getRequestor(requisitionSlip),
				type: upperFirst(type),
				action: _action,
				progress: _progress,
			};
		});

		setDataSource(formattedProducts);
	}, [requisitionSlips]);

	return (
		<Content title="Requisition Slips">
			<Box>
				<div className="pa-6 d-flex justify-end">
					<Space>
						<Button
							type="primary"
							onClick={() => {
								history.push(
									'/branch-manager/requisition-slips/create/template',
								);
							}}
						>
							Create (From Template)
						</Button>
						<Button
							type="primary"
							onClick={() => {
								history.push({
									pathname: '/branch-manager/requisition-slips/create',
									state: {
										title: 'Requisition Slip',
										onSubmit: async (products) => {
											const response = await createRequisitionSlip({
												requestingUserUsername: user.username,
												type: requisitionSlipTypes.MANUAL,
												products: products.map((product) => ({
													key: product.key,
													quantity_piece: product.quantity,
												})),
											});

											message.success(
												'Requisition slip was created successfully.',
											);
											history.push('/branch-manager/requisition-slips');

											return response;
										},
									},
								});
							}}
						>
							Create (Manual)
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
					// loading={isFetchingPendingCount || isFetchingRequisitionSlips}
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
