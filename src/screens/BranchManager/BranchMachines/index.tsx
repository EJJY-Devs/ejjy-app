import { Button, message } from 'antd';
import { LockFilled } from '@ant-design/icons';
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
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { appTypes, userTypes } from 'global';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';

import {
	convertIntoArray,
	getAppType,
	getBranchMachineTypeName,
	getLocalApiUrl,
	getLocalBranchId,
	isStandAlone,
} from 'utils';
import './style.scss';

export const BranchMachines = () => {
	// STATES
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);
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
		return () => {
			setIsAuthorized(false);
		};
	}, []);

	const handleShowData = () => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			userTypes: [userTypes.ADMIN],
			onSuccess: handleAuthorizedSuccess,
			onCancel: () => setAuthorizeConfig(null),
		});
	};

	const handleAuthorizedSuccess = () => {
		setIsAuthorized(true);
		setAuthorizeConfig(null);
	};

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

		if (getAppType() === appTypes.HEAD_OFFICE) {
			columns.push({ title: 'Actions', dataIndex: 'actions' });
		}

		return columns;
	}, []);

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
			{getAppType() === appTypes.BACK_OFFICE && !isAuthorized && (
				<div className="ShowDataButtonContainer">
					<div className="ShowDataBox">
						<LockFilled className="LockIcon" />
						<Button size="large" type="primary" onClick={handleShowData}>
							Show Data
						</Button>
					</div>
				</div>
			)}

			<div
				className={`BranchMachinesContent ${
					getAppType() === appTypes.HEAD_OFFICE || isAuthorized
						? 'authorized'
						: 'blurred'
				}`}
			>
				<Box padding>
					{getAppType() === appTypes.HEAD_OFFICE && (
						<TableHeader
							buttonName="Create Branch Machine"
							onCreate={handleCreate}
						/>
					)}

					<RequestErrors
						className={cn('px-6', {
							'mt-6': getAppType() === appTypes.BACK_OFFICE,
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
			</div>

			{modifyBranchMachineModalVisible && (
				<ModifyBranchMachineModal
					branchId={branchId}
					branchMachine={selectedBranchMachine}
					onClose={() => setModifyBranchMachineModalVisible(false)}
				/>
			)}

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</Content>
	);
};
