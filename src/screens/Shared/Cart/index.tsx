import { RequestErrors, CreateInventoryTransferModal } from 'components';
import { Modal, message, Select, Spin } from 'antd';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import React, { useEffect, useRef, useState } from 'react';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { convertIntoArray, getLocalApiUrl, getLocalBranchId } from 'utils';
import shallow from 'zustand/shallow';
import { backOrderTypes, MAX_PAGE_SIZE } from 'ejjy-global';
import {
	useReceivingVoucherCreate,
	useBackOrderCreate,
	useRequisitionSlipCreate,
	useBranches,
	useAdjustmentSlipCreate,
	usePurchaseCreate,
	usePurchaseOrderCreate,
	usePurchaseOrders,
	usePurchaseOrderById,
} from 'hooks';
import { Label } from 'components/elements';
import { CreateRequisitionSlipModal } from 'components/modals/CreateRequisitionSlipModal';
import { CreateAdjustmentSlipModal } from 'components/modals/CreateAdjustmentSlipModal';
import { CreatePurchaseModal } from 'components/modals/CreatePurchaseModal';
import { BarcodeScanner } from './components/BarcodeScanner';
import { FooterButtons } from './components/FooterButtons';
import { ProductSearch } from './components/ProductSearch';
import { ProductTable } from './components/ProductTable';

import './style.scss';

interface ModalProps {
	onClose: () => void;
	type: string;
	prePopulatedProduct?: any;
	prePopulatedProducts?: any[];
	preSelectedBranchId?: string | null;
	initialSearchText?: string;
	onRefetch?: () => void;
	onAdjustmentSlipCreated?: (slip: any) => void;
	requisitionSlipId?: number | null;
	branchId?: string | null;
	rsProducts?: any[];
	onPurchaseCreated?: (purchase: any) => void;
}

