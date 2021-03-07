/* eslint-disable react-hooks/exhaustive-deps */
import { Divider, message } from 'antd';
import cn from 'classnames';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
	AddButtonIcon,
	CancelButtonIcon,
	Container,
	DetailsRow,
	DetailsSingle,
	Table,
} from '../../../components';
import { Box, Select } from '../../../components/elements';
import { types } from '../../../ducks/OfficeManager/cashiering-assignments';
import { request, userTypes } from '../../../global/types';
import { calculateTableHeight } from '../../../utils/function';
import { useBranchMachines } from '../../../hooks/useBranchMachines';
import { useCashieringAssignments } from '../hooks/useCashieringAssignments';
import { useUsers } from '../hooks/useUsers';
import './style.scss';

const columns = [
	{ title: 'Date', dataIndex: 'date' },
	{ title: 'Day', dataIndex: 'day' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const AssignUser = ({ match }) => {
	// STATES
	const [data, setData] = useState([]);

	// CUSTOM HOOKS
	const userId = match?.params?.id;
	const history = useHistory();
	const { user, getUserById, status: userStatus } = useUsers();
	const { branchMachines, getBranchMachines, status: branchesMachinesStatus } = useBranchMachines();
	const {
		cashieringAssignments,
		getCashieringAssignmentsByUserId,
		createCashieringAssignment,
		editCashieringAssignment,
		removeCashieringAssignment,
		status: cashieringAssignmentsStatus,
		warnings: cashieringAssignmentsWarnings,
		recentRequest: cashieringAssignmentsRecentRequest,
	} = useCashieringAssignments();

	// METHODS
	useEffect(() => {
		getUserById(userId, userDoesNotExistCallback);
	}, []);

	useEffect(() => {
		if (cashieringAssignmentsStatus === request.SUCCESS && cashieringAssignmentsWarnings?.length) {
			cashieringAssignmentsWarnings?.forEach((warning) => {
				message.warning(warning);
			});
		}
	}, [cashieringAssignmentsStatus, cashieringAssignmentsWarnings]);

	const userDoesNotExistCallback = ({ status }) => {
		console.log('user?.user_type', user?.user_type);
		if (status === request.ERROR) {
			history.replace('/404');
		} else if (status === request.SUCCESS) {
			if ([userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL].includes(user?.user_type)) {
				console.log('test');
				getBranchMachines(user?.branch?.id);
				getCashieringAssignmentsByUserId({ userId, branchId: user?.branch?.id });
			}
		}
	};

	// Effect: Format cashiering assignments
	useEffect(() => {
		if (user && cashieringAssignments && branchMachines) {
			const today = dayjs();
			const days = getDays();
			const machineOptions = getMachineOptions();

			const formattedAssignments = days.map((item) => {
				const isDateAfter = today.isAfter(item.date);
				const assignment = cashieringAssignments.find((ca) =>
					dayjs(ca.date, 'YYYY-MM-DD').isSame(item.date, 'date'),
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
								disabled={isDateAfter}
							/>
							{!isDateAfter && (
								<CancelButtonIcon
									tooltip="Remove"
									onClick={() => onRemoveAssignment(assignment.id)}
								/>
							)}
						</div>
					) : (
						<AddButtonIcon
							classNames={cn('btn-assign', { disabled: isDateAfter })}
							tooltip="Assign"
							onClick={() => onAssign(item.date)}
						/>
					),
				};
			});

			setData(formattedAssignments);
		}
	}, [user, cashieringAssignments, branchMachines]);

	const onAssign = (date) => {
		console.log('branch machines', branchMachines.length);
		if (branchMachines.length) {
			createCashieringAssignment({
				user_id: userId,
				branchId: user?.branch?.id,
				branch_machine_id: branchMachines[0].id,
				date: date.format('YYYY-MM-DD'),
			});
		}
	};

	const onChangeAssignment = (assignmentId, branchMachineId) => {
		editCashieringAssignment({
			id: assignmentId,
			branchId: user?.branch?.id,
			branch_machine_id: Number(branchMachineId),
		});
	};

	const onRemoveAssignment = (assignmentId) => {
		removeCashieringAssignment({ id: assignmentId, branchId: user?.branch?.id });
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
			userStatus === request.REQUESTING ||
			branchesMachinesStatus === request.REQUESTING,
		[
			cashieringAssignmentsStatus,
			cashieringAssignmentsRecentRequest,
			userStatus,
			branchesMachinesStatus,
		],
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

					{[userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL].includes(user?.user_type) && (
						<>
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
						</>
					)}
				</Box>
			</section>
		</Container>
	);
};

export default AssignUser;
