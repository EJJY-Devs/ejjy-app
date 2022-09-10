import { Button, Calendar, message, Modal, Space, Tag } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import {
	TableHeader,
	ViewXReadReportModal,
	ViewZReadReportModal,
} from 'components';
import { Box, FieldError } from 'components/elements';
import dayjs from 'dayjs';
import {
	useBranchMachines,
	useXReadReportCreate,
	useZReadReportCreate,
} from 'hooks';
import { useAuth } from 'hooks/useAuth';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { getBranchId } from 'utils';

const columns: ColumnsType = [
	{ title: 'Machines', dataIndex: 'machines' },
	{
		title: 'Connectivity Status',
		dataIndex: 'connectivityStatus',
		align: 'center',
	},
	{ title: 'Actions', dataIndex: 'actions' },
];

export const ReportsPerMachine = () => {
	// STATES
	const [xReadReport, setXReadReport] = useState(null);
	const [zReadReport, setZReadReport] = useState(null);
	const [dataSource, setDataSource] = useState([]);

	const [datePickerModalVisible, setDatePickerModalVisible] = useState(false);
	const [selectedBranchMachine, setSelectedBranchMachine] = useState(null);
	const [selectedDate, setSelectedDate] = useState(moment());
	const [dateError, setDateError] = useState(null);

	// CUSTOM HOOKS
	const {
		data: { branchMachines },
		isLoading: isLoadingBranchMachines,
	} = useBranchMachines({
		params: { branchId: getBranchId() },
		options: { refetchInterval: 2500 },
	});
	const { mutateAsync: createXReadReport, isLoading: isCreatingXReadReport } =
		useXReadReportCreate();
	const { mutateAsync: createZReadReport, isLoading: isCreatingZReadReport } =
		useZReadReportCreate();
	const { user } = useAuth();

	// METHODS
	useEffect(() => {
		const formattedBranchMachines = branchMachines.map((branchMachine) => ({
			key: branchMachine.id,
			machines: branchMachine.name,
			connectivityStatus: branchMachine.is_online ? (
				<Tag color="green">Online</Tag>
			) : (
				<Tag color="red">Offline</Tag>
			),
			actions: (
				<Space>
					<Button type="primary" onClick={() => viewXReadReport(branchMachine)}>
						View XRead (Today)
					</Button>
					<Button
						type="primary"
						onClick={() => {
							setSelectedBranchMachine(branchMachine);
							setDatePickerModalVisible(true);
							setSelectedDate(moment());
						}}
					>
						View XRead (Date)
					</Button>
					<Button type="primary" onClick={() => viewZReadReport(branchMachine)}>
						View ZRead
					</Button>
				</Space>
			),
		}));

		setDataSource(formattedBranchMachines);
	}, [branchMachines]);

	const viewXReadReport = async (branchMachine, date = undefined) => {
		const { data, status } = await createXReadReport({
			branchMachineId: branchMachine.id,
			date: date || dayjs().format('YYYY-MM-DD'),
			userId: user.id,
		});

		if (status === 204) {
			message.warn('There is no active session.');
		}

		setXReadReport(data);

		// NOTE: Reset the states used for datepicker
		setDatePickerModalVisible(false);
		setSelectedBranchMachine(null);
		setSelectedDate(null);
		setDateError(null);
	};

	const viewZReadReport = async (branchMachine) => {
		const { data } = await createZReadReport({
			branchMachineId: branchMachine.id,
			userId: user.id,
		});
		setZReadReport(data);
	};

	const handleSubmitDateSelection = useCallback(() => {
		if (!selectedDate) {
			setDateError('No selected date yet.');
			return;
		}
		if (selectedDate.isAfter(moment(), 'day')) {
			setDateError("Date must not be after today's date.");
			return;
		}

		viewXReadReport(selectedBranchMachine, selectedDate.format('YYYY-MM-DD'));
	}, [selectedDate]);

	return (
		<Box>
			<TableHeader title="Reports per Machine" />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={
					isCreatingXReadReport ||
					isCreatingZReadReport ||
					isLoadingBranchMachines
				}
				pagination={false}
				scroll={{ x: 650 }}
			/>

			{xReadReport && (
				<ViewXReadReportModal
					report={xReadReport}
					onClose={() => setXReadReport(null)}
				/>
			)}

			{zReadReport && (
				<ViewZReadReportModal
					report={zReadReport}
					onClose={() => setZReadReport(null)}
				/>
			)}

			<Modal
				className="Modal__hasFooter"
				title="Select Date"
				visible={datePickerModalVisible}
				onCancel={() => {
					setSelectedBranchMachine(null);
					setDatePickerModalVisible(false);
					setDateError(null);
				}}
				onOk={handleSubmitDateSelection}
			>
				<Calendar
					defaultValue={moment()}
					disabledDate={(current) => current.isAfter(moment(), 'date')}
					fullscreen={false}
					onSelect={(value) => {
						setSelectedDate(value);
						setDateError(null);
					}}
				/>
				{dateError && <FieldError error={dateError} />}
			</Modal>
		</Box>
	);
};