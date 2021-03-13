/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import { Pagination } from 'antd';
import { upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table } from '../../../components';
import { Box } from '../../../components/elements';
import { TableHeaderRequisitionSlip } from '../../../components/Table/TableHeaders/TableHeaderRequisitionSlip';
import { EMPTY_CELL } from '../../../global/constants';
import { requisitionSlipActionsOptionsWithAll } from '../../../global/options';
import { request, requisitionSlipActions, userTypes } from '../../../global/types';
import { useRequisitionSlips } from '../../../hooks/useRequisitionSlips';
import {
	calculateTableHeight,
	formatDateTime,
	getRequisitionSlipStatus,
} from '../../../utils/function';
import { useBranches } from '../hooks/useBranches';
import './style.scss';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date Requested', dataIndex: 'datetime_created' },
	{ title: 'Requestor', dataIndex: 'requestor' },
	{ title: 'Request Type', dataIndex: 'type' },
	{ title: 'Actions', dataIndex: 'action' },
	{ title: 'Progress', dataIndex: 'progress' },
];

const pendingRequisitionSlipActions = [
	requisitionSlipActions.NEW,
	requisitionSlipActions.SEEN,
	requisitionSlipActions.F_OS1_CREATING,
	requisitionSlipActions.F_OS1_CREATED,
	requisitionSlipActions.F_OS1_PREPARING,
	requisitionSlipActions.F_OS1_PREPARED,
	requisitionSlipActions.F_DS1_CREATING,
	requisitionSlipActions.F_DS1_CREATED,
];

const PAGE_SIZE = 10;

const RequisitionSlips = () => {
	// STATES
	const [data, setData] = useState([]);
	const [selectedStatus, setSelectedStatus] = useState('all');
	const [selectedBranch, setSelectedBranch] = useState('all');

	// CUSTOM HOOKS
	const { branches } = useBranches();
	const {
		requisitionSlips,
		pageCount,
		currentPage,
		getRequisitionSlipsExtended,
		status,
	} = useRequisitionSlips({
		pageSize: PAGE_SIZE,
	});

	// METHODS
	// Effect: Format requisitionSlips to be rendered in Table
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const { id, type, requesting_user, progress, action: prAction } = requisitionSlip;
			const { datetime_created, action } = prAction;
			const dateTime = formatDateTime(datetime_created);

			return {
				_id: id,
				_datetime_created: dateTime,
				_type: type,
				_status: action,
				_branch: requesting_user.branch.id,
				id: <Link to={`/requisition-slips/${id}`}>{id}</Link>,
				datetime_created: dateTime,
				requestor: requesting_user.branch.name,
				type: upperFirst(type),
				action: getRequisitionSlipStatus(action, userTypes.OFFICE_MANAGER),
				progress: progress ? `${progress.current} / ${progress.total}` : EMPTY_CELL,
			};
		});

		setData(formattedProducts);
	}, [requisitionSlips]);

	// Filter by status and branch
	useEffect(() => {
		getRequisitionSlipsExtended(
			{
				branchId: selectedBranch === 'all' ? null : selectedBranch,
				status: selectedStatus === 'all' ? null : selectedStatus,
				page: 1,
			},
			true,
		);
	}, [selectedStatus, selectedBranch]);

	const getBranchOptions = useCallback(
		() => [
			{
				value: 'all',
				name: 'All',
			},
			...branches.map(({ id, name }) => ({ value: id, name })),
		],
		[branches],
	);

	const getPendingCount = useCallback(
		() =>
			requisitionSlips.filter(({ action }) =>
				pendingRequisitionSlipActions.includes(action?.action),
			).length,
		[requisitionSlips],
	);

	const onPageChange = (page) => {
		getRequisitionSlipsExtended({
			branchId: selectedBranch === 'all' ? null : selectedBranch,
			status: selectedStatus === 'all' ? null : selectedStatus,
			page,
		});
	};

	return (
		<Container title="F-RS1" description="Requests from branches">
			<section className="RequisitionSlips">
				<Box>
					<TableHeaderRequisitionSlip
						statuses={requisitionSlipActionsOptionsWithAll}
						onStatusSelect={(status) => setSelectedStatus(status)}
						branches={getBranchOptions()}
						onBranchSelect={(branch) => setSelectedBranch(branch)}
						pending={getPendingCount()}
					/>

					<Table
						columns={columns}
						dataSource={data}
						scroll={{ y: calculateTableHeight(data.length), x: '100%' }}
						loading={status === request.REQUESTING}
					/>

					<Pagination
						className="table-pagination"
						current={currentPage}
						total={pageCount}
						pageSize={PAGE_SIZE}
						onChange={onPageChange}
						disabled={!data}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default RequisitionSlips;
