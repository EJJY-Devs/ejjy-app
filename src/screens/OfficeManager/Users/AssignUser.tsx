/* eslint-disable react-hooks/exhaustive-deps */
import { Divider } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import {
	AddButtonIcon,
	CancelButtonIcon,
	Container,
	DetailsRow,
	DetailsSingle,
	Table,
} from '../../../components';
import { Box, Select } from '../../../components/elements';
import { request } from '../../../global/types';
import { calculateTableHeight } from '../../../utils/function';
import { useBranchMachines } from '../hooks/useBranchMachines';
import { useCashieringAssignments } from '../hooks/useCashieringAssignments';
import { useUsers } from '../hooks/useUsers';
import { types } from '../../../ducks/OfficeManager/cashiering-assignments';
import './style.scss';
import { useHistory } from 'react-router-dom';

const columns = [
	{ title: 'Date', dataIndex: 'date' },
	{ title: 'Day', dataIndex: 'day' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const AssignUser = ({ match }) => {
	const userId = match?.params?.id;
	const history = useHistory();

	const [data, setData] = useState([]);

	const { user, getUserById, status: userStatus } = useUsers();
	const {
		cashieringAssignments,
		getCashieringAssignmentsByUserId,
		createCashieringAssignment,
		editCashieringAssignment,
		removeCashieringAssignment,
		status: cashieringAssignmentsStatus,
		recentRequest: cashieringAssignmentsRecentRequest,
	} = useCashieringAssignments();
	const { branchMachines } = useBranchMachines();

	useEffect(() => {
		getUserById(userId, userDoesNotExistCallback);
		getCashieringAssignmentsByUserId(userId);
	}, []);

	const userDoesNotExistCallback = ({ status }) => {
		if (status === request.ERROR) {
			history.replace('/404');
		}
	};

	// Effect: Format cashiering assignments
	useEffect(() => {
		if (user && cashieringAssignments && branchMachines) {
			const days = getDays();
			const machineOptions = getMachineOptions();

			const formattedAssignments = days.map((item) => {
				const assignment = cashieringAssignments.find((ca) =>
					dayjs(ca.date, 'YYYY-MM-DD', true).isSame(item.date, 'date'),
				);

				return {
					date: item.display,
					day: item.day,
					actions: assignment ? (
						<div className="machine-selection">
							<Select
								classNames="select"
								options={machineOptions}
								placeholder="Cashiering Machines"
								value={assignment.branch_machine_id}
								onChange={(value) => onChangeAssignment(assignment.id, value)}
							/>
							<CancelButtonIcon
								tooltip="Remove"
								onClick={() => onRemoveAssignment(assignment.id)}
							/>
						</div>
					) : (
						<AddButtonIcon tooltip="Assign" onClick={() => onAssign(item.date)} />
					),
				};
			});

			setData(formattedAssignments);
		}
	}, [user, cashieringAssignments, branchMachines]);

	const onAssign = (date) => {
		if (branchMachines.length) {
			createCashieringAssignment({
				user_id: userId,
				branch_machine_id: branchMachines[0].id,
				date: date.format('YYYY-MM-DD'),
			});
		}
	};

	const onChangeAssignment = (assignmentId, branchMachineId) => {
		editCashieringAssignment({
			id: assignmentId,
			branch_machine_id: Number(branchMachineId),
		});
	};

	const onRemoveAssignment = (assignmentId) => {
		removeCashieringAssignment(assignmentId);
	};

	const getDays = useCallback(() => {
		const numberOfDays = dayjs().daysInMonth();
		const days = [];
		const today = dayjs().date();

		for (let i = today; i <= numberOfDays; i++) {
			const date = dayjs().date(i);
			days.push({
				date,
				display: date.format('MMM D, YYYY'),
				day: date.format('ddd'),
			});
		}

		for (let i = 1; i < today; i++) {
			const date = dayjs().date(i);
			days.push({
				date,
				display: date.format('MMM D, YYYY'),
				day: date.format('ddd'),
			});
		}

		return days;
	}, []);

	const getMachineOptions = useCallback(() => {
		return branchMachines.map((machine) => ({
			name: machine.name,
			value: machine.id,
		}));
	}, [branchMachines]);

	const isFetching = useCallback(
		() =>
			(cashieringAssignmentsStatus === request.REQUESTING &&
				cashieringAssignmentsRecentRequest === types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID) ||
			userStatus === request.REQUESTING,
		[cashieringAssignmentsStatus, cashieringAssignmentsRecentRequest, userStatus],
	);

	const isChangingAssignments = useCallback(
		() =>
			cashieringAssignmentsStatus === request.REQUESTING &&
			cashieringAssignmentsRecentRequest !== types.GET_CASHIERING_ASSIGNMENTS_BY_USER_ID,
		[cashieringAssignmentsStatus, cashieringAssignmentsRecentRequest, userStatus],
	);

	return (
		<Container title="Assign User" loading={isFetching()} loadingText="Fetching user details...">
			<section className="AssignUsers">
				<Box>
					<div className="details">
						<DetailsRow>
							<DetailsSingle label="Name" value={`${user?.first_name} ${user?.last_name}`} />
							<DetailsSingle label="Branch" value={user?.branch?.name} />
						</DetailsRow>
					</div>

					<div className="cashiering-assignments">
						<Divider dashed />
						<DetailsRow>
							<DetailsSingle label="Assignments" value="" />
						</DetailsRow>
					</div>

					<Table
						columns={columns}
						dataSource={data}
						scroll={{ y: calculateTableHeight(data.length), x: '100%' }}
						loading={isChangingAssignments()}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default AssignUser;
