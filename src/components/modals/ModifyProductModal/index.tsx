import { message, Modal } from 'antd';
import { RequestErrors } from 'components/RequestErrors';
import { MAX_PAGE_SIZE } from 'global';
import { usePointSystemTags, useProductCreate, useProductEdit } from 'hooks';
import React from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray } from 'utils';
import { ModifyProductForm } from './ModifyProductForm';

interface Props {
	product: any;
	onClose: any;
}

export const ModifyProductModal = ({ product, onClose }: Props) => {
	// CUSTOM HOOKS
	const {
		data: { pointSystemTags },
		isFetching: isFetchingPointSystemTags,
	} = usePointSystemTags({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const user = useUserStore((state) => state.user);
	const {
		mutateAsync: createProduct,
		isLoading: isCreatingProduct,
		error: createProductError,
	} = useProductCreate();
	const {
		mutateAsync: editProduct,
		isLoading: isEditingProduct,
		error: editProductError,
	} = useProductEdit();

	// METHODS
	const handleSubmit = async (formData) => {
		if (product) {
			await editProduct({
				...formData,
				id: product.id,
				actingUserId: user.id,
			});
			message.success('Product was edited successfully');
		} else {
			await createProduct({
				...formData,
				actingUserId: user.id,
			});
			message.success('Product was created successfully');
		}

		onClose();
	};

	return (
		<Modal
			className="ModifyProduct Modal__large ModalLarge__scrollable"
			footer={null}
			title={
				<>
					<span>{product ? '[Edit] Product' : '[Create] Product'}</span>
					<span className="ModalTitleMainInfo">{product?.name}</span>
				</>
			}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(createProductError?.errors),
					...convertIntoArray(editProductError?.errors),
				]}
				withSpaceBottom
			/>

			<ModifyProductForm
				isLoading={
					isCreatingProduct || isEditingProduct || isFetchingPointSystemTags
				}
				pointSystemTags={pointSystemTags}
				product={product}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};
