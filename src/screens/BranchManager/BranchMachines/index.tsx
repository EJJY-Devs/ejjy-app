import { message } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import cn from 'classnames';
import {
	Content,
	ModifyBranchMachineModal,
	RequestErrors,
	TableActions,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import {
	ServiceType,
	useBranchMachineDelete,
	useBranchMachines,
} from 'ejjy-global';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getBranchMachineTypeName,
	getLocalApiUrl,
	getLocalBranchId,
	isCUDShown,
	isStandAlone,
} from 'utils';

export const BranchMachines = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedBranchMachine, setSelectedBranchMachine] = useState(null);
	const [
		modifyBranchMachineModalVisible,
		setModifyBranchMachineModalVisible,
	] = useState(false);

	// VARIABLES
	const branchId = Number(getLocalBranchId());

	// CUSTOM HOOKS
	const queryClient = useQueryClient();
	const user = useUserStore((state) => state.user);
	const {
		data: branchMachinesData,
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: { branchId },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});
	const {
		mutateAsync: deleteBranchMachine,
		isLoading: isDeletingBranchMachine,
		error: deleteBranchMachineError,
	} = useBranchMachineDelete(null, getLocalApiUrl());

	// METHODS
	useEffect(() => {
		if (branchMachinesData?.list) {
			const data = branchMachinesData.list.map((branchMachine) => ({
				key: branchMachine.id,
				name: (
					<Link to={`/branch-manager/branch-machines/${branchMachine.id}`}>
						{branchMachine.name}
					</Link>
				),
				serverUrl: branchMachine.server_url,
				posTerminal: branchMachine.pos_terminal,
				storageSerialNumber: branchMachine.storage_serial_number,
				machineID: branchMachine.machine_identification_number,
				ptu: branchMachine.permit_to_use,
				type: getBranchMachineTypeName(branchMachine.type),
				ptuDateIssued: branchMachine.ptu_date_issued,
				actions: (
					<TableActions
						onEdit={() => handleEdit(branchMachine)}
						onRemove={async () => {
							await deleteBranchMachine(branchMachine.id);
							queryClient.invalidateQueries('useBranchMachines');
							message.success('Branch machine was deleted successfully');
						}}
					/>
				),
			}));

			setDataSource(data);
		}
	}, [branchMachinesData?.list]);

	const getColumns = useCallback(() => {
		const columns: ColumnsType = [
			{ title: 'Name', dataIndex: 'name', width: 150, fixed: 'left' },
			{ title: 'Server URL', dataIndex: 'serverUrl' },
			{ title: 'POS Terminal', dataIndex: 'posTerminal' },
			{ title: 'Storage Serial Number', dataIndex: 'storageSerialNumber' },
			{ title: 'PTU', dataIndex: 'ptu' },
			{ title: 'Machine ID', dataIndex: 'machineID' },
			{ title: 'Type', dataIndex: 'type' },
			{ title: 'PTU Date Issued', dataIndex: 'ptuDateIssued' },
		];

		if (isCUDShown(user.user_type)) {
			columns.push({ title: 'Actions', dataIndex: 'actions' });
		}

		return columns;
	}, [user]);

	const handleCreate = () => {
		setSelectedBranchMachine(null);
		setModifyBranchMachineModalVisible(true);
	};

	const handleEdit = (branchMachine) => {
		setSelectedBranchMachine(branchMachine);
		setModifyBranchMachineModalVisible(true);
	};

	return (
		<Content title="Branch Machines">
			<Box>
				{isCUDShown(user.user_type) && (
					<TableHeader
						buttonName="Create Branch Machine"
						onCreate={handleCreate}
					/>
				)}

				<RequestErrors
					className={cn('px-6', {
						'mt-6': !isCUDShown(user.user_type),
					})}
					errors={[
						...convertIntoArray(branchMachinesError),
						...convertIntoArray(deleteBranchMachineError?.errors),
					]}
					withSpaceBottom
				/>

				<Table
					columns={getColumns()}
					dataSource={dataSource}
					loading={isFetchingBranchMachines || isDeletingBranchMachine}
					pagination={false}
					scroll={{ x: 800 }}
					bordered
				/>
			</Box>

			{modifyBranchMachineModalVisible && (
				<ModifyBranchMachineModal
					branchId={branchId}
					branchMachine={selectedBranchMachine}
					onClose={() => setModifyBranchMachineModalVisible(false)}
				/>
			)}
		</Content>
	);
};
