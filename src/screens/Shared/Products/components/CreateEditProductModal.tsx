import { message, Modal } from 'antd';
import React from 'react';
import { FieldError } from '../../../../components/elements';
import { request } from '../../../../global/types';
import { useProducts } from '../../../../hooks/useProducts';
import '../style.scss';
import { CreateEditProductForm } from './CreateEditProductForm';

interface Props {
	product: any;
	visible: boolean;
	addItemInPagination: any;
	updateItemInPagination: any;
	onFetchPendingTransactions: any;
	onClose: any;
}

export const CreateEditProductModal = ({
	product,
	visible,
	addItemInPagination,
	updateItemInPagination,
	onFetchPendingTransactions,
	onClose,
}: Props) => {
	// CUSTOM HOOKS
	const { createProduct, editProduct, status, errors, reset } = useProducts();

	// METHODS
	const onCreateProduct = (data) => {
		createProduct(data, ({ status: requestStatus, response }) => {
			if (requestStatus === request.SUCCESS) {
				if (response?.pending_database_transactions?.length) {
					onPendingTransactions();
				}

				addItemInPagination(data);
				reset();
				onClose();
			}
		});
	};

	const onEditProduct = (data) => {
		editProduct(data, ({ status: requestStatus, response }) => {
			if (requestStatus === request.SUCCESS) {
				if (response?.pending_database_transactions?.length) {
					onPendingTransactions();
				}

				updateItemInPagination(data);
				reset();
				onClose();
			}
		});
	};

	const onPendingTransactions = () => {
		message.warning(
			'We found an error while updating the product details in local branch. Please check the pending transaction table below.',
		);
		onFetchPendingTransactions();
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
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}

			<CreateEditProductForm
				product={product}
				onSubmit={product ? onEditProduct : onCreateProduct}
				onClose={onClose}
				loading={status === request.REQUESTING}
			/>
		</Modal>
	);
};
