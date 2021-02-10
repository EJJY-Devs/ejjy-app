import { message, Modal } from 'antd';
import React, { useCallback } from 'react';
import { FieldError } from '../../../../components/elements';
import { request } from '../../../../global/types';
import { useBranches } from '../../hooks/useBranches';
import { useUsers } from '../../hooks/useUsers';
import { EditUserForm } from './EditUserForm';

interface Props {
	visible: boolean;
	user: any;
	onFetchPendingTransactions: any;
	onSuccess: any;
	onClose: any;
}

export const EditUserModal = ({
	user,
	visible,
	onFetchPendingTransactions,
	onSuccess,
	onClose,
}: Props) => {
	// CUSTOM HOOKS
	const { branches } = useBranches();
	const { editUser, status, errors, reset } = useUsers();

	// METHODS
	const getBranchOptions = useCallback(
		() =>
			branches
				.filter(({ online_url }) => !!online_url)
				.map(({ id, name }) => ({ value: id, name })),
		[branches],
	);

	const onEditUser = (data) => {
		editUser(data, ({ status, response }) => {
			if (status === request.SUCCESS) {
				if (response?.length) {
					onSuccess(data.branch_id);
					message.warning(
						'We found an error while updating the user in local branch. Please check the pending transaction table below.',
					);
					onFetchPendingTransactions();
				}

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
