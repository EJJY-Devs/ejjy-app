import { message, Button } from 'antd';
import { Content } from 'components';
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import {
	BranchProduct,
	ServiceType,
	getKeyDownCombination,
	showErrorMessages,
	unitOfMeasurementTypes,
	useSiteSettings,
} from 'ejjy-global';
import { useBranchProducts } from 'hooks';
import { NO_INDEX_SELECTED, textcodeShortcutKeys } from 'global';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
// import { BarcodeScannerHandle } from 'screens/Main/components/BarcodeScanner';
import { useUserInterfaceStore } from 'stores';
import { getLocalBranchId } from 'utils';
import {
	SearchInput,
	SearchInputHandle,
} from './ProductSearch/components/SearchInput';
// import { SearchSuggestion } from './components/SearchSuggestion';
// import { SearchTextcodeModal } from './components/SearchTextcodeModal';
import './style.scss';

const ERROR_MESSAGE_KEY = 'ERROR_MESSAGE_KEY';
const WARNING_MESSAGE_KEY = 'WARNING_MESSAGE_KEY';

const GO_BACK_SHORTCUT_KEY = 'F1';
const TOGGLE_SHORTCUT_KEY = 'F2';
// interface Props {
// 	barcodeScannerRef: MutableRefObject<BarcodeScannerHandle | null>;
// }

type ModalProps = {
	type: string;
	onClose: () => void;
};

export const CreateInventoryTransfer = ({ type, onClose }: ModalProps) => {
	const [activeIndex, setActiveIndex] = useState(NO_INDEX_SELECTED);
	const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([]);
	const [searchedKey, setSearchedKey] = useState('');
	const [searchTextcodeModalVisible, setSearchTextcodeModalVisible] = useState(
		false,
	);
	const [productIdsInTable, setProductIdsInTable] = useState<number[]>([]);
	const [
		selectedBranchProduct,
		setSelectedBranchProduct,
	] = useState<BranchProduct | null>(null);

	// REFS
	// const searchInputRef = useRef<SearchInputHandle | null>(null);

	// CUSTOM HOOKS
	const history = useHistory();
	const { userInterface, setUserInterface } = useUserInterfaceStore();
	const { data: siteSettings } = useSiteSettings({
		serviceOptions: { type: ServiceType.OFFLINE },
	});
	const {
		isFetching: isFetchingBranchProducts,
		error: branchProductsErrors,
		refetch: refetchBranchProducts,
	} = useBranchProducts({
		params: {
			branchId: getLocalBranchId(),
			isSoldInBranch: true,
		},
	});

	// METHODS
	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	useEffect(() => {
		setUserInterface({
			isModalVisible: !!selectedBranchProduct || searchTextcodeModalVisible,
		});
	}, [selectedBranchProduct, searchTextcodeModalVisible]);

	// useEffect(() => {
	// 	setProductIdsInTable(products.map((item) => item.product.id));
	// }, [products]);

	useEffect(() => {
		showErrorMessages(_.toString(branchProductsErrors));
	}, [branchProductsErrors]);

	const handleFetchSuccess = (fetchedBranchProducts: BranchProduct[]) => {
		if (searchedKey.length === 0) {
			setUserInterface({ isSearchSuggestionVisible: false });
			return;
		}

		const searchableProducts = fetchedBranchProducts.filter(
			({ product }) => !productIdsInTable.includes(product.id),
		);

		setActiveIndex(0);
		setBranchProducts(searchableProducts);
		setUserInterface({
			isSearchSuggestionVisible: searchableProducts.length > 0,
		});
	};

	const handleSelectProduct = () => {
		const branchProduct = branchProducts?.[activeIndex];

		if (isFetchingBranchProducts) {
			message.error({
				key: ERROR_MESSAGE_KEY,
				content: "Please wait as we're still searching for products.",
			});
			return;
		}

		if (!branchProduct) {
			message.error({
				key: ERROR_MESSAGE_KEY,
				content: 'Please select a product first.',
			});
			return;
		}

		if (
			siteSettings?.is_manual_input_allowed === false &&
			branchProduct.product.unit_of_measurement ===
				unitOfMeasurementTypes.WEIGHING
		) {
			message.error({
				key: ERROR_MESSAGE_KEY,
				content: 'Manual input of weighing product is not allowed.',
			});
			return;
		}

		// NOTE: https://trello.com/c/tLuamcPG/402-insufficient-balance-trapping
		// if (branchProduct?.product_status === branchProductStatuses.OUT_OF_STOCK) {
		//   message.error({
		//     key: ERROR_MESSAGE_KEY,
		//     content: "Product is already out of stock.",
		//   });
		//   return;
		// }

		setSelectedBranchProduct(branchProduct);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (userInterface.isModalVisible) {
			return;
		}

		const key = getKeyDownCombination(event);

		if (textcodeShortcutKeys.includes(key)) {
			setSearchTextcodeModalVisible(true);
		}
	};

	const handleGoBack = () => {
		history.goBack();
	};

	return (
		<>
			{/* <Button
				className="pa-0"
				icon={<ArrowLeftOutlined />}
				style={{
					margin: '10px auto',
					display: 'block',
				}}
				type="text"
				onClick={handleGoBack}
			>
				Go Back [{GO_BACK_SHORTCUT_KEY}]
			</Button> */}
			<Content
				className="Center"
				title={
					<span
						style={{
							fontSize: '24px',
							fontWeight: 'bold',
							textAlign: 'center',
						}}
					>
						{type === 'receiving'
							? 'Create Receiving Voucher'
							: 'Create Delivery Receipt'}
					</span>
				}
			>
				<div className="CreateInventoryTransfer">
					<div>
						<SearchInput
							// ref={searchInputRef}
							activeIndex={activeIndex}
							// barcodeScannerRef={barcodeScannerRef}
							branchProducts={branchProducts}
							searchedKey={searchedKey}
							setActiveIndex={setActiveIndex}
							setSearchedKey={setSearchedKey}
							onSearch={() => {
								refetchBranchProducts();
							}}
							onSelect={handleSelectProduct}
						/>
					</div>
				</div>
			</Content>
		</>
	);
};
