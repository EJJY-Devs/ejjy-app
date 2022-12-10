import { message } from 'antd';
import { RequestErrors } from 'components';
import { useBranchProducts } from 'hooks';
import _ from 'lodash';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';
import BarcodeReader from 'react-barcode-reader';
import { convertIntoArray } from 'utils';
import shallow from 'zustand/shallow';
import { useBoundStore } from '../../stores/useBoundStore';

const MESSAGE_KEY = 'MESSAGE_KEY_BARCODE_SCAN_MSG';

const Component = (props, ref) => {
	// STATES
	const [scannedBarcode, setScannedBarcode] = useState(null);

	// STORE
	const { products, addProduct, editProduct, setLoading } = useBoundStore(
		(state: any) => ({
			products: state.products,
			addProduct: state.addProduct,
			editProduct: state.editProduct,
			setLoading: state.setLoading,
		}),
		shallow,
	);

	// CUSTOM HOOKS
	const {
		data: { branchProducts },
		isFetching: isFetchingBranchProducts,
		error: branchProductsError,
	} = useBranchProducts({
		params: {
			identifier: scannedBarcode,
			useGoogleApiUrl: true,
		},
		options: {
			enabled: scannedBarcode !== null,
			onSuccess: (data: any) => {
				const scannedProduct = data.branchProducts?.[0]?.product;

				if (branchProducts) {
					const foundProduct = products.find(
						(product) => product.key === scannedProduct.product.key,
					);

					if (foundProduct) {
						scannedProduct['quantity'] += 1;
						editProduct({ key: foundProduct.key, product: scannedProduct });
					} else {
						scannedProduct['quantity'] = 1;
						addProduct(scannedProduct);
					}
				} else {
					message.error({
						key: MESSAGE_KEY,
						content: `Cannot find the scanned product: ${scannedBarcode}`,
					});
				}
			},
		},
	});

	useImperativeHandle(ref, () => ({
		handleScan,
	}));

	// METHODS
	useEffect(() => {
		setLoading(isFetchingBranchProducts);
	}, [isFetchingBranchProducts]);

	const handleScan = (value) => {
		const barcode = _.toString(value);
		message.info(`Scanned Code: ${barcode}`);

		setScannedBarcode(barcode);
	};

	const handleError = (err, msg) => console.error(err, msg);

	return (
		<>
			{branchProductsError && (
				<RequestErrors
					className="px-6"
					errors={convertIntoArray(branchProductsError)}
					withSpaceBottom
				/>
			)}

			<BarcodeReader minLength={3} onError={handleError} onScan={handleScan} />
		</>
	);
};

export const BarcodeScanner = forwardRef(Component);
