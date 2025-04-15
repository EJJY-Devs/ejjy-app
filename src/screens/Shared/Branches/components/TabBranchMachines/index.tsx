import { DeleteOutlined, EditFilled } from '@ant-design/icons';
import { Button, Popconfirm, Space, Tooltip, message } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import {
	ModifyBranchMachineModal,
	RequestErrors,
	TableHeader,
} from 'components';
import {
	ServiceType,
	useBranchMachineDelete,
	useBranchMachines,
} from 'ejjy-global';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getBranchMachineTypeName,
	getGoogleApiUrl,
	getId,
	getLocalApiUrl,
	getUrlPrefix,
	isStandAlone,
} from 'utils';

const columns: ColumnsType = [
	{ title: 'Name', dataIndex: 'name', width: 150, fixed: 'left' },
	{ title: 'Server URL', dataIndex: 'serverUrl' },
	{ title: 'POS Terminal', dataIndex: 'posTerminal' },
	{ title: 'Storage Serial Number', dataIndex: 'storageSerialNumber' },
	{ title: 'PTU', dataIndex: 'ptu' },
	{ title: 'Machine ID', dataIndex: 'machineID' },
	{ title: 'Type', dataIndex: 'type' },
	{ title: 'PTU Date Issued', dataIndex: 'ptuDateIssued' },
	{ title: 'Actions', dataIndex: 'actions' },
];

interface Props {
	branch: any;
	disabled: boolean;
}

export const TabBranchMachines = ({ branch, disabled }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedBranchMachine, setSelectedBranchMachine] = useState(null);
	const [
		modifyBranchMachineModalVisible,
		setModifyBranchMachineModalVisible,
	] = useState(false);

	// CUSTOM HOOKS
	const queryClient = useQueryClient();
	const user = useUserStore((state) => state.user);
	const {
		data: branchMachinesData,
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: { branchId: branch?.id },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});
	const {
		mutateAsync: deleteBranchMachine,
		isLoading: isDeletingBranchMachine,
		error: deleteBranchMachineError,
	} = useBranchMachineDelete(null, getGoogleApiUrl());

	// METHODS
	useEffect(() => {
		if (branchMachinesData?.list) {
			const data = branchMachinesData.list.map((branchMachine) => ({
				key: branchMachine.id,
				name: (
					<Link
						to={`${getUrlPrefix(user.user_type)}/branch-machines/${
							branchMachine.id
						}`}
					>
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
					<Space>
						<Tooltip title="Edit">
							<Button
								disabled={disabled}
								icon={<EditFilled />}
								type="primary"
								ghost
								onClick={() => {
									setSelectedBranchMachine(branchMachine);
									setModifyBranchMachineModalVisible(true);
								}}
							/>
						</Tooltip>

						<Popconfirm
							cancelText="No"
							disabled={disabled}
							okText="Yes"
							placement="left"
							title="Are you sure to remove this?"
							onConfirm={async () => {
								await deleteBranchMachine(branchMachine.id);
								queryClient.invalidateQueries('useBranchMachines');
								message.success('Branch machine was deleted successfully');
							}}
						>
							<Tooltip title="Remove">
								<Button icon={<DeleteOutlined />} type="primary" danger ghost />
							</Tooltip>
						</Popconfirm>
					</Space>
				),
			}));

			setDataSource(data);
		}
	}, [branchMachinesData?.list, disabled]);

	const handleCreate = () => {
		setSelectedBranchMachine(null);
		setModifyBranchMachineModalVisible(true);
	};

	return (
		<>
			<TableHeader
				buttonName="Create Branch Machine"
				title="Branch Machines"
				wrapperClassName="pt-2 px-0"
				onCreate={handleCreate}
				onCreateDisabled={disabled}
			/>

			<RequestErrors
				errors={[
					...convertIntoArray(branchMachinesError),
					...convertIntoArray(deleteBranchMachineError?.errors),
				]}
				withSpaceBottom
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingBranchMachines || isDeletingBranchMachine}
				pagination={false}
				scroll={{ x: 800 }}
				bordered
			/>

			{modifyBranchMachineModalVisible && (
				<ModifyBranchMachineModal
					branchId={getId(branch)}
					branchMachine={selectedBranchMachine}
					onClose={() => setModifyBranchMachineModalVisible(false)}
				/>
			)}
		</>
	);
};
