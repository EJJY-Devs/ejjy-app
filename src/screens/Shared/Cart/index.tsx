import { RequestErrors, CreateInventoryTransferModal } from 'components';
import { Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { convertIntoArray, getLocalBranchId } from 'utils';
import shallow from 'zustand/shallow';
import { backOrderTypes } from 'ejjy-global';
import {
	useReceivingVoucherCreate,
	useBackOrderCreate,
	useRequisitionSlipCreate,
} from 'hooks';
import { CreateRequisitionSlipModal } from 'components/modals/CreateRequisitionSlipModal';
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

	// REFS
	const barcodeScannerRef = useRef(null);

	const branchId = getLocalBranchId();

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

	const { products } = useBoundStore.getState();

	const handleCreateReceivingVoucher = async (formData) => {
		if (products.length > 0) {
			try {
				const mappedProducts = products.map(
					({ id, quantity, cost_per_piece }) => ({
						product_id: id,
						quantity,
						cost_per_piece,
					}),
				);
				await createReceivingVoucher({
					...formData,
					products: mappedProducts,
				});
				message.success('Receiving Report was created successfully');
			} catch (error) {
				message.error('Failed to create Receiving Report');
			}
		}
	};

	const handleCreateDeliveryReceipt = async (formData) => {
		if (products.length > 0) {
			try {
				const mappedProducts = products.map(
					({ id, quantity, price_per_piece }) => ({
						product_id: id,
						quantity_returned: quantity,
						price_per_piece,
					}),
				);
				await createBackOrder({
					...formData,
					products: mappedProducts,
					type: backOrderTypes.FOR_RETURN,
				});
				message.success('Delivery Receipt was created successfully');
			} catch (error) {
				message.error('Failed to create Delivery Receipt');
			}
		}
	};

	const handleCreateRequisitionSlip = async (formData) => {
		console.log(branchId);
		if (products.length > 0) {
			try {
				const mappedProducts = products.map(({ key, quantity }) => ({
					key,
					quantity,
				}));
				await createRequisitionSlip({
					...formData,
					products: mappedProducts,
					branchId,
				});
				message.success('Requisition Slip was created successfully');
			} catch (error) {
				message.error('Failed to create Requisition Slip');
			}
		}
	};

	const handleModalSubmit = (formData) => {
		setLoading(true);

		if (type === 'Delivery Receipt') {
			handleCreateDeliveryReceipt(formData);
		} else if (type === 'Receiving Report') {
			handleCreateReceivingVoucher(formData);
		} else if (type === 'Requisition Slip') {
			handleCreateRequisitionSlip(formData);
		}

		resetProducts();
		onClose();

		const { setRefetchData } = useBoundStore.getState();
		setRefetchData(); // Toggle the refetch flag
	};

	const handleBack = () => {
		if (products.length > 0) {
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
		} else {
			setIsCreateInventoryTransferModalVisible(true);
		}
	};

	// // Modal onClose function
	// const handleCloseModal = () => {
	// 	setIsCreateInventoryTransferModalVisible(false);
	// };

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

				<ProductSearch barcodeScannerRef={barcodeScannerRef} />
				<ProductTable isLoading={barcodeScanLoading || isLoading} type={type} />
				<FooterButtons isDisabled={isLoading} onSubmit={handleSubmit} />

				{isCreateInventoryTransferModalVisible && (
					<CreateInventoryTransferModal
						isLoading={isLoading}
						type={type}
						onClose={onClose}
						onSubmit={handleModalSubmit}
					/>
				)}

				{isCreateRequisitionSlipVisible && (
					<CreateRequisitionSlipModal
						isLoading={isLoading}
						onClose={onClose}
						onSubmit={handleModalSubmit}
					/>
				)}
			</section>
		</Modal>
	);
};
