/* eslint-disable react-hooks/exhaustive-deps */
import { message, Modal } from 'antd';
import React from 'react';
import { FieldError } from '../../../../components/elements';
import { request } from '../../../../global/types';
import { useProducts } from '../../../../hooks/useProducts';
import '../style.scss';
import { CreateEditProductForm } from './CreateEditProductForm';

interface Props {
	visible: boolean;
	product: any;
	onFetchPendingTransactions: any;
	onClose: any;
}

export const CreateEditProductModal = ({
	product,
	visible,
	onFetchPendingTransactions,
	onClose,
}: Props) => {
	// CUSTOM HOOKS
	const {
		createProduct,
		editProduct,
		status: productStatus,
		errors: productErrors,
		reset,
	} = useProducts();

	// METHODS
	const onCreateProduct = (product) => {
		createProduct(product);
	};

	const onEditProduct = (product) => {
		editProduct(product, ({ status, response }) => {
			if (status === request.SUCCESS) {
				if (response?.pending_database_transactions?.length) {
					message.warning(
						'We found an error while updating the product details in local branch. Please check the pending transaction table below.',
					);
					onFetchPendingTransactions();
				}

				reset();
				onClose();
			}
		});
	};

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
			{productErrors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<CreateEditProductForm
				product={product}
				onSubmit={product ? onEditProduct : onCreateProduct}
				onClose={onClose}
				loading={productStatus === request.REQUESTING}
			/>
		</Modal>
	);
};

CreateEditProductModal.defaultProps = {
	loading: false,
};
