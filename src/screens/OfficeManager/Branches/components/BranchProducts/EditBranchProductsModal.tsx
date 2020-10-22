/* eslint-disable react-hooks/exhaustive-deps */
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import { FieldError } from '../../../../../components/elements';
import { types } from '../../../../../ducks/branch-products';
import { request } from '../../../../../global/types';
import { useBranchProducts } from '../../../../../hooks/useBranchProducts';
import { EditBranchProductsForm } from './EditBranchProductsForm';

interface Props {
	branch: any;
	branchProduct: any;
	visible: boolean;
	onClose: any;
}

export const EditBranchProductsModal = ({ branch, branchProduct, visible, onClose }: Props) => {
	const { editBranchProduct, status, errors, recentRequest, reset } = useBranchProducts();

	// Effect: Close modal if recent requests are Create, Edit or Remove
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.EDIT_BRANCH_PRODUCT) {
			onClose();
			reset();
		}
	}, [status, recentRequest]);

	return (
		<Modal
			title={`${branchProduct ? '[EDIT]' : '[CREATE]'} Product Details (${branch?.name})`}
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

			<EditBranchProductsForm
				branchId={branch?.id}
				branchProduct={branchProduct}
				onSubmit={editBranchProduct}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};
