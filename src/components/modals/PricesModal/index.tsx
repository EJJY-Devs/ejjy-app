import { message, Modal, Spin, Tabs } from 'antd';
import { RequestErrors } from 'components';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { MAX_PAGE_SIZE, serviceTypes, appTypes, userTypes } from 'global';
import {
	useBranches,
	useBranchProductEditPriceCost,
	useBranchProducts,
	usePriceMarkdownCreate,
	useProductEdit,
} from 'hooks';
import React, { useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getAppType,
	getGoogleApiUrl,
	getId,
	getLocalApiUrl,
	getLocalBranchId,
} from 'utils';
import { PricesForm } from './PricesForm';

const tabs = {
	ALL: 'General Products',
	BRANCHES: 'Branch Products',
};

interface Props {
	product: any;
	isBulkEdit?: boolean;
	onClose: any;
}

export const PricesModal = ({ product, isBulkEdit, onClose }: Props) => {
	// STATES
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const appType = getAppType();

	const {
		data: { branchProducts },
		isFetching: isFetchingBranchProducts,
		error: branchProductError,
	} = useBranchProducts({
		params: {
			branchId:
				appType === appTypes.BACK_OFFICE ? getLocalBranchId() : undefined,
			productIds: product?.product?.id || product?.id,
			serviceType: serviceTypes.OFFLINE,
		},
		options: { enabled: product !== null },
	});
	const {
		data: { branches },
		isFetching: isFetchingBranches,
	} = useBranches({
		key: 'PricesModalBranch',
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		mutateAsync: createPriceMarkdown,
		isLoading: isCreatingPriceMarkdown,
		error: createPriceMarkdownError,
	} = usePriceMarkdownCreate();
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
	const handleSubmit = async ({
		branchProductFormData,
		priceMarkdownFormData,
		isBulkEdit: isBulkEditFromForm,
	}) => {
		if (priceMarkdownFormData.length > 0) {
			await createPriceMarkdown({
				productId: getId(product),
				data: priceMarkdownFormData,
			});
		}

		if (isBulkEditFromForm) {
			await editProduct({
				...branchProductFormData[0],
				id: getId(product),
				actingUserId: getId(user),
			});
		} else if (branchProductFormData.length > 0) {
			await editBranchProductPriceCost({
				actingUserId: appType === appTypes.BACK_OFFICE ? user.id : getId(user),
				productId: product?.product?.id || getId(product),
				data: branchProductFormData,
				serverUrl:
					appType === appTypes.BACK_OFFICE
						? getLocalApiUrl()
						: getGoogleApiUrl(),
			});
		}

		message.success(`Prices for ${product.name} was set successfully`);
		onClose();
	};

	const handleShowPriceForm = () => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			userTypes: [userTypes.ADMIN, userTypes.BRANCH_MANAGER],
			onSuccess: handleAuthorizedSuccess,
			onCancel: () => {
				setAuthorizeConfig(null);
				onClose();
			},
		});
	};

	const handleAuthorizedSuccess = () => {
		setIsAuthorized(true);
		setAuthorizeConfig(null);
		message.success('Authorization successful!');
	};

	const isLoading = isFetchingBranches || isFetchingBranchProducts;

	// Trigger authorization modal for back office on mount
	if (appType === appTypes.BACK_OFFICE && !isAuthorized && !authorizeConfig) {
		handleShowPriceForm();
	}

	// Don't render price form until authorized for back office
	if (appType === appTypes.BACK_OFFICE && !isAuthorized) {
		return (
			<>{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}</>
		);
	}

	return (
		<Modal
			footer={null}
			title={
				<>
					<span>Prices</span>
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
						'Branch Product Price Cost',
					),
					...convertIntoArray(
						createPriceMarkdownError?.errors,
						'Price Markdown',
					),
				]}
				withSpaceBottom
			/>

			<Spin spinning={isLoading}>
				{isBulkEdit && (
					// Force bulk edit mode when isBulkEdit prop is true
					<PricesForm
						branches={branches}
						isLoading={isLoading}
						isSubmitting={
							isCreatingPriceMarkdown ||
							isEditingBranchProductPriceCost ||
							isEditingProduct
						}
						product={product}
						isBulkEdit
						onClose={onClose}
						onSubmit={handleSubmit}
					/>
				)}
				{!isBulkEdit && getAppType() === appTypes.BACK_OFFICE && (
					<PricesForm
						branches={branches}
						branchProducts={branchProducts}
						isLoading={isLoading}
						isSubmitting={
							isCreatingPriceMarkdown ||
							isEditingBranchProductPriceCost ||
							isEditingProduct
						}
						onClose={onClose}
						onSubmit={handleSubmit}
					/>
				)}
				{!isBulkEdit && getAppType() === appTypes.HEAD_OFFICE && (
					<Tabs
						defaultActiveKey={
							getAppType() === appTypes.HEAD_OFFICE ? tabs.ALL : tabs.BRANCHES
						}
						type="card"
						destroyInactiveTabPane
					>
						<Tabs.TabPane key={tabs.BRANCHES} tab={tabs.BRANCHES}>
							<PricesForm
								branches={branches}
								branchProducts={branchProducts}
								isLoading={isLoading}
								isSubmitting={
									isCreatingPriceMarkdown ||
									isEditingBranchProductPriceCost ||
									isEditingProduct
								}
								product={product}
								onClose={onClose}
								onSubmit={handleSubmit}
							/>
						</Tabs.TabPane>

						<Tabs.TabPane key={tabs.ALL} tab={tabs.ALL}>
							<PricesForm
								branches={branches}
								isLoading={isLoading}
								isSubmitting={
									isCreatingPriceMarkdown ||
									isEditingBranchProductPriceCost ||
									isEditingProduct
								}
								product={product}
								isBulkEdit
								onClose={onClose}
								onSubmit={handleSubmit}
							/>
						</Tabs.TabPane>
					</Tabs>
				)}
			</Spin>
		</Modal>
	);
};