export const Cart = ({
	onClose,
	type,
	prePopulatedProduct,
	prePopulatedProducts,
	preSelectedBranchId,
	initialSearchText,
	onRefetch,
	onAdjustmentSlipCreated,
	requisitionSlipId,
	branchId: branchIdProp,
	rsProducts,
	onPurchaseCreated,
}: ModalProps) => {
	// STATES
	const [barcodeScanLoading, setBarcodeScanLoading] = useState(false);
	const [responseError] = useState([]);
	const [
		isCreateInventoryTransferModalVisible,
		setIsCreateInventoryTransferModalVisible,
	] = useState(false);
	const [
		isCreateRequisitionSlipVisible,
		setIsCreateRequisitionSlipVisible,
	] = useState(false);
	const [
		isCreateAdjustmentSlipVisible,
		setIsCreateAdjustmentSlipVisible,
	] = useState(false);
	const [isCreatePurchaseVisible, setIsCreatePurchaseVisible] = useState(false);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	// Purchase Order selection state
	const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
		number | null
	>(null);
	const [isPOSelectVisible, setIsPOSelectVisible] = useState(
		type === 'Purchase',
	);
	const poProductsPopulated = useRef(false);

	const hasPrePopulated =
		!!prePopulatedProduct ||
		(prePopulatedProducts && prePopulatedProducts.length > 0) ||
		(type === 'Purchase Order' && !!rsProducts?.length) ||
		(type === 'Purchase' && selectedPurchaseOrderId !== null);

	const [isBranchSelectVisible, setIsBranchSelectVisible] = useState(
		type === 'Adjustment Slip' && !hasPrePopulated && !preSelectedBranchId,
	);
	const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
		prePopulatedProduct?.branch_product?.branch_id ||
			prePopulatedProduct?.branch_product?.branch?.id ||
			preSelectedBranchId ||
			(prePopulatedProducts?.[0]?.branch_id
				? String(prePopulatedProducts[0].branch_id)
				: null) ||
			(prePopulatedProducts?.[0]?.branch?.id
				? String(prePopulatedProducts[0].branch.id)
				: null),
	);
	const [hasEmptyUnits, setHasEmptyUnits] = useState(false);

	// REFS
	const barcodeScannerRef = useRef(null);
	const cartModalRef = useRef(null);
	const prePopulatedProductIdRef = useRef<number | null>(null);

	const branchId = branchIdProp ?? getLocalBranchId();

	const {
		data: { branches = [] } = {},
		isFetching: isFetchingBranches,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// Load purchase orders for PO selector (only when type is Purchase)
	const {
		data: { purchaseOrders = [] } = {},
		isFetching: isFetchingPurchaseOrders,
	} = usePurchaseOrders({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// Load selected PO details to pre-populate cart
	const { data: purchaseOrderData } = usePurchaseOrderById(
		selectedPurchaseOrderId || 0,
	);

	// CUSTOM HOOKS
	const {
		isLoading,
		setLoading,
		resetProducts,
		setSearchedText,
	} = useBoundStore(
		(state: any) => ({
			isLoading: state.isLoading,
			setLoading: state.setLoading,
			setSearchedText: state.setSearchedText,
			resetProducts: state.resetProducts,
		}),
		shallow,
	);

	useEffect(() => {
		if (initialSearchText) {
			setSearchedText(String(initialSearchText));
		}
	}, [initialSearchText, setSearchedText]);

	const { mutateAsync: createReceivingVoucher } = useReceivingVoucherCreate();
	const { mutateAsync: createBackOrder } = useBackOrderCreate();
	const { mutateAsync: createRequisitionSlip } = useRequisitionSlipCreate();
	const { mutateAsync: createAdjustmentSlip } = useAdjustmentSlipCreate();
	const { mutateAsync: createPurchase } = usePurchaseCreate();
	const { mutateAsync: createPurchaseOrder } = usePurchaseOrderCreate();

	// Pre-populate cart from selected PO (once, when PO data arrives)
	useEffect(() => {
		if (
			!purchaseOrderData ||
			type !== 'Purchase' ||
			poProductsPopulated.current
		) {
			return;
		}

		const products = purchaseOrderData.purchase_order_products || [];
		if (products.length === 0) return;

		resetProducts();
		const { addProduct } = useBoundStore.getState();

		products.forEach((pop: any) => {
			addProduct({
				id: pop.product?.id,
				product: {
					...pop.product,
					key: pop.product?.id,
					current_balance: 0,
				},
				quantity: 0,
				cost_per_piece: Number(pop.cost_per_piece) || 0,
				current_balance: 0,
			});
		});

		poProductsPopulated.current = true;
	}, [purchaseOrderData, type, resetProducts]);

	// Pre-populate cart from RS products for Purchase Order creation
	useEffect(() => {
		if (type !== 'Purchase Order' || !rsProducts?.length) return;
		resetProducts();
		const { addProduct } = useBoundStore.getState();
		rsProducts.forEach((rsp: any) => {
			addProduct({
				id: rsp.product?.id,
				product: {
					...rsp.product,
					key: rsp.product?.id,
					current_balance: 0,
				},
				quantity: null,
				rs_quantity: Number(rsp.quantity),
				rs_unit: rsp.unit || '',
				cost_per_piece: 0,
				current_balance: 0,
			});
		});
	}, [rsProducts, type, resetProducts]);

	// Effect to handle pre-populated single product
	useEffect(() => {
		if (prePopulatedProduct && type === 'Adjustment Slip') {
			const productId = prePopulatedProduct.branch_product?.id ?? null;
			if (
				productId !== null &&
				productId === prePopulatedProductIdRef.current
			) {
				return;
			}
			prePopulatedProductIdRef.current = productId;

			resetProducts();
			const { addProduct } = useBoundStore.getState();

			const adjustedBalance = Number(prePopulatedProduct.adjustedBalance ?? 0);

			addProduct({
				id: prePopulatedProduct.branch_product?.id,
				product: {
					...prePopulatedProduct.branch_product?.product,
					current_balance: prePopulatedProduct.value,
				},
				quantity: adjustedBalance,
				remarks: '',
				errorRemarks: '',
			});
			const productBranchId =
				prePopulatedProduct.branch_product?.branch_id ||
				prePopulatedProduct.branch_product?.branch?.id;

			if (productBranchId) {
				setSelectedBranchId(productBranchId);
			}
		}
	}, [prePopulatedProduct, type, resetProducts]);

	// Pre-populate multiple branch products (e.g. from HO notifications)
	useEffect(() => {
		if (prePopulatedProducts?.length > 0 && type === 'Adjustment Slip') {
			resetProducts();
			const { addProduct } = useBoundStore.getState();
			prePopulatedProducts.forEach((bp) => {
				addProduct({
					id: bp.id,
					product: {
						...bp.product,
						current_balance: bp.current_balance,
					},
					quantity: bp.current_balance ?? 0,
					remarks: '',
					errorRemarks: '',
				});
			});
		}
	}, [prePopulatedProducts, type, resetProducts]);

	// Cleanup error messages on unmount
	useEffect(() => {
		return () => {
			message.destroy('cart-error');
		};
	}, []);

	// Focus the cart after adding products so ESC key works
	useEffect(() => {
		if (cartModalRef.current) {
			setTimeout(() => {
				if (cartModalRef.current) {
					cartModalRef.current.focus();
				}
			}, 100);
		}
	}, [useBoundStore((state) => state.products)]);

	const handleCreateReceivingVoucher = async (formData) => {
		const currentProducts = useBoundStore.getState().products;
		if (currentProducts.length > 0) {
			const mappedProducts = currentProducts.map(
				({ product, quantity, cost_per_piece }) => ({
					product_id: product.id,
					quantity,
					cost_per_piece,
				}),
			);
			const response = await createReceivingVoucher({
				...formData,
				products: mappedProducts,
				branchId,
			});

			if (!response) {
				throw Error;
			}

			message.success('Receiving Report was created successfully');
		}
	};

	const handleCreateAdjustmentSlip = async (formData) => {
		const currentProducts = useBoundStore.getState().products;

		console.log(currentProducts);
		if (currentProducts.length > 0) {
			const mappedProducts = currentProducts.map(
				({ id, product, quantity, remarks, errorRemarks }) => ({
					product_id: id,
					branch_product_id: product.id,
					adjusted_value: quantity,
					remarks,
					error_remarks: errorRemarks,
				}),
			);
			const response = await createAdjustmentSlip({
				...formData,
				products: mappedProducts,
				branchId: selectedBranchId,
			});

			if (!response) {
				throw Error;
			}

			onAdjustmentSlipCreated?.(response.data);
			message.success('Adjustment Slip was created successfully');
		}
	};

	const handleCreateDeliveryReceipt = async (formData) => {
		const currentProducts = useBoundStore.getState().products;
		if (currentProducts.length > 0) {
			const mappedProducts = currentProducts.map(
				({ product, quantity, price_per_piece }) => ({
					product_id: product.id,
					quantity_returned: quantity,
					price_per_piece,
				}),
			);
			const response = await createBackOrder({
				...formData,
				products: mappedProducts,
				type: backOrderTypes.FOR_RETURN,
				branchId,
			});

			if (!response) {
				throw Error;
			}

			message.success('Delivery Receipt was created successfully');
		}
	};

	const handleCreateRequisitionSlip = async (formData) => {
		const currentProducts = useBoundStore.getState().products;
		if (currentProducts.length > 0) {
			const mappedProducts = currentProducts.map(
				({ product, quantity, unit }) => ({
					key: product.key,
					quantity,
					unit,
				}),
			);

			const response = await createRequisitionSlip({
				...formData,
				products: mappedProducts,
				branchId: type === 'Adjustment Slip' ? selectedBranchId : branchId,
			});

			if (!response) {
				throw Error;
			}

			message.success('Requisition Slip was created successfully');
		}
	};

	const handleRequisitionSlipFormSubmit = (formData: any) => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			onSuccess: async (authorizer: any) => {
				setAuthorizeConfig(null);
				await handleModalSubmit({ ...formData, authorizerId: authorizer?.id });
			},
			onCancel: () => {
				setAuthorizeConfig(null);
			},
		});
	};

	const handleCreatePurchaseOrder = async (formData) => {
		const currentProducts = useBoundStore.getState().products;
		if (currentProducts.length > 0) {
			const mappedProducts = currentProducts.map((bp: any) => ({
				product_id: bp.product.id,
				quantity: bp.quantity,
				cost_per_piece: 0,
				unit: bp.rs_unit || '',
			}));
			const response = await createPurchaseOrder({
				...formData,
				products: mappedProducts,
				branchId,
				requisitionSlipId,
			});

			if (!response) {
				throw Error;
			}

			message.success('Purchase Order was created successfully');
		}
	};

	const handleCreatePurchase = async (formData) => {
		const currentProducts = useBoundStore.getState().products;
		if (currentProducts.length > 0) {
			const mappedProducts = currentProducts.map(
				({ product, quantity, cost_per_piece }) => ({
					product_id: product.id,
					quantity,
					cost_per_piece: cost_per_piece || 0,
				}),
			);
			const response = await createPurchase({
				...formData,
				products: mappedProducts,
				branchId,
				requisitionSlipId,
				purchaseOrderId: selectedPurchaseOrderId,
			});

			if (!response) {
				throw Error;
			}

			onPurchaseCreated?.(response.data);
			message.success('Purchase was created successfully');
		}
	};

	const handleModalSubmit = async (formData) => {
		setLoading(true);

		try {
			if (type === 'Delivery Receipt') {
				await handleCreateDeliveryReceipt(formData);
			} else if (type === 'Receiving Report') {
				await handleCreateReceivingVoucher(formData);
			} else if (type === 'Requisition Slip') {
				await handleCreateRequisitionSlip(formData);
			} else if (type === 'Adjustment Slip') {
				await handleCreateAdjustmentSlip(formData);
			} else if (type === 'Purchase') {
				await handleCreatePurchase(formData);
			} else if (type === 'Purchase Order') {
				await handleCreatePurchaseOrder(formData);
			}
		} catch (error) {
			message.error({ key: 'cart-error', content: `Failed to create ${type}` });
			return;
		} finally {
			setLoading(false);
		}

		resetProducts();
		onClose();

		const { setRefetchData } = useBoundStore.getState();
		setRefetchData();

		if (onRefetch) {
			onRefetch();
		}
	};

	const handleBack = () => {
		const currentProducts = useBoundStore.getState().products;

		if (!currentProducts || currentProducts.length === 0) {
			onClose();
			setSearchedText('');
			return;
		}

		if (isConfirmModalOpen) {
			return;
		}

		setIsConfirmModalOpen(true);
		Modal.confirm({
			title: 'Warning',
			content:
				'Closing this will reset the products in your cart. Are you sure you want to continue?',
			okText: 'Confirm',
			cancelText: 'Cancel',
			autoFocusButton: 'ok',
			onOk: () => {
				resetProducts();
				message.destroy();
				setIsConfirmModalOpen(false);
				onClose();
			},
			onCancel: () => {
				setIsConfirmModalOpen(false);
				setTimeout(() => {
					if (cartModalRef.current) {
						cartModalRef.current.focus();
					}
				}, 100);
			},
			afterClose: () => {
				setIsConfirmModalOpen(false);
				setTimeout(() => {
					if (cartModalRef.current) {
						cartModalRef.current.focus();
					}
				}, 100);
			},
		});

		setSearchedText('');
	};

	const handlePurchaseFormSubmit = (formData: any) => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			onSuccess: async (authorizer: any) => {
				setAuthorizeConfig(null);
				await handleModalSubmit({ ...formData, authorizerId: authorizer?.id });
			},
			onCancel: () => {
				setAuthorizeConfig(null);
			},
		});
	};

	const handleSubmit = () => {
		if (type === 'Requisition Slip') {
			setIsCreateRequisitionSlipVisible(true);
		} else if (type === 'Adjustment Slip') {
			const currentProducts = useBoundStore.getState().products;

			if (!currentProducts || currentProducts.length === 0) {
				message.error('Please add products to the cart before submission.');
				return;
			}

			const productsWithoutRemarks = currentProducts.filter(
				({ remarks }) => !remarks || remarks.trim() === '',
			);

			if (productsWithoutRemarks.length > 0) {
				message.error(
					'All products must have a remarks value before submission.',
				);
				return;
			}

			const productsWithoutErrorRemarks = currentProducts.filter(
				({ remarks, errorRemarks }) =>
					remarks === 'Error' && (!errorRemarks || errorRemarks.trim() === ''),
			);

			if (productsWithoutErrorRemarks.length > 0) {
				message.error(
					'All products with "Error" remarks must have a reference number before submission.',
				);
				return;
			}

			setIsCreateAdjustmentSlipVisible(true);
		} else if (type === 'Purchase') {
			setIsCreatePurchaseVisible(true);
		} else if (type === 'Purchase Order') {
			const currentProducts = useBoundStore.getState().products;
			const incomplete = currentProducts.filter(
				(p: any) => !p.quantity || Number(p.quantity) <= 0,
			);
			if (incomplete.length > 0) {
				message.error(
					'Please fill in the Purchase Order quantity for all products before submitting.',
				);
				return;
			}
			setIsCreatePurchaseVisible(true);
		} else {
			setIsCreateInventoryTransferModalVisible(true);
		}
	};

	const handleBranchSelect = (branch: string) => {
		setSelectedBranchId(branch);
		setIsBranchSelectVisible(false);
	};

	// PO selector step (shown before the cart for Purchase type)
	if (type === 'Purchase' && isPOSelectVisible) {
		return (
			<Modal
				footer={null}
				title="Select Purchase Order"
				centered
				closable
				open
				onCancel={() => {
					message.destroy();
					setIsPOSelectVisible(false);
					onClose();
				}}
			>
				{isFetchingPurchaseOrders ? (
					<Spin />
				) : (
					<>
						<Label label="Purchase Order" spacing />
						<Select
							className="w-100"
							filterOption={(input, option) =>
								((option?.children as unknown) as string)
									.toLowerCase()
									.includes(input.toLowerCase())
							}
							placeholder="Select a purchase order"
							showSearch
							onChange={(value: number) => {
								poProductsPopulated.current = false;
								setSelectedPurchaseOrderId(value);
								setIsPOSelectVisible(false);
							}}
						>
							{purchaseOrders.map((po: any) => (
								<Select.Option key={po.id} value={po.id}>
									{po.reference_number}
								</Select.Option>
							))}
						</Select>
					</>
				)}
			</Modal>
		);
	}

	// Branch selector step for Adjustment Slip
	if (type === 'Adjustment Slip' && isBranchSelectVisible) {
		return (
			<Modal
				footer={null}
				title="Select Branch"
				centered
				closable
				open
				onCancel={() => {
					message.destroy();
					setIsBranchSelectVisible(false);
					onClose();
				}}
			>
				{isFetchingBranches ? (
					<Spin />
				) : (
					<Select
						filterOption={(input, option) =>
							((option?.children as unknown) as string)
								.toLowerCase()
								.includes(input.toLowerCase())
						}
						placeholder="Select a branch"
						style={{ width: '100%' }}
						showSearch
						onChange={handleBranchSelect}
					>
						{branches.map((branch) => (
							<Select.Option key={branch.id} value={branch.id}>
								{branch.name}
							</Select.Option>
						))}
					</Select>
				)}
			</Modal>
		);
	}

	return (
		<Modal
			className="CartModal"
			footer={null}
			title={`Create ${type}`}
			width={1400}
			centered
			closable
			open
			onCancel={handleBack}
		>
			{!hasPrePopulated && (
				<BarcodeScanner
					ref={barcodeScannerRef}
					setLoading={setBarcodeScanLoading}
				/>
			)}

			<section
				ref={cartModalRef}
				className={`Cart ${hasPrePopulated ? 'Cart--prepopulated' : ''}`}
				style={{ outline: 'none' }}
				tabIndex={-1}
			>
				<RequestErrors
					errors={convertIntoArray(responseError)}
					withSpaceBottom
				/>

				{!hasPrePopulated && (
					<ProductSearch
						barcodeScannerRef={barcodeScannerRef}
						branchId={type === 'Adjustment Slip' ? selectedBranchId : branchId}
						isCreateInventoryTransfer={type !== 'Requisition Slip'}
						isDisabled={type === 'Requisition Slip' && hasEmptyUnits}
						type={type}
					/>
				)}
				<ProductTable
					isLoading={barcodeScanLoading || isLoading}
					type={type}
					onUnitValidationChange={setHasEmptyUnits}
				/>
				<FooterButtons
					isDisabled={
						isLoading || (type === 'Requisition Slip' && hasEmptyUnits)
					}
					onSubmit={handleSubmit}
				/>

				{isCreateInventoryTransferModalVisible && (
					<CreateInventoryTransferModal
						isLoading={isLoading}
						type={type}
						onClose={() => {
							setIsCreateInventoryTransferModalVisible(false);
							setTimeout(() => {
								if (cartModalRef.current) {
									cartModalRef.current.focus();
								}
							}, 100);
						}}
						onSubmit={handleModalSubmit}
					/>
				)}

				{isCreateRequisitionSlipVisible && (
					<CreateRequisitionSlipModal
						isLoading={isLoading}
						onClose={() => {
							setIsCreateRequisitionSlipVisible(false);
							setTimeout(() => {
								if (cartModalRef.current) {
									cartModalRef.current.focus();
								}
							}, 100);
						}}
						onSubmit={handleRequisitionSlipFormSubmit}
					/>
				)}

				{isCreateAdjustmentSlipVisible && (
					<CreateAdjustmentSlipModal
						isLoading={isLoading}
						onClose={() => {
							setIsCreateAdjustmentSlipVisible(false);
							setTimeout(() => {
								if (cartModalRef.current) {
									cartModalRef.current.focus();
								}
							}, 100);
						}}
						onSubmit={handleModalSubmit}
					/>
				)}

				{isCreatePurchaseVisible && (
					<CreatePurchaseModal
						isLoading={isLoading}
						onClose={() => {
							setIsCreatePurchaseVisible(false);
							setTimeout(() => {
								if (cartModalRef.current) {
									cartModalRef.current.focus();
								}
							}, 100);
						}}
						onSubmit={handlePurchaseFormSubmit}
					/>
				)}

				{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
			</section>
		</Modal>
	);
};
