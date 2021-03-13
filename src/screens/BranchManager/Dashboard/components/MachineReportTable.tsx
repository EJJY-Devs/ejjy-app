/* eslint-disable react-hooks/exhaustive-deps */
import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, ViewButtonIcon } from '../../../../components';
import { Box } from '../../../../components/elements';
import { request } from '../../../../global/types';
import { useAuth } from '../../../../hooks/useAuth';
import { useXreadReports } from '../../../../hooks/useXreadReports';
import { calculateTableHeight, showErrorMessages } from '../../../../utils/function';
import { useBranchMachines } from '../../../../hooks/useBranchMachines';
import { ViewReportModal } from './ViewReportModal';

const columns = [
	{ title: 'Machines', dataIndex: 'machines' },
	{ title: 'Actions', dataIndex: 'actions' },
];

export const MachineReportTable = () => {
	// STATES
	const [viewReportModalVisible, setViewReportModalVisible] = useState(false);
	const [data, setData] = useState([]);

	// CUSTOM HOOKS
	const { user } = useAuth();
	const { branchMachines, getBranchMachines, status: branchMachinesStatus } = useBranchMachines();
	const { xreadReport, createXreadReport, status: xReadReportStatus } = useXreadReports();

	// METHODS
	useEffect(() => {
		getBranchMachines(user?.branch?.id);
	}, []);

	// Effect: Format products to be rendered in Table
	useEffect(() => {
		const formattedBranchMachines = branchMachines.map(({ name, id }) => ({
			machines: name,
			actions: <ViewButtonIcon onClick={() => viewReport(id)} tooltip="View Report" />,
		}));

		setData(formattedBranchMachines);
	}, [branchMachines]);

	const viewReport = (machineId) => {
		createXreadReport(
			{
				branchId: user?.branch?.id,
				userId: user.id,
				branchMachineId: machineId,
			},
			({ status, errors }) => {
				if (status === request.ERROR) {
					showErrorMessages(errors);
				} else if (status === request.SUCCESS) {
					setViewReportModalVisible(true);
				}
			},
		);
	};

	return (
		<Box className="MachineReportTable">
			<Spin size="large" spinning={false}>
				<TableHeader title="Reports per Machine" />
			</Spin>

			<Table
				columns={columns}
				dataSource={data}
				scroll={{ y: calculateTableHeight(data.length), x: '100%' }}
				loading={[branchMachinesStatus, xReadReportStatus].includes(request.REQUESTING)}
			/>

			<ViewReportModal
				visible={viewReportModalVisible}
				report={xreadReport}
				onClose={() => setViewReportModalVisible(false)}
			/>
		</Box>
	);
};
