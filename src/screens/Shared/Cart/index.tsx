import { RequestErrors, CreateInventoryTransferModal } from 'components';
import { Modal, message, Select, Spin } from 'antd';
import React, { useRef, useState } from 'react';
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
}

export const Cart = ({ onClose, type }: ModalProps) => {
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

	const [isBranchSelectVisible, setIsBranchSelectVisible] = useState(
		type === 'Adjustment Slip',
	);
	const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

	// REFS
	const barcodeScannerRef = useRef(null);

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

	const { mutateAsync: createReceivingVoucher } = useReceivingVoucherCreate();
	const { mutateAsync: createBackOrder } = useBackOrderCreate();
	const { mutateAsync: createRequisitionSlip } = useRequisitionSlipCreate();
	const { mutateAsync: createAdjustmentSlip } = useAdjustmentSlipCreate();

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
		if (currentProducts.length > 0) {
			const mappedProducts = currentProducts.map(
				({ id, quantity, remarks, errorRemarks }) => ({
					product_id: id,
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
			const mappedProducts = currentProducts.map(({ product, quantity }) => ({
				key: product.key,
				quantity,
			}));

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
	};

	const handleBack = () => {
		const currentProducts = useBoundStore.getState().products;
		if (currentProducts.length > 0) {
			Modal.confirm({
				title: 'Warning',
				content:
					'Closing this will reset the products in your cart. Are you sure you want to continue?',
				okText: 'Confirm',
				cancelText: 'Cancel',
				onOk: () => {
					resetProducts(); // Reset the products
					onClose(); // Close the modal
				},
			});
		} else {
			onClose(); // Close the modal if no products
		}

		setSearchedText('');
	};

	const handleSubmit = () => {
		if (type === 'Requisition Slip') {
			setIsCreateRequisitionSlipVisible(true);
		} else if (type === 'Adjustment Slip') {
			// Get current products from store
			const currentProducts = useBoundStore.getState().products;
			// Check if there are products in the cart
			if (!currentProducts || currentProducts.length === 0) {
				message.error('Please add products to the cart before submission.');
				return; // Prevent modal from opening
			}

			// Validate that all products have remarks
			const productsWithoutRemarks = currentProducts.filter(
				({ remarks }) => !remarks || remarks.trim() === '',
			);

			if (productsWithoutRemarks.length > 0) {
				message.error(
					'All products must have a remarks value before submission.',
				);
				return; // Prevent modal from opening
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
				return; // Prevent modal from opening
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
			<BarcodeScanner
				ref={barcodeScannerRef}
				setLoading={setBarcodeScanLoading}
			/>

			<section className="Cart">
				<RequestErrors
					errors={convertIntoArray(responseError)}
					withSpaceBottom
				/>

				<ProductSearch
					barcodeScannerRef={barcodeScannerRef}
					branchId={type === 'Adjustment Slip' ? selectedBranchId : branchId}
					isCreateInventoryTransfer={type !== 'Requisition Slip'}
				/>
				<ProductTable isLoading={barcodeScanLoading || isLoading} type={type} />
				<FooterButtons isDisabled={isLoading} onSubmit={handleSubmit} />

				{isCreateInventoryTransferModalVisible && (
					<CreateInventoryTransferModal
						isLoading={isLoading}
						type={type}
						onClose={() => setIsCreateInventoryTransferModalVisible(false)}
						onSubmit={handleModalSubmit}
					/>
				)}

				{isCreateRequisitionSlipVisible && (
					<CreateRequisitionSlipModal
						isLoading={isLoading}
						onClose={() => setIsCreateRequisitionSlipVisible(false)}
						onSubmit={handleModalSubmit}
					/>
				)}

				{isCreateAdjustmentSlipVisible && (
					<CreateAdjustmentSlipModal
						isLoading={isLoading}
						onClose={() => setIsCreateAdjustmentSlipVisible(false)}
						onSubmit={handleModalSubmit}
					/>
				)}
			</section>
		</Modal>
	);
};
