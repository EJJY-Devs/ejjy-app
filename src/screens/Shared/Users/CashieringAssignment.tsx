import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, message, Row, Space, Table, Tooltip } from 'antd';
import {
	Breadcrumb,
	ConnectionAlert,
	Content,
	ModifyCashieringAssignmentModal,
	RequestErrors,
} from 'components';
import { Box } from 'components/elements';
import dayjs from 'dayjs';
import { getFullName, ServiceType, useUserRetrieve } from 'ejjy-global';
import { GENERIC_ERROR_MESSAGE, MAX_PAGE_SIZE, appTypes } from 'global';
import {
	useCashieringAssignmentDelete,
	useCashieringAssignments,
	usePingOnlineServer,
} from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	confirmPassword,
	convertIntoArray,
	getLocalApiUrl,
	getUrlPrefix,
	isStandAlone,
	getAppType,
} from 'utils';

const columns = [
	{ title: 'Date', dataIndex: 'date', width: 175 },
	{ title: 'Day', dataIndex: 'day', width: 100 },
	{ title: 'Assignments', dataIndex: 'assignments' },
	{ title: 'Actions', dataIndex: 'actions' },
];

interface Props {
	match: any;
}

export const CashieringAssignment = ({ match }: Props) => {
	// VARIABLES
	const userId = match?.params?.id;

	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedDate, setSelectededDate] = useState(null);
	const [
		selectedCashieringAssignment,
		setSelectedCashieringAssignment,
	] = useState(null);

	// CUSTOM HOOKS
	const { isConnected } = usePingOnlineServer();
	const actingUser = useUserStore((state) => state.user);
	const {
		data: user,
		isFetching: isFetchingUser,
		isSuccess: isSuccessUser,
		error: userErrors,
	} = useUserRetrieve({
		id: userId,
		options: {
			enabled: !!userId,
			onError: (error: any) => {
				if (error.response.status === 404) {
					message.error('User does not exist');
				} else {
					message.error(GENERIC_ERROR_MESSAGE);
				}
			},
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});
	const {
		data: { cashieringAssignments },
		isFetching: isFetchingCashieringAssignments,
		error: cashieringAssignmentsError,
	} = useCashieringAssignments({
		params: {
			pageSize: MAX_PAGE_SIZE,
			userId,
		},
		options: {
			enabled: isSuccessUser,
		},
	});
	const {
		mutateAsync: deleteCashieringAssignment,
		error: deleteError,
	} = useCashieringAssignmentDelete();

	// METHODS
	useEffect(() => {
		if (user && cashieringAssignments) {
			const today = dayjs();
			const days = getDays();

			const formattedAssignments = days.map((item) => {
				const isDateAfter = today.isAfter(item.date);
				const assignments = cashieringAssignments
					.filter((ca) => dayjs.tz(ca.datetime_start).isSame(item.date, 'date'))
					.sort((assignmentA, assignmentB) => {
						const startTimeA = dayjs.tz(assignmentA.datetime_start);
						const startTimeB = dayjs.tz(assignmentB.datetime_start);

						return startTimeA.isAfter(startTimeB) ? 1 : -1;
					});

				return {
					key: item.display,
					date: item.display,
					day: item.day,
					assignments: (
						<Assignments
							assignments={assignments}
							disabled={isConnected === false}
							onDelete={(assignment) =>
								deleteCashieringAssignment({
									id: assignment.id,
									actingUserId: actingUser.id,
								})
							}
							onEdit={setSelectedCashieringAssignment}
						/>
					),
					actions: !isDateAfter && (
						<Tooltip title="Assign">
							<Button
								disabled={isConnected === false}
								icon={<PlusOutlined />}
								type="primary"
								ghost
								onClick={() => setSelectededDate(item.date)}
							/>
						</Tooltip>
					),
				};
			});

			setDataSource(formattedAssignments);
		}
	}, [user, actingUser, cashieringAssignments, isConnected]);

	const getDays = useCallback(() => {
		const numberOfDays = dayjs().daysInMonth();
		const days = [];
		const today = dayjs().date();

		for (let i = today; i <= numberOfDays; i += 1) {
			const date = dayjs().date(i);
			days.push({
				date,
				display: date.format('MMM D, YYYY'),
				day: date.format('ddd'),
			});
		}

		for (let i = 1; i < today; i += 1) {
			const date = dayjs().date(i);
			days.push({
				date,
				display: date.format('MMM D, YYYY'),
				day: date.format('ddd'),
			});
		}

		return days;
	}, []);

	const getBreadcrumbItems = useCallback(
		() => [
			{ name: 'Users', link: `${getUrlPrefix(actingUser?.user_type)}/users` },
			{ name: getFullName(user) },
		],
		[user, actingUser],
	);

	return (
		<Content
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			className="AssignUsers"
			rightTitle={getFullName(user)}
			title="Assign User"
		>
			<ConnectionAlert />

			<Box>
				{getAppType() === appTypes.BACK_OFFICE && (
					<>
						<RequestErrors
							errors={[
								...convertIntoArray(
									cashieringAssignmentsError,
									'Cashiering Assignments',
								),
								...convertIntoArray(userErrors, 'User'),
								...convertIntoArray(
									deleteError?.errors,
									'Delete Cashiering Assignment',
								),
							]}
							withSpaceBottom
						/>

						<Table
							columns={columns}
							dataSource={dataSource}
							loading={isFetchingUser || isFetchingCashieringAssignments}
							pagination={false}
							scroll={{ x: 800 }}
							bordered
						/>

						{(selectedDate || selectedCashieringAssignment) && (
							<ModifyCashieringAssignmentModal
								assignment={selectedCashieringAssignment}
								assignments={cashieringAssignments}
								date={selectedDate}
								userId={userId}
								onClose={() => {
									setSelectededDate(null);
									setSelectedCashieringAssignment(null);
								}}
							/>
						)}
					</>
				)}
			</Box>
		</Content>
	);
};

interface AssignmentsProps {
	assignments: any;
	disabled: boolean;
	onEdit: any;
	onDelete: any;
}

const Assignments = ({
	assignments,
	disabled,
	onDelete,
	onEdit,
}: AssignmentsProps) => (
	<Row gutter={[16, 16]}>
		{assignments.map((assignment) => (
			<Col key={assignment.id} span={24}>
				<Space align="center" className="w-100">
					<div>
						{`${assignment.branch_machine.name}: ${dayjs
							.tz(assignment.datetime_start)
							.format('h:mmA')} – ${dayjs
							.tz(assignment.datetime_end)
							.format('h:mmA')}`}
					</div>

					<Tooltip title="Edit">
						<Button
							disabled={disabled}
							icon={<EditOutlined />}
							shape="circle"
							size="small"
							type="primary"
							onClick={() =>
								confirmPassword({ onSuccess: () => onEdit(assignment) })
							}
						/>
					</Tooltip>

					<Tooltip title="Delete">
						<Button
							disabled={disabled}
							icon={<DeleteOutlined />}
							shape="circle"
							size="small"
							danger
							ghost
							onClick={() =>
								confirmPassword({ onSuccess: () => onDelete(assignment) })
							}
						/>
					</Tooltip>
				</Space>
			</Col>
		))}
	</Row>
);
