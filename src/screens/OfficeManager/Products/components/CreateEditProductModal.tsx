/* eslint-disable react-hooks/exhaustive-deps */
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import { FieldError } from '../../../../components/elements';
import { types } from '../../../../ducks/OfficeManager/products';
import { request } from '../../../../global/types';
import { useProducts } from '../../../../hooks/useProducts';
import { CreateEditProductForm } from './CreateEditProductForm';

interface Props {
	visible: boolean;
	product: any;
	onClose: any;
}

export const CreateEditProductModal = ({ product, visible, onClose }: Props) => {
	const { createProduct, editProduct, status, errors, recentRequest, reset } = useProducts();

	// Effect: Close modal if recent requests are Create, Edit or Remove
	useEffect(() => {
		const reloadListTypes = [types.CREATE_PRODUCT, types.EDIT_PRODUCT];

		if (status === request.SUCCESS && reloadListTypes.includes(recentRequest)) {
			reset();
			onClose();
		}
	}, [status, recentRequest]);

	return (
		<Modal
			className="CreateEditProductModal modal-large"
			title={product ? 'Edit Product' : 'Create Product'}
			visible={visible}
			footer={null}
			onCancel={onClose}
			centered
			closable
		>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<CreateEditProductForm
				product={product}
				onSubmit={product ? editProduct : createProduct}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};

CreateEditProductModal.defaultProps = {
	loading: false,
};
