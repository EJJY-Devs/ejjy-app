/* eslint-disable react-hooks/exhaustive-deps */
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import { FieldError } from '../../../../../components/elements';
import { types } from '../../../../../ducks/OfficeManager/branch-machines';
import { request } from '../../../../../global/types';
import { useBranchMachines } from '../../../hooks/useBranchMachines';
import { CreateEditBranchMachineForm } from './CreateEditBranchMachineForm';

interface Props {
	branchId: any;
	branchMachine: any;
	visible: boolean;
	onClose: any;
}

export const CreateEditBranchMachineModal = ({
	branchId,
	branchMachine,
	visible,
	onClose,
}: Props) => {
	const {
		createBranchMachine,
		editBranchMachine,
		status,
		errors,
		recentRequest,
		reset,
	} = useBranchMachines();

	// Effect: Close modal if recent requests are Create, Edit or Remove
	useEffect(() => {
		if (
			status === request.SUCCESS &&
			[types.CREATE_BRANCH_MACHINE, types.EDIT_BRANCH_MACHINE].includes(recentRequest)
		) {
			onClose();
			reset();
		}
	}, [status, recentRequest]);

	const onSubmit = (formData) => {
		const data = {
			...formData,
			branchId,
		};

		if (branchMachine) {
			editBranchMachine(data);
		} else {
			createBranchMachine(data);
		}
	};

	return (
		<Modal
			title={`${branchMachine ? '[EDIT]' : '[CREATE]'} Branch Machine`}
			className="modal-large"
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<CreateEditBranchMachineForm
				branchMachine={branchMachine}
				onSubmit={onSubmit}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};
