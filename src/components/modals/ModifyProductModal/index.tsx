import { message, Modal, Spin } from 'antd';
import { RequestErrors } from 'components/RequestErrors';
import { MAX_PAGE_SIZE } from 'global';
import {
	useBranchProducts,
	usePatronageSystemTags,
	useProductCreate,
	useProductEdit,
} from 'hooks';
import React from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray, getId } from 'utils';
import { ModifyProductForm } from './ModifyProductForm';

interface Props {
	product: any;
	onClose: any;
	onSuccess?: (successMessage: string) => void;
}

export const ModifyProductModal = ({ product, onClose, onSuccess }: Props) => {
	// CUSTOM HOOKS
	const {
		data: { branchProducts },
		isFetchedAfterMount: isBranchProductsFetchedAfterMount,
	} = useBranchProducts({
		params: { productIds: product?.id },
		options: { enabled: !!product },
	});
	const {
		data: { patronageSystemTags },
		isFetching: isFetchingPatronageSystemTags,
	} = usePatronageSystemTags({
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

	const isDailyChecked = branchProducts?.[0]?.is_daily_checked ?? false;
	const isFormReady = !product || isBranchProductsFetchedAfterMount;

	// METHODS
	const handleSubmit = async (formData) => {
		if (product) {
			await editProduct({
				...formData,
				id: getId(product),
				actingUserId: getId(user),
			});
			if (onSuccess) {
				onSuccess('Product was edited successfully');
			} else {
				message.success('Product edit failed');
			}
		} else {
			await createProduct({
				...formData,
				actingUserId: getId(user),
			});
			if (onSuccess) {
				onSuccess('Product was created successfully');
			} else {
				message.success('Product creation failed');
			}
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

			{isFormReady ? (
				<ModifyProductForm
					isDailyChecked={isDailyChecked}
					isLoading={
						isCreatingProduct ||
						isEditingProduct ||
						isFetchingPatronageSystemTags
					}
					patronageSystemTags={patronageSystemTags}
					product={product}
					onClose={onClose}
					onSubmit={handleSubmit}
				/>
			) : (
				<div style={{ textAlign: 'center', padding: '40px 0' }}>
					<Spin size="large" />
				</div>
			)}
		</Modal>
	);
};
