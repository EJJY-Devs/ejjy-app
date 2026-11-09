import { RequestErrors, CreateInventoryTransferModal } from 'components';
import { Modal, message, Select, Spin } from 'antd';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import {
	computeVatBreakdown,
	convertIntoArray,
	getLocalApiUrl,
	getLocalBranchId,
	isPurchaseVatApplicable,
} from 'utils';
import shallow from 'zustand/shallow';
import { backOrderTypes, MAX_PAGE_SIZE } from 'ejjy-global';
import {
	useAccountRetrieve,
	useReceivingVoucherCreate,
	useBackOrderCreate,
	useRequisitionSlipCreate,
	useBranches,
	useAdjustmentSlipCreate,
	useCashDisbursementDetailUpsert,
	useExpenseVoucherCreate,
	usePurchaseCreate,
	usePurchaseOrderCreate,
	usePurchaseOrders,
	usePurchaseOrderById,
	useSiteSettings,
} from 'hooks';
import { Label } from 'components/elements';
import { CreateRequisitionSlipModal } from 'components/modals/CreateRequisitionSlipModal';
import { CreatePurchaseVoucherModal } from 'components/modals/CreatePurchaseVoucherModal';
import { WEIGHING_DECIMAL_DIGITS } from './data/constants';
import { BarcodeScanner } from './components/BarcodeScanner';
import { EwtCalculatorModal } from './components/EwtCalculatorModal';
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
	// For type='Expense Voucher': the voucher's own Payee/Type/Invoice #/
	// Remarks, collected by the caller BEFORE the Cart is shown (mirrors how
	// Purchase collects those in its own CreatePurchaseVoucherModal step).
	expenseVoucherDetails?: {
		payee: string;
		invoiceNumber: string;
		paymentType: 'pay' | 'on_account';
		remarks: string;
		supplierAccountId?: number | null;
	};
	onExpenseVoucherCreated?: (expenseVoucher: any) => void;
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
	expenseVoucherDetails,
	onExpenseVoucherCreated,
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
	const [isCreatePurchaseVisible, setIsCreatePurchaseVisible] = useState(false);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	const [purchaseVoucherFormData, setPurchaseVoucherFormData] = useState<any>(
		null,
	);
	const [
		isPurchaseVoucherFormVisible,
		setIsPurchaseVoucherFormVisible,
	] = useState(false);

	// EWT Calculator - optional, opened via the icon next to Submit in
	// FooterButtons (Purchase/Expense Voucher only). 0 means the user never
	// calculated it, and no CashDisbursementDetail gets written.
	const [isEwtCalculatorVisible, setIsEwtCalculatorVisible] = useState(false);
	// A ref (not state) on purpose: it's set and then read from inside the
	// Authorization modal's onSuccess callback, which is only invoked much
	// later (after the user picks an authorizer) by a closure captured at
	// the moment handlePurchaseFormSubmit/handleExpenseVoucherFormSubmit ran
	// - state set in the same tick wouldn't be visible to that closure yet,
	// but a ref always reads the latest value regardless of closure timing.
	const pendingEwtPercentageRef = useRef(0);

	// Purchase Order selection state - shown FIRST for type='Purchase'.
	const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
		number | null
	>(null);
	const [isPOSelectVisible, setIsPOSelectVisible] = useState(
		type === 'Purchase',
	);

	const hasPrePopulated =
		!!prePopulatedProduct ||
		(prePopulatedProducts && prePopulatedProducts.length > 0) ||
		(type === 'Purchase Order' && !!rsProducts?.length);

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

	// Load purchase orders for PO selector (only when type is Purchase).
	// The PO is picked before the supplier is known, so this is unfiltered.
	const {
		data: { purchaseOrders = [] } = {},
		isFetching: isFetchingPurchaseOrders,
	} = usePurchaseOrders({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	// Load selected PO details (used to pre-fill the Supplier field on the
	// voucher details step - products are NOT auto-added to the cart; the
	// user searches for and adds the products they actually received).
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
	const { mutateAsync: createExpenseVoucher } = useExpenseVoucherCreate();
	const {
		mutateAsync: upsertCashDisbursementDetail,
	} = useCashDisbursementDetailUpsert();

	const ewtSupplierAccountId =
		type === 'Purchase'
			? purchaseVoucherFormData?.supplierAccountId
			: expenseVoucherDetails?.supplierAccountId;
	const { data: siteSettings } = useSiteSettings();
	const { data: ewtSupplierAccount } = useAccountRetrieve({
		id: ewtSupplierAccountId,
		options: { enabled: !!ewtSupplierAccountId && isEwtCalculatorVisible },
	});
	const cartProducts = useBoundStore((state: any) => state.products);
	const ewtVatExclusiveBase = useMemo(() => {
		if (type !== 'Purchase' && type !== 'Expense Voucher') return 0;

		const vatApplicable = isPurchaseVatApplicable(
			siteSettings,
			ewtSupplierAccount,
		);
		const lines = cartProducts.map((branchProduct: any) => {
			const product = branchProduct.product || {};
			const amount =
				type === 'Purchase'
					? Number(branchProduct.quantity || 0) *
					  Number(branchProduct.cost_per_piece || 0)
					: Number(branchProduct.amount) || 0;

			return {
				amount,
				isVatExempt: !vatApplicable || !!product.is_vat_exempted,
			};
		});
		const { vatExempt, vatableSales } = computeVatBreakdown(lines);
		return vatExempt + vatableSales;
	}, [type, cartProducts, siteSettings, ewtSupplierAccount]);

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
					captured_qty: prePopulatedProduct.capturedQty,
					inputted_qty: prePopulatedProduct.inputtedQty,
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

	// Focus the cart after adding/removing products so ESC key works.
	// Keyed on count (not the products array itself) so editing a field on an
	// existing row - which replaces the products array reference but keeps its
	// length - doesn't yank focus away from whatever input the user just
	// clicked into.
	const productsCount = useBoundStore((state) => state.products.length);
	useEffect(() => {
		if (cartModalRef.current) {
			setTimeout(() => {
				if (cartModalRef.current) {
					cartModalRef.current.focus();
				}
			}, 100);
		}
	}, [productsCount]);

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
					adjusted_value: Number(
						Number(quantity).toFixed(WEIGHING_DECIMAL_DIGITS),
					),
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

	const handleInventoryTransferFormSubmit = async (formData: any) => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: `Authorize ${type}`,
			onSuccess: async (authorizer: any) => {
				setAuthorizeConfig(null);
				await handleModalSubmit({ ...formData, encodedById: authorizer?.id });
			},
			onCancel: () => {
				setAuthorizeConfig(null);
			},
		});
	};

	const handleAdjustmentSlipAuthorize = () => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: 'Authorize Adjustment Slip',
			onSuccess: async (authorizer: any) => {
				setAuthorizeConfig(null);
				await handleModalSubmit({ encodedById: authorizer?.id });
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

	const persistPendingEwt = async (
		sourceType: 'purchase' | 'expense',
		sourceId: number,
	) => {
		const ewtPercentage = pendingEwtPercentageRef.current;
		if (ewtPercentage <= 0) return;

		try {
			await upsertCashDisbursementDetail({
				sourceType,
				sourceId,
				ewtPercentage,
				otherDeductionsAmount: 0,
				otherDeductionsRemarks: '',
			});
		} catch (error) {
			message.warning(
				'Voucher was created, but the EWT amount could not be saved.',
			);
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

			await persistPendingEwt('purchase', response.data.id);
			onPurchaseCreated?.(response.data);
			message.success('Purchase was created successfully');
		}
	};

	const handleCreateExpenseVoucher = async (formData) => {
		const currentProducts = useBoundStore.getState().products;
		if (currentProducts.length > 0) {
			const particulars = currentProducts.map((branchProduct: any) => {
				const product = branchProduct.product || {};
				const amount = Number(branchProduct.amount) || 0;

				return {
					description: product.name || '',
					type: product.is_vat_exempted ? 'VE' : 'V',
					amount,
					product_id: product.id ?? null,
				};
			});
			const amount = particulars.reduce((sum, item) => sum + item.amount, 0);

			const response = await createExpenseVoucher({
				payee: formData.payee,
				invoiceNumber: formData.invoiceNumber,
				paymentType: formData.paymentType,
				particulars,
				amount,
				remarks: formData.remarks,
				authorizerId: formData.authorizerId,
				supplierAccountId: formData.supplierAccountId,
				branchId,
			});

			if (!response) {
				throw Error;
			}

			await persistPendingEwt('expense', response.data.id);
			onExpenseVoucherCreated?.(response.data);
			message.success('Expense Voucher was created successfully');
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
			} else if (type === 'Expense Voucher') {
				await handleCreateExpenseVoucher(formData);
			}
		} catch (error) {
			message.error({ key: 'cart-error', content: `Failed to create ${type}` });
			return;
		} finally {
			setLoading(false);
		}

		resetProducts();
		pendingEwtPercentageRef.current = 0;
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

	const handleExpenseVoucherFormSubmit = (formData: any) => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: 'Authorize Expense Voucher',
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

			handleAdjustmentSlipAuthorize();
		} else if (type === 'Purchase') {
			const currentProducts = useBoundStore.getState().products;

			if (!currentProducts || currentProducts.length === 0) {
				message.error('Please add products to the cart before submission.');
				return;
			}

			handlePurchaseFormSubmit(purchaseVoucherFormData);
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
		} else if (type === 'Expense Voucher') {
			const currentProducts = useBoundStore.getState().products;

			if (!currentProducts || currentProducts.length === 0) {
				message.error('Please add products to the cart before submission.');
				return;
			}

			handleExpenseVoucherFormSubmit(expenseVoucherDetails);
		} else {
			setIsCreateInventoryTransferModalVisible(true);
		}
	};

	// EWT Calculator - opened via the icon next to Submit (Purchase/Expense
	// Voucher only). Saving the % records it for persisting after the
	// voucher is created (see persistPendingEwt) and immediately continues
	// the same submission handleSubmit would have, straight to
	// Authorization - calculating EWT first is just an alternate entry point
	// into the same flow, not an extra step on top of it.
	const handleEwtCalculatorSave = (ewtPercentage: number) => {
		pendingEwtPercentageRef.current = ewtPercentage;
		setIsEwtCalculatorVisible(false);
		handleSubmit();
	};

	const handleBranchSelect = (branch: string) => {
		setSelectedBranchId(branch);
		setIsBranchSelectVisible(false);
	};

	// PO selector step - shown FIRST for Purchase, before the voucher details.
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
								setSelectedPurchaseOrderId(value);
								setIsPOSelectVisible(false);
								setIsPurchaseVoucherFormVisible(true);
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

	if (type === 'Purchase' && isPurchaseVoucherFormVisible) {
		return (
			<CreatePurchaseVoucherModal
				initialSupplierName={purchaseOrderData?.supplier_name}
				isLoading={false}
				onClose={onClose}
				onSubmit={(formData) => {
					setPurchaseVoucherFormData(formData);
					setIsPurchaseVoucherFormVisible(false);
				}}
			/>
		);
	}

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
			maskClosable={false}
			title={type === 'Purchase' ? 'Create Purchase Voucher' : `Create ${type}`}
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
					type={type}
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
					showEwtCalculator={type === 'Purchase' || type === 'Expense Voucher'}
					onEwtCalculatorClick={() => setIsEwtCalculatorVisible(true)}
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
						onSubmit={handleInventoryTransferFormSubmit}
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

				{isCreatePurchaseVisible && (
					<CreatePurchaseVoucherModal
						isLoading={isLoading}
						isPurchaseOrder={type === 'Purchase Order'}
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

				{isEwtCalculatorVisible && (
					<EwtCalculatorModal
						initialEwtPercentage={pendingEwtPercentageRef.current}
						vatExclusiveBase={ewtVatExclusiveBase}
						open
						onClose={() => setIsEwtCalculatorVisible(false)}
						onSave={handleEwtCalculatorSave}
					/>
				)}

				{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
			</section>
		</Modal>
	);
};
