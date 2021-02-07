import { Modal } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { FieldError } from '../../../../components/elements';
import { request } from '../../../../global/types';
import { useBranches } from '../../hooks/useBranches';
import { useUsers } from '../../hooks/useUsers';
import { EditUserForm } from './EditUserForm';

interface Props {
	visible: boolean;
	user: any;
	onSuccess: any;
	onClose: any;
}

export const EditUserModal = ({ user, visible, onSuccess, onClose }: Props) => {
	// CUSTOM HOOKS
	const { branches } = useBranches();
	const { editUser, status, errors, reset } = useUsers();

	// METHODS
	// Effect: Close modal if recent requests are Create or Edit
	useEffect(() => {
		if (status === request.SUCCESS) {
			reset();
			onClose();
		}
	}, [status, reset, onClose]);

	const getBranchOptions = useCallback(
		() =>
			branches
				.filter(({ online_url }) => !!online_url)
				.map(({ id, name }) => ({ value: id, name })),
		[branches],
	);

	const onEditUser = (data) => {
		editUser(data, ({ status }) => {
			if (status === request.SUCCESS) {
				onSuccess(data.branch_id);
				reset();
				onClose();
			}
		});
	};

	return (
		<Modal title="Edit User" visible={visible} footer={null} onCancel={onClose} centered closable>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<EditUserForm
				user={user}
				branchOptions={getBranchOptions()}
				onSubmit={onEditUser}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};

EditUserModal.defaultProps = {
	loading: false,
};
