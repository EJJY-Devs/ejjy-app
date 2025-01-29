import { RequestErrors, CreateInventoryTransferModal } from 'components';
import { Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { convertIntoArray } from 'utils';
import shallow from 'zustand/shallow';
import { backOrderTypes } from 'ejjy-global';
import { useReceivingVoucherCreate, useBackOrderCreate } from 'hooks';
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

	// REFS
	const barcodeScannerRef = useRef(null);

	// CUSTOM HOOKS
	const { isLoading, setLoading, resetProducts } = useBoundStore(
		(state: any) => ({
			isLoading: state.isLoading,
			setLoading: state.setLoading,
			resetProducts: state.resetProducts,
		}),
		shallow,
	);

	const { mutateAsync: createReceivingVoucher } = useReceivingVoucherCreate();
	const { mutateAsync: createBackOrder } = useBackOrderCreate();

	const { products } = useBoundStore.getState();

	const handleCreateReceivingVoucher = async (formData) => {
		if (products.length > 0) {
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
		}
	};

	const handleCreateDeliveryReceipt = async (formData) => {
		if (products.length > 0) {
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
		}
	};

	const handleModalSubmit = (formData) => {
		setLoading(true);

		if (type === 'Delivery Receipt') {
			handleCreateDeliveryReceipt(formData);
		} else if (type === 'Receiving Report') {
			handleCreateReceivingVoucher(formData);
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
	};

	const handleSubmit = () => {
		setIsCreateInventoryTransferModalVisible(true);
	};

	// Modal onClose function
	const handleCloseModal = () => {
		setIsCreateInventoryTransferModalVisible(false);
	};

	return (
		<Modal
			className="CartModal"
			footer={null}
			maskClosable={false}
			title="Cart"
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
				<ProductTable isLoading={barcodeScanLoading || isLoading} />
				<FooterButtons isDisabled={isLoading} onSubmit={handleSubmit} />

				{isCreateInventoryTransferModalVisible && (
					<CreateInventoryTransferModal
						isLoading={isLoading}
						type={type}
						onClose={handleCloseModal}
						onSubmit={handleModalSubmit}
					/>
				)}
			</section>
		</Modal>
	);
};
