import { RequestErrors, CreateInventoryTransferModal } from 'components';
import { Modal, message, Select, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { convertIntoArray, getLocalBranchId } from 'utils';
import shallow from 'zustand/shallow';
import { backOrderTypes, MAX_PAGE_SIZE } from 'ejjy-global';
import {
	useReceivingVoucherCreate,
	useBackOrderCreate,
	useRequisitionSlipCreate,
	useBranches,
	useAdjustmentSlipCreate,
} from 'hooks';
import { CreateRequisitionSlipModal } from 'components/modals/CreateRequisitionSlipModal';
import { CreateAdjustmentSlipModal } from 'components/modals/CreateAdjustmentSlipModal';
import { BarcodeScanner } from './components/BarcodeScanner';
import { FooterButtons } from './components/FooterButtons';
import { ProductSearch } from './components/ProductSearch';
import { ProductTable } from './components/ProductTable';

import './style.scss';

interface ModalProps {
	onClose: () => void;
	type: string;
	prePopulatedProduct?: any;
	initialSearchText?: string;
	onRefetch?: () => void;
}

export const Cart = ({
	onClose,
	type,
	prePopulatedProduct,
	initialSearchText,
	onRefetch,
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
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	const [isBranchSelectVisible, setIsBranchSelectVisible] = useState(
		type === 'Adjustment Slip' && !prePopulatedProduct,
	);
	const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
		prePopulatedProduct?.branch_product?.branch_id ||
			prePopulatedProduct?.branch_product?.branch?.id ||
			null,
	);
	const [hasEmptyUnits, setHasEmptyUnits] = useState(false);

	// REFS
	const barcodeScannerRef = useRef(null);
	const cartModalRef = useRef(null);

	const branchId = getLocalBranchId();

	const {
		data: { branches = [] } = {},
		isFetching: isFetchingBranches,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
	});

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

	// Effect to handle pre-populated single product
	useEffect(() => {
		if (prePopulatedProduct && type === 'Adjustment Slip') {
			resetProducts();
			const { addProduct } = useBoundStore.getState();
			addProduct({
				id: prePopulatedProduct.branch_product?.id,
				product: {
					...prePopulatedProduct.branch_product?.product,
					current_balance: prePopulatedProduct.value,
				},
				quantity: 1,
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

	// Cleanup messages on unmount
	useEffect(() => {
		return () => {
			message.destroy(); // Clear any pending error messages when component unmounts
		};
	}, []);

	// Focus the cart after adding products so ESC key works
	useEffect(() => {
		if (cartModalRef.current) {
			// Small delay to ensure DOM is updated after product is added
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
			}
		} catch (error) {
			message.error(`Failed to create ${type}`);
			return; // Stop execution if there's an error
		} finally {
			setLoading(false);
		}

		resetProducts();
		onClose();

		const { setRefetchData } = useBoundStore.getState();
		setRefetchData(); // Toggle the refetch flag

		// Call the refetch callback if provided
		if (onRefetch) {
			onRefetch();
		}
	};

	const handleBack = () => {
		const currentProducts = useBoundStore.getState().products;

		// If no products, close immediately
		if (!currentProducts || currentProducts.length === 0) {
			onClose(); // Close the modal if no products
			setSearchedText('');
			return;
		}

		// Prevent multiple confirmation modals from opening
		if (isConfirmModalOpen) {
			return;
		}

		// Show confirmation modal for products
		setIsConfirmModalOpen(true);
		Modal.confirm({
			title: 'Warning',
			content:
				'Closing this will reset the products in your cart. Are you sure you want to continue?',
			okText: 'Confirm',
			cancelText: 'Cancel',
			autoFocusButton: 'ok',
			onOk: () => {
				resetProducts(); // Reset the products
				message.destroy(); // Clear any pending error messages
				setIsConfirmModalOpen(false);
				onClose(); // Close the modal
			},
			onCancel: () => {
				setIsConfirmModalOpen(false);
				// Restore focus to cart modal after confirmation modal closes
				setTimeout(() => {
					if (cartModalRef.current) {
						cartModalRef.current.focus();
					}
				}, 100);
			},
			afterClose: () => {
				// Ensure state is reset even if modal is closed by other means
				setIsConfirmModalOpen(false);
				// Restore focus to cart modal after confirmation modal closes
				setTimeout(() => {
					if (cartModalRef.current) {
						cartModalRef.current.focus();
					}
				}, 100);
			},
		});

		setSearchedText('');
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

			// Validate that all products have remarks
			const productsWithoutRemarks = currentProducts.filter(
				({ remarks }) => !remarks || remarks.trim() === '',
			);

			if (productsWithoutRemarks.length > 0) {
				message.error(
					'All products must have a remarks value before submission.',
				);
				return;
			}

			// Validate that products with "Error" remarks have errorRemarks
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
		} else {
			setIsCreateInventoryTransferModalVisible(true);
		}
	};

	const handleBranchSelect = (branch: string) => {
		setSelectedBranchId(branch);
		setIsBranchSelectVisible(false);
	};

	// Prevent opening the cart modal until a branch is selected for Adjustment Slip
	if (type === 'Adjustment Slip' && isBranchSelectVisible) {
		return (
			<Modal
				footer={null}
				title="Select Branch"
				centered
				closable
				open
				onCancel={() => {
					message.destroy(); // Clear any pending error messages
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
			{!prePopulatedProduct && (
				<BarcodeScanner
					ref={barcodeScannerRef}
					setLoading={setBarcodeScanLoading}
				/>
			)}

			<section
				ref={cartModalRef}
				className={`Cart ${prePopulatedProduct ? 'Cart--prepopulated' : ''}`}
				style={{ outline: 'none' }}
				tabIndex={-1}
			>
				<RequestErrors
					errors={convertIntoArray(responseError)}
					withSpaceBottom
				/>

				{!prePopulatedProduct && (
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
							// Restore focus to cart modal after closing
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
							// Restore focus to cart modal after closing
							setTimeout(() => {
								if (cartModalRef.current) {
									cartModalRef.current.focus();
								}
							}, 100);
						}}
						onSubmit={handleModalSubmit}
					/>
				)}

				{isCreateAdjustmentSlipVisible && (
					<CreateAdjustmentSlipModal
						isLoading={isLoading}
						onClose={() => {
							setIsCreateAdjustmentSlipVisible(false);
							// Restore focus to cart modal after closing
							setTimeout(() => {
								if (cartModalRef.current) {
									cartModalRef.current.focus();
								}
							}, 100);
						}}
						onSubmit={handleModalSubmit}
					/>
				)}
			</section>
		</Modal>
	);
};
