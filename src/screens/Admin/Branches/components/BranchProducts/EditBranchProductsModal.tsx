/* eslint-disable react-hooks/exhaustive-deps */
import { Modal } from 'antd';
import React from 'react';
import { FieldError } from '../../../../../components/elements';
import { request } from '../../../../../global/types';
import { useBranchProducts } from '../../../../../hooks/useBranchProducts';
import { EditBranchProductsForm } from './EditBranchProductsForm';

interface Props {
	branch: any;
	branchProduct: any;
	updateItemInPagination: any;
	visible: boolean;
	onClose: any;
}

export const EditBranchProductsModal = ({
	branch,
	branchProduct,
	updateItemInPagination,
	visible,
	onClose,
}: Props) => {
	// CUSTOM HOOKS
	const { editBranchProduct, status, errors, reset } = useBranchProducts();

	// EFFECTS
	const onEditBranchProduct = (product) => {
		editBranchProduct({ ...product, branchId: branch?.id }, ({ status, data }) => {
			if (status === request.SUCCESS) {
				updateItemInPagination(data);
				reset();
				onClose();
			}
		});
	};

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
				branchProduct={branchProduct}
				onSubmit={onEditBranchProduct}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};
