import { message, Modal, Tabs } from 'antd';
import { RequestErrors } from 'components';
import { appTypes, MAX_PAGE_SIZE, serviceTypes } from 'global';
import {
	useBranches,
	useBranchProductEditPriceCost,
	useBranchProducts,
	useProductEdit,
} from 'hooks';
import React from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getAppType,
	getId,
	getLocalApiUrl,
	getLocalBranchId,
	getOnlineApiUrl,
} from 'utils';
import { EditBranchProductsForm } from './EditBranchProductsForm';

const tabs = {
	ALL: 'General Products',
	BRANCHES: 'Branch Products',
};

interface Props {
	product: any;
	onClose: any;
}

export const EditBranchProductsModal = ({ product, onClose }: Props) => {
	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const {
		data: { branchProducts },
		isFetching: isFetchingBranchProducts,
		error: branchProductError,
	} = useBranchProducts({
		params: {
			branchId:
				getAppType() === appTypes.BACK_OFFICE ? getLocalBranchId() : undefined,
			productIds:
				getAppType() === appTypes.BACK_OFFICE ? product.product.id : product.id,
			serviceType: serviceTypes.OFFLINE,
		},
		options: { enabled: product !== null },
	});
	const {
		data: { branches },
		isFetching: isFetchingBranches,
	} = useBranches({
		key: 'EditBranchProductsModalBranch',
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		mutateAsync: editBranchProductPriceCost,
		isLoading: isEditingBranchProductPriceCost,
		error: editBranchProductPricCostError,
	} = useBranchProductEditPriceCost();
	const {
		mutateAsync: editProduct,
		isLoading: isEditingProduct,
		error: editProductError,
	} = useProductEdit();

	// METHODS
	const handleSubmit = async ({ formData, isBulkEdit }) => {
		if (isBulkEdit) {
			await editProduct({
				...formData[0],
				id: getId(product),
				actingUserId: getId(user),
			});
		} else if (formData.length > 0) {
			await editBranchProductPriceCost({
				actingUserId: getId(user),
				productId: getId(product),
				data: formData,
				serverUrl:
					getAppType() === appTypes.BACK_OFFICE
						? getLocalApiUrl()
						: getOnlineApiUrl(),
			});
		}

		message.success(`Branch product has been edited successfully.`);
		onClose();
	};

	return (
		<Modal
			footer={null}
			title={
				<>
					<span>Details</span>
					<span className="ModalTitleMainInfo">{product.name}</span>
				</>
			}
			width={600}
			centered
			closable
			open
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(branchProductError, 'Branch Product'),
					...convertIntoArray(editProductError, 'Product'),
					...convertIntoArray(
						editBranchProductPricCostError?.errors,
						'Branch Product',
					),
				]}
				withSpaceBottom
			/>

			{getAppType() === appTypes.BACK_OFFICE ? (
				<EditBranchProductsForm
					branches={branches}
					branchProducts={branchProducts}
					isLoading={
						isFetchingBranches ||
						isFetchingBranchProducts ||
						isEditingBranchProductPriceCost ||
						isEditingProduct
					}
					onClose={onClose}
					onSubmit={handleSubmit}
				/>
			) : (
				<Tabs
					defaultActiveKey={
						getAppType() === appTypes.HEAD_OFFICE ? tabs.ALL : tabs.BRANCHES
					}
					type="card"
					destroyInactiveTabPane
				>
					<Tabs.TabPane key={tabs.BRANCHES} tab={tabs.BRANCHES}>
						<EditBranchProductsForm
							branches={branches}
							branchProducts={branchProducts}
							isLoading={
								isFetchingBranches ||
								isFetchingBranchProducts ||
								isEditingBranchProductPriceCost ||
								isEditingProduct
							}
							onClose={onClose}
							onSubmit={handleSubmit}
						/>
					</Tabs.TabPane>

					<Tabs.TabPane key={tabs.ALL} tab={tabs.ALL}>
						<EditBranchProductsForm
							branches={branches}
							isLoading={
								isFetchingBranches ||
								isFetchingBranchProducts ||
								isEditingBranchProductPriceCost ||
								isEditingProduct
							}
							isBulkEdit
							onClose={onClose}
							onSubmit={handleSubmit}
						/>
					</Tabs.TabPane>
				</Tabs>
			)}
		</Modal>
	);
};
