import { Modal, Button, Table, message, Spin } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ControlledInput, MainButton } from 'components/elements';
import { useBranchProducts, useProductConversion } from 'hooks';
import { getLocalBranchId, convertIntoArray } from 'utils';
import { RequestErrors } from 'components';
import { getProductCode } from 'ejjy-global';
import { Scrollbars } from 'react-custom-scrollbars';
import cn from 'classnames';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { debounce } from 'lodash';
import BarcodeReader from 'react-barcode-reader';
import { AuthorizationModal } from './AuthorizationModal';

interface ProductConversionCartProps {
	onClose: () => void;
}

const searchModes = [
	{ key: 'name', label: 'Name' },
	{ key: 'sku', label: 'SKU' },
	{ key: 'barcode', label: 'Barcode' },
];

const SEARCH_DEBOUNCE_TIME = 250;
const SCANNED_BARCODE_THRESHOLD = 8;
const NO_INDEX_SELECTED = -1;
const PRODUCT_LIST_HEIGHT = 450;
const MESSAGE_KEY = 'SEARCH_MESSAGE_KEY';

export const ProductConversionCart = ({
	onClose,
}: ProductConversionCartProps) => {
	const [stockOutProduct, setStockOutProduct] = useState(null);
	const [stockInProduct, setStockInProduct] = useState(null);
	const [searchedText, setSearchedText] = useState('');
	const [inputText, setInputText] = useState('');
	const [searchModeIndex, setSearchModeIndex] = useState(0);
	const [searchableProducts, setSearchableProducts] = useState([]);
	const [activeIndex, setActiveIndex] = useState(NO_INDEX_SELECTED);
	const [scannedBarcode, setScannedBarcode] = useState(null);
	const [selectingFor, setSelectingFor] = useState<'out' | 'in' | null>(null);
	const [
		isAuthorizationModalVisible,
		setIsAuthorizationModalVisible,
	] = useState(false);

	// Local input states to allow intermediate values like "-" or empty
	const [stockOutQtyInput, setStockOutQtyInput] = useState<string>('');
	const [stockInQtyInput, setStockInQtyInput] = useState<string>('');

	const currentSearchMode = searchModes[searchModeIndex];
	const inputRef = useRef(null);
	const itemRefs = useRef([]);
	const scrollbarRef = useRef(null);
	const previousSearchedKey = useRef('');

	const branchId = getLocalBranchId();

	const {
		mutateAsync: convertProduct,
		isLoading: isConverting,
	} = useProductConversion();

	// Search query
	const {
		isFetching: isFetchingSearch,
		error: searchError,
		refetch: refetchSearch,
	} = useBranchProducts({
		params: {
			branchId,
			search: searchedText,
			searchBy: currentSearchMode.key,
		},
		options: {
			enabled: searchedText?.length > 0 && searchedText.trim().length > 0,
			onSuccess: (data: any) => {
				const newSearchableProducts = data.branchProducts.filter(
					({ product }) => product.deleted === null,
				);

				setActiveIndex(0);
				setSearchableProducts(newSearchableProducts);
			},
			onError: () => {
				message.warning({
					key: MESSAGE_KEY,
					content: 'Code not recognized.',
				});
			},
		},
	});

	// Barcode scan query
	const { error: barcodeError } = useBranchProducts({
		params: {
			branchId,
			identifier: scannedBarcode,
		},
		options: {
			enabled: scannedBarcode !== null && scannedBarcode.trim().length > 0,
			onSuccess: (data: any) => {
				const scannedProduct = data.branchProducts[0];

				if (scannedProduct) {
					if (selectingFor === 'out') {
						setStockOutProduct({
							...scannedProduct,
							qty: 1,
						});
						setStockOutQtyInput('1');
						message.success(`Stock Out: ${scannedProduct.product.name}`);
					} else if (selectingFor === 'in') {
						setStockInProduct({
							...scannedProduct,
							qty: 1,
						});
						setStockInQtyInput('1');
						message.success(`Stock In: ${scannedProduct.product.name}`);
					}
					setScannedBarcode(null);
					setSelectingFor(null);
					setSearchedText('');
					setInputText('');
					setSearchableProducts([]);
				} else {
					message.error({
						key: MESSAGE_KEY,
						content: `Cannot find the scanned product: ${scannedBarcode}`,
					});
					setScannedBarcode(null);
				}
			},
			onError: () => {
				setScannedBarcode(null);
			},
		},
	});

	useEffect(() => {
		if (searchedText.length === 0) {
			setInputText('');
			setSearchableProducts([]);
		}
	}, [searchedText]);

	useEffect(() => {
		if (activeIndex !== NO_INDEX_SELECTED) {
			const scrollTop = itemRefs.current?.[activeIndex]?.offsetTop || 0;

			if (scrollTop > PRODUCT_LIST_HEIGHT) {
				scrollbarRef.current?.scrollTop(scrollTop);
			} else {
				scrollbarRef.current?.scrollTop(0);
			}
		}
	}, [activeIndex, scrollbarRef]);

	const handleSearchDebounced = useCallback(
		debounce((keyword) => {
			if (
				Math.abs(previousSearchedKey.current.length - keyword.length) >
				SCANNED_BARCODE_THRESHOLD
			) {
				// From barcode scanner
				setSearchedText('');
				setInputText('');
				previousSearchedKey.current = '';
				handleBarcodeScan(keyword);
			} else {
				// From normal input
				setSearchedText(keyword);
				previousSearchedKey.current = keyword;
			}
		}, SEARCH_DEBOUNCE_TIME),
		[selectingFor],
	);

	const handleBarcodeScan = (value) => {
		const barcode = value?.toString() || '';

		if (!barcode || barcode.trim().length === 0) {
			message.warning({
				key: MESSAGE_KEY,
				content: 'Invalid barcode scanned.',
			});
			return;
		}

		message.info(`Scanned Code: ${barcode}`);
		setScannedBarcode(barcode);
	};

	const handleClear = () => {
		setStockOutProduct(null);
		setStockInProduct(null);
		setStockOutQtyInput('');
		setStockInQtyInput('');
		setSelectingFor(null);
		setSearchedText('');
		setInputText('');
	};

	const handleSubmit = async () => {
		// Validation
		if (!stockOutProduct) {
			message.error('Please select a product for Stock Out');
			return;
		}

		if (!stockInProduct) {
			message.error('Please select a product for Stock In');
			return;
		}

		// Disallow negatives; allow decimals and zero
		if (
			stockOutProduct.qty === undefined ||
			stockOutProduct.qty === null ||
			Number.isNaN(Number(stockOutProduct.qty)) ||
			Number(stockOutProduct.qty) < 0
		) {
			message.error('Invalid Stock Out quantity');
			return;
		}

		if (
			stockInProduct.qty === undefined ||
			stockInProduct.qty === null ||
			Number.isNaN(Number(stockInProduct.qty)) ||
			Number(stockInProduct.qty) < 0
		) {
			message.error('Invalid Stock In quantity');
			return;
		}

		setIsAuthorizationModalVisible(true);
	};

	const handleAuthorizedSubmit = async (userId: number) => {
		try {
			await convertProduct({
				stock_out_branch_product_id: stockOutProduct.id,
				stock_out_qty: stockOutProduct.qty,
				stock_in_branch_product_id: stockInProduct.id,
				stock_in_qty: stockInProduct.qty,
				authorizer_id: userId,
			});

			message.success('Product conversion successful');
			handleClear();
			onClose();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.error || 'Failed to convert product';
			message.error(errorMessage);
		}
	};

	const handleToggleSearchMode = () => {
		const nextIndex = (searchModeIndex + 1) % searchModes.length;
		setSearchModeIndex(nextIndex);
		refetchSearch();
	};

	const handleSelectProduct = () => {
		const branchProduct = searchableProducts?.[activeIndex];

		if (isFetchingSearch) {
			message.error({
				key: MESSAGE_KEY,
				content: "Please wait as we're still searching for products.",
			});
			return;
		}

		if (!branchProduct) {
			message.error({
				key: MESSAGE_KEY,
				content: 'Please select a product first.',
			});
			return;
		}

		// Auto-add to stock out first, then stock in
		if (!stockOutProduct) {
			setStockOutProduct({
				...branchProduct,
				qty: 1,
			});
			setStockOutQtyInput('1');
			message.success(`Stock Out: ${branchProduct.product.name}`);
		} else if (!stockInProduct) {
			setStockInProduct({
				...branchProduct,
				qty: 1,
			});
			setStockInQtyInput('1');
			message.success(`Stock In: ${branchProduct.product.name}`);
		}

		setSelectingFor(null);
		setSearchedText('');
		setInputText('');
		setSearchableProducts([]);
		setActiveIndex(NO_INDEX_SELECTED);
	};

	const handleStockOutQtyChange = (raw: string) => {
		// Prevent typing negative sign
		if (raw.startsWith('-')) {
			return;
		}
		setStockOutQtyInput(raw);
		const num = parseFloat(raw);
		if (!Number.isNaN(num) && num >= 0) {
			setStockOutProduct((prev) => ({
				...prev,
				qty: num,
			}));
		}
	};

	const handleStockInQtyChange = (raw: string) => {
		// Prevent typing negative sign
		if (raw.startsWith('-')) {
			return;
		}
		setStockInQtyInput(raw);
		const num = parseFloat(raw);
		if (!Number.isNaN(num) && num >= 0) {
			setStockInProduct((prev) => ({
				...prev,
				qty: num,
			}));
		}
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
			setSelectingFor(null);
		}
	};

	const stockOutColumns = [
		{
			title: 'Product Name',
			dataIndex: 'name',
			key: 'name',
			width: '60%',
			align: 'center' as const,
			render: () => (
				<div>{stockOutProduct ? stockOutProduct.product.name : '-'}</div>
			),
		},
		{
			title: 'Quantity',
			dataIndex: 'qty',
			key: 'qty',
			width: '40%',
			align: 'center' as const,
			render: () => (
				<input
					disabled={!stockOutProduct}
					min={0}
					step="any"
					style={{
						width: '100%',
						padding: '4px 12px',
						border: '1px solid #d9d9d9',
						borderRadius: '2px',
						textAlign: 'center',
					}}
					type="number"
					value={stockOutProduct ? stockOutQtyInput : ''}
					onChange={(e) => handleStockOutQtyChange(e.target.value)}
				/>
			),
		},
	];

	const stockInColumns = [
		{
			title: 'Product Name',
			dataIndex: 'name',
			key: 'name',
			width: '60%',
			align: 'center' as const,
			render: () => (
				<div>{stockInProduct ? stockInProduct.product.name : '-'}</div>
			),
		},
		{
			title: 'Quantity',
			dataIndex: 'qty',
			key: 'qty',
			width: '40%',
			align: 'center' as const,
			render: () => (
				<input
					disabled={!stockInProduct}
					min={0}
					step="any"
					style={{
						width: '100%',
						padding: '4px 11px',
						border: '1px solid #d9d9d9',
						borderRadius: '2px',
						textAlign: 'center',
					}}
					type="number"
					value={stockInProduct ? stockInQtyInput : ''}
					onChange={(e) => handleStockInQtyChange(e.target.value)}
				/>
			),
		},
	];

	let placeholder = '';
	if (currentSearchMode.key === 'name') {
		placeholder = 'Search by product name';
	} else if (currentSearchMode.key === 'sku') {
		placeholder = 'Search by SKU';
	} else if (currentSearchMode.key === 'barcode') {
		placeholder = 'Search by barcode';
	}

	return (
		<Modal
			className="ProductConversionCartModal"
			footer={null}
			title="Convert Product"
			width={1400}
			centered
			closable
			open
			onCancel={onClose}
		>
			<div className="ProductConversionCart_content">
				<RequestErrors
					errors={convertIntoArray(searchError || barcodeError)}
					withSpaceBottom
				/>

				<BarcodeReader
					minLength={3}
					onError={(err, msg) => console.error(err, msg)}
					onScan={handleBarcodeScan}
				/>

				<KeyboardEventHandler
					handleKeys={['up', 'down', 'enter', 'esc']}
					isDisabled={searchableProducts.length <= 0}
					handleFocusableElements
					onKeyEvent={handleKeyPress}
				>
					<div className="StockConversionCart_searchSection">
						<div className="StockConversionCart_searchWrapper">
							<ControlledInput
								ref={inputRef}
								className="StockConversionCart_searchInput"
								disabled={stockOutProduct && stockInProduct}
								placeholder={
									stockOutProduct && stockInProduct
										? 'Both products selected'
										: placeholder
								}
								value={inputText}
								onChange={(value) => {
									setInputText(value);
									handleSearchDebounced(value);
								}}
							/>
							{searchedText.length > 0 && (
								<CloseCircleFilled
									className="StockConversionCart_btnClear"
									onClick={() => {
										setSearchedText('');
										setInputText('');
									}}
								/>
							)}

							{searchedText.length > 0 && (
								<div className="StockConversionCart_suggestion">
									<Spin spinning={isFetchingSearch}>
										<Scrollbars
											ref={scrollbarRef}
											autoHeightMax={PRODUCT_LIST_HEIGHT}
											autoHeightMin="100%"
											style={{ height: '100%' }}
											autoHeight
										>
											{searchableProducts.map((productData, index) => {
												const { product } = productData;
												return (
													<div
														key={index}
														ref={(el) => {
															itemRefs.current[index] = el;
														}}
														className={cn(
															'StockConversionCart_suggestion_wrapper',
															{
																StockConversionCart_suggestion_wrapper___active:
																	activeIndex === index,
															},
														)}
														role="button"
														tabIndex={0}
														onClick={handleSelectProduct}
														onKeyDown={(e) => {
															if (e.key === 'Enter' || e.key === ' ') {
																e.preventDefault();
																handleSelectProduct();
															}
														}}
														onMouseEnter={() => setActiveIndex(index)}
													>
														<div className="StockConversionCart_suggestion_product">
															<p className="StockConversionCart_suggestion_product_name">
																{product.name}
															</p>
															<p className="StockConversionCart_suggestion_product_code">
																{getProductCode(product)}
															</p>
														</div>
													</div>
												);
											})}
										</Scrollbars>
									</Spin>
								</div>
							)}
						</div>
						<MainButton
							className="StockConversionCart_btnSearchMode"
							shortcutKey="[F3]"
							title={currentSearchMode.label}
							onClick={handleToggleSearchMode}
						/>
					</div>
				</KeyboardEventHandler>

				<div className="StockConversionCart_tableContainer">
					<div className="StockConversionCart_tableSection">
						<div className="StockConversionCart_header">Stock Out</div>
						<Table
							columns={stockOutColumns}
							dataSource={[{ key: 'out' }]}
							pagination={false}
							bordered
							showHeader
						/>
					</div>

					<div className="StockConversionCart_tableSection">
						<div className="StockConversionCart_header">Stock In</div>
						<Table
							columns={stockInColumns}
							dataSource={[{ key: 'in' }]}
							pagination={false}
							bordered
							showHeader
						/>
					</div>
				</div>

				<div className="StockConversionCart_footer">
					<Button disabled={isConverting} size="large" onClick={handleClear}>
						Clear
					</Button>
					<Button
						loading={isConverting}
						size="large"
						type="primary"
						onClick={handleSubmit}
					>
						Submit
					</Button>
				</div>
			</div>

			{isAuthorizationModalVisible && (
				<AuthorizationModal
					isLoading={isConverting}
					onClose={() => setIsAuthorizationModalVisible(false)}
					onSubmit={handleAuthorizedSubmit}
				/>
			)}
		</Modal>
	);
};
