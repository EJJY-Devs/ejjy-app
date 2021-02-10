import { Modal } from 'antd';
import React from 'react';
import { FieldError } from '../../../../components/elements';
import { request } from '../../../../global/types';
import { useUsers } from '../../hooks/useUsers';
import { CreateUserForm } from './CreateUserForm';

interface Props {
	visible: boolean;
	onSuccess: any;
	onClose: any;
}

export const CreateUserModal = ({ visible, onSuccess, onClose }: Props) => {
	// CUSTOM HOOKS
	const { createUser, status, errors, reset } = useUsers();

	// METHODS
	const onCreateUser = (data) => {
		createUser(data, ({ status }) => {
			if (status === request.SUCCESS) {
				onSuccess();
				reset();
				onClose();
			}
		});
	};

	return (
		<Modal title="Create User" visible={visible} footer={null} onCancel={onClose} centered closable>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<CreateUserForm
				onSubmit={onCreateUser}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};
