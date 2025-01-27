import {
	Content,
	RequestErrors,
	CreateInventoryTransferModal,
} from 'components';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { convertIntoArray } from 'utils';
import shallow from 'zustand/shallow';
import { BarcodeScanner } from './components/BarcodeScanner';
import { FooterButtons } from './components/FooterButtons';
import { ProductSearch } from './components/ProductSearch';
import { ProductTable } from './components/ProductTable';
import './style.scss';

interface LocationState {
	title: string;
	onSubmit: any;
}

export const Cart = () => {
	// STATES
	const [barcodeScanLoading, setBarcodeScanLoading] = useState(false);
	const [responseError, setResponseError] = useState([]);
	const [
		isCreateInventoryTransferModalVisible,
		setIsCreateInventoryTransferModalVisible,
	] = useState(false);
	const [inventoryTransferType, setInventoryTransferType] = useState(null);

	// REFS
	const barcodeScannerRef = useRef(null);

	// CUSTOM HOOKS
	const history = useHistory<LocationState>();
	const { isLoading, setLoading } = useBoundStore(
		(state: any) => ({
			isLoading: state.isLoading,
			setLoading: state.setLoading,
		}),
		shallow,
	);

	// METHODS
	useEffect(() => {
		document.body.style.backgroundColor = 'white';

		return () => {
			document.body.style.backgroundColor = null;
		};
	}, []);

	useEffect(() => {
		if (!history.location.state) {
			history.replace('/');
		}
	}, [history.location.state]);

	const handleSubmit = (formData) => {
		setLoading(true);
		const { products } = useBoundStore.getState();

		// Pass both products and form data to the modal submission
		history.location.state
			.onSubmit(products, formData)
			.catch((response) => {
				if (response.errors) {
					setResponseError(response.errors);
				}
			})
			.finally(() => {
				setLoading(false);
			});

		if (
			history.location.state?.title === 'Delivery Receipt' ||
			history.location.state?.title === 'Receiving Report'
		) {
			setIsCreateInventoryTransferModalVisible(true);
			setInventoryTransferType(history.location.state?.title);
		}
	};

	const handleBack = () => {
		history.goBack(); // Go back to the previous page
	};

	// Modal onClose function
	const handleCloseModal = () => {
		setIsCreateInventoryTransferModalVisible(false);
	};

	return (
		<Content title={`Create ${history.location.state?.title}`}>
			<BarcodeScanner
				ref={barcodeScannerRef}
				setLoading={setBarcodeScanLoading}
			/>

			<section className="Cart mt-6">
				<RequestErrors
					errors={convertIntoArray(responseError)}
					withSpaceBottom
				/>

				<Button
					className="pa-0"
					color="default"
					icon={<ArrowLeftOutlined />}
					type="text"
					onClick={handleBack}
				>
					Go Back
				</Button>

				<ProductSearch barcodeScannerRef={barcodeScannerRef} />
				<ProductTable isLoading={barcodeScanLoading || isLoading} />
				<FooterButtons isDisabled={isLoading} onSubmit={handleSubmit} />

				{isCreateInventoryTransferModalVisible && (
					<CreateInventoryTransferModal
						isLoading={isLoading}
						type={inventoryTransferType}
						onClose={handleCloseModal} // Pass handleSubmit to the modal
						onSubmit={handleSubmit} // Pass handleCloseModal to close the modal
					/>
				)}
			</section>
		</Content>
	);
};
