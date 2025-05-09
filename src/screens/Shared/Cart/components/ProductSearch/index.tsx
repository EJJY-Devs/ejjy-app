import { message } from 'antd';
import { RequestErrors } from 'components';
import { useBranchProducts } from 'hooks';

import React, { useEffect, useRef, useState } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { AddProductModal } from 'screens/Shared/Cart/components/AddProductModal';
import { SearchInput } from 'screens/Shared/Cart/components/ProductSearch/components/SearchInput';
import { SearchSuggestion } from 'screens/Shared/Cart/components/ProductSearch/components/SearchSuggestion';
import { NO_INDEX_SELECTED } from 'screens/Shared/Cart/data';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { convertIntoArray, getLocalBranchId } from 'utils';
import shallow from 'zustand/shallow';
import './style.scss';

const ERROR_MESSAGE_KEY = 'ERROR_MESSAGE_KEY';
const WARNING_MESSAGE_KEY = 'WARNING_MESSAGE_KEY';

interface Props {
	barcodeScannerRef: any;
}

export const ProductSearch = ({ barcodeScannerRef }: Props) => {
	// STATES
	const [productKeysInTable, setProductKeysInTable] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [searchableProducts, setSearchableProducts] = useState([]);

	// REFS
	const searchInputRef = useRef(null);

	// CUSTOM HOOKS
	const {
		products,
		searchedText,
		setSearchedText,
		activeIndex,
		setActiveIndex,
	} = useBoundStore(
		(state: any) => ({
			products: state.products,
			searchedText: state.searchedText,
			setSearchedText: state.setSearchedText,
			activeIndex: state.activeIndex,
			setActiveIndex: state.setActiveIndex,
		}),
		shallow,
	);
	const {
		isFetching: isFetchingBranchProducts,
		error: branchProductsError,
	} = useBranchProducts({
		params: {
			branchId: getLocalBranchId(),
			search: searchedText,
		},
		options: {
			enabled: searchedText?.length > 0,
			onSuccess: (data: any) => {
				const newSearchableProducts = data.branchProducts.filter(
					({ product }) => !productKeysInTable.includes(product.key),
				);

				setActiveIndex(0);
				setSearchableProducts(newSearchableProducts);
			},
			onError: () => {
				message.warning({
					key: WARNING_MESSAGE_KEY,
					content: 'Code not recognized.',
				});
			},
		},
	});

	// METHODS
	useEffect(() => {
		const keys = products.map((item) => item.product?.key).filter(Boolean);

		setProductKeysInTable(keys);
	}, [products]);

	const handleSelectProduct = () => {
		const branchProduct = searchableProducts?.[activeIndex];

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

		setSelectedProduct(branchProduct);
	};

	const handleKeyPress = (key, event) => {
		event.preventDefault();
		event.stopPropagation();

		if ((key === 'up' || key === 'down') && activeIndex === NO_INDEX_SELECTED) {
			setActiveIndex(0);
			return;
		}

		if (key === 'up' && activeIndex > 0) {
			setActiveIndex(activeIndex - 1);
			return;
		}

		if (
			key === 'down' &&
			searchableProducts?.length > 0 &&
			activeIndex < searchableProducts.length - 1
		) {
			setActiveIndex(activeIndex + 1);
			return;
		}

		if (key === 'enter' && activeIndex !== NO_INDEX_SELECTED) {
			handleSelectProduct();
			return;
		}

		if (key === 'esc') {
			setSearchedText('');
		}
	};

	return (
		<div className="ProductSearch">
			<RequestErrors
				errors={convertIntoArray(branchProductsError)}
				withSpaceBottom
			/>

			<KeyboardEventHandler
				handleKeys={['up', 'down', 'enter', 'esc']}
				isDisabled={searchableProducts.length <= 0}
				handleFocusableElements
				onKeyEvent={handleKeyPress}
			>
				<SearchInput
					ref={searchInputRef}
					barcodeScannerRef={barcodeScannerRef}
				/>

				{searchedText.length > 0 && (
					<SearchSuggestion
						loading={isFetchingBranchProducts}
						searchedProducts={searchableProducts}
						onSelect={handleSelectProduct}
					/>
				)}

				{selectedProduct && (
					<AddProductModal
						product={selectedProduct}
						onClose={() => {
							if (searchedText.length > 0) {
								searchInputRef.current.focusInput();
							}

							setSelectedProduct(null);
						}}
						onSuccess={() => {
							setSearchedText('');
							setSearchableProducts([]);
						}}
					/>
				)}
			</KeyboardEventHandler>
		</div>
	);
};
