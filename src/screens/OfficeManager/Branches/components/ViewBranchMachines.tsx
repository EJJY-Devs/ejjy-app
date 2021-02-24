/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { TableActions, TableHeader, TableNormal } from '../../../../components';
import { EMPTY_CELL } from '../../../../global/constants';
import { CreateEditBranchMachineModal } from './BranchMachines/CreateEditBranchMachineModal';

interface Props {
	branchMachines: any;
	branchId: any;
}

const columns = [
	{ name: 'Name' },
	{ name: 'Machine ID' },
	{ name: 'Printer Serial #' },
	{ name: 'Action' },
];

export const ViewBranchMachines = ({ branchId, branchMachines }: Props) => {
	// States
	const [tableData, setTableData] = useState([]);
	const [selectedBranchMachine, setSelectedBranchMachine] = useState(null);
	const [createEditBranchMachineModalVisible, setCreateEditBranchMachineModalVisible] = useState(
		false,
	);

	// Effect: Format branch machines to be rendered in Table
	useEffect(() => {
		const formattedBranchMachines = branchMachines.map((branchMachine) => {
			const { name, machine_id, machine_printer_serial_number } = branchMachine;

			return [
				name || EMPTY_CELL,
				machine_id || EMPTY_CELL,
				machine_printer_serial_number || EMPTY_CELL,
				<TableActions onEdit={() => onEdit(branchMachine)} />,
			];
		});

		setTableData(formattedBranchMachines);
	}, [branchMachines]);

	const onCreate = () => {
		setSelectedBranchMachine(null);
		setCreateEditBranchMachineModalVisible(true);
	};

	const onEdit = (branchMachine) => {
		setSelectedBranchMachine(branchMachine);
		setCreateEditBranchMachineModalVisible(true);
	};

	return (
		<>
			<TableHeader title="Machines" buttonName="Create Branch Machine" onCreate={onCreate} />

			<TableNormal columns={columns} data={tableData} />

			<CreateEditBranchMachineModal
				visible={createEditBranchMachineModalVisible}
				branchId={branchId}
				branchMachine={selectedBranchMachine}
				onClose={() => setCreateEditBranchMachineModalVisible(false)}
			/>
		</>
	);
};
