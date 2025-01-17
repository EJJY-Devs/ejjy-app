// /* eslint-disable jsx-a11y/no-static-element-interactions */
// /* eslint-disable jsx-a11y/click-events-have-key-events */
// /* eslint-disable react/jsx-key */
// import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
// import { Alert, Button, Modal, Tooltip, message } from 'antd';
// import {
// 	EditProductModalV1,
// 	EditProductModalV2,
// 	MarkdownModal,
// 	RequestErrors,
// } from 'components';
// import {
// 	ServiceType,
// 	convertIntoArray,
// 	formatInPeso,
// 	formatQuantity,
// 	getKeyDownCombination,
// 	saleTypes,
// 	transactionStatuses,
// 	useSiteSettings,
// 	useTransactionEdit,
// 	vatTypes,
// 	weighingInputTypes,
// } from 'ejjy-global';
// import {
// 	NO_INDEX_SELECTED,
// 	PRODUCT_LENGTH_PER_PAGE,
// 	deleteItemShortcutKeys,
// 	discountItemShortcutKeys,
// 	editQuantityShortcutKeys,
// } from 'global';
// import { floor, throttle } from 'lodash';
// import React, { ReactElement, useEffect, useState } from 'react';
// import {
// 	useCurrentTransactionStore,
// 	useTableNavigationStore,
// 	useUserInterfaceStore,
// } from 'stores';
// import { getAppWeighingInputType } from 'utils';
// import { Table } from './components/Table';
// import './style.scss';

// const columns = [
// 	{ name: '', width: '55px' },
// 	{ name: 'Item', width: '35%' },
// 	{ name: 'Qty', width: '15%', alignment: 'center' },
// 	{ name: 'Rate', width: '15%', alignment: 'center' },
// 	{ name: 'Type', width: '10%', alignment: 'center' },
// 	{ name: 'Amount', width: '20%', alignment: 'center' },
// ];

// const uneditableStatuses = [
// 	transactionStatuses.FULLY_PAID,
// 	transactionStatuses.VOID_EDITED,
// ];

// export const editTypes = {
// 	ADD: 1,
// 	DEDUCT: 2,
// };

// interface Props {
// 	isLoading: boolean;
// }

// const weighingInputType = getAppWeighingInputType();

// export const ProductTable = ({ isLoading }: Props) => {
// 	// STATES
// 	const [selectedProductIndex, setSelectedProductIndex] = useState(0);
// 	const [selectedDiscountProduct, setSelectedDiscountProduct] = useState(null);
// 	const [editProductModalVisible, setEditProductModalVisible] = useState(false);
// 	const [dataSource, setDataSource] = useState<
// 		(string | ReactElement | null)[][]
// 	>([]);

// 	// CUSTOM HOOKS
// 	const { userInterface, setUserInterface } = useUserInterfaceStore();
// 	const {
// 		pageNumber,
// 		nextPage,
// 		previousPage,
// 		resetPage,
// 	} = useTableNavigationStore();
// 	const {
// 		transaction,
// 		products,
// 		isTransactionSearched,
// 		saleType,
// 		discountOption,
// 		deleteProduct,
// 		setTransaction,
// 	} = useCurrentTransactionStore();
// 	const {
// 		mutateAsync: editTransaction,
// 		isLoading: isEditTransactionLoading,
// 		error: editTransactionError,
// 	} = useTransactionEdit();
// 	const { data: siteSettings } = useSiteSettings({
// 		serviceOptions: { type: ServiceType.OFFLINE },
// 	});

// 	// METHODS
// 	useEffect(() => {
// 		document.addEventListener('keydown', handleKeyDown);

// 		return () => {
// 			document.removeEventListener('keydown', handleKeyDown);
// 		};
// 	});

// 	useEffect(() => {
// 		setUserInterface({
// 			isModalVisible: editProductModalVisible || !!selectedDiscountProduct,
// 		});
// 	}, [editProductModalVisible, selectedDiscountProduct]);

// 	// Effect: Format product data
// 	useEffect(() => {
// 		const formattedProducts = products
// 			.slice(
// 				(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE,
// 				pageNumber * PRODUCT_LENGTH_PER_PAGE,
// 			)
// 			.map((item: any, index: number) => {
// 				const isNotRemovable =
// 					uneditableStatuses.includes(transaction?.status || '') ||
// 					isTransactionSearched;

// 				const hasDiscount = item?.discount_per_piece > 0;

// 				const isVatExempted = item.product.is_vat_exempted;

// 				const adjustedQuantity =
// 					item.original_quantity === 0 ? 1 : item.original_quantity;

// 				return [
// 					isNotRemovable ? null : (
// 						<Tooltip placement="top" title="Remove">
// 							<Button
// 								icon={<DeleteOutlined />}
// 								type="primary"
// 								danger
// 								ghost
// 								onClick={() => handleDeleteConfirmation(item)}
// 							/>
// 						</Tooltip>
// 					),
// 					<Tooltip placement="top" title={item.product.description}>
// 						{item.product.name}
// 					</Tooltip>,
// 					<div onClick={() => handleEditQuantity(index)}>
// 						{isTransactionSearched
// 							? adjustedQuantity
// 							: formatQuantity(item.quantity, item.product, item.type)}
// 					</div>,
// 					<div onClick={() => handleDiscount(item)}>
// 						{hasDiscount ? (
// 							<>
// 								{formatInPeso(item.price_per_piece)}
// 								<span className="original-price">
// 									{formatInPeso(
// 										Number(item.price_per_piece) +
// 											Number(item.discount_per_piece),
// 									)}
// 								</span>
// 							</>
// 						) : (
// 							formatInPeso(item.price_per_piece)
// 						)}
// 					</div>,
// 					isVatExempted ? vatTypes.VAT_EMPTY : vatTypes.VATABLE,
// 					formatInPeso(item.quantity * item.price_per_piece),
// 				];
// 			});

// 		setDataSource(formattedProducts);
// 	}, [
// 		transaction?.status,
// 		isTransactionSearched,
// 		pageNumber,
// 		saleType,
// 		siteSettings,
// 		products,
// 		discountOption,
// 	]);

// 	// Effect: Set default active
// 	const previousProductsLengthRef = React.useRef(products.length);

// 	useEffect(() => {
// 		// If there are no products
// 		if (!products.length) {
// 			setSelectedProductIndex(NO_INDEX_SELECTED);
// 			resetPage();
// 		} else if (products.length > previousProductsLengthRef.current) {
// 			setSelectedProductIndex(0);
// 			resetPage();
// 		} else if (products.length && selectedProductIndex === NO_INDEX_SELECTED) {
// 			setSelectedProductIndex(0);
// 			resetPage();
// 		}
// 		// Update the previous products length
// 		previousProductsLengthRef.current = products.length;
// 	}, [products, selectedProductIndex, pageNumber]);

// 	const handleDeleteConfirmation = (product: any) => {
// 		if (
// 			transaction?.status === transactionStatuses.VOID_CANCELLED &&
// 			products.length === 1
// 		) {
// 			message.warning('There should be atleast one (1) item in the cart.');
// 			return;
// 		}

// 		const removeProductFn = async (id: number) => {
// 			// Get new list of products where in passed product is filtered out.
// 			const newProducts = products.filter((item: any) => item.id !== id);

// 			// Checks if the current page has still products.
// 			// If none, go to previous page.
// 			const updatePageNumber = () => {
// 				const currentPageProducts = newProducts.slice(
// 					(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE,
// 					pageNumber * PRODUCT_LENGTH_PER_PAGE,
// 				);

// 				if (currentPageProducts.length === 0) {
// 					previousPage();
// 				}
// 			};

// 			if (transaction?.id) {
// 				const { data: editedTransaction } = await editTransaction({
// 					id: transaction.id,
// 					products: newProducts.map((item: any) => ({
// 						transaction_product_id: item.transactionProductId,
// 						product_id: item.product.id,
// 						price_per_piece: item.price_per_piece,
// 						quantity: item.quantity,
// 					})),
// 				});

// 				setTransaction(editedTransaction);
// 				updatePageNumber();
// 			} else {
// 				deleteProduct(id);
// 				updatePageNumber();
// 			}
// 		};

// 		Modal.confirm({
// 			width: 450,
// 			className: 'EJJYModal',
// 			title: 'Delete Confirmation',
// 			icon: <ExclamationCircleOutlined />,
// 			content: (
// 				<>
// 					<p>Are you sure you want to delete {product.product.name}?</p>

// 					{discountOption && (
// 						<Alert
// 							message={
// 								<small>
// 									Note: Removing a product removes current discount. You may
// 									reapply the discount afterwards if needed.
// 								</small>
// 							}
// 							type="warning"
// 							showIcon
// 						/>
// 					)}
// 				</>
// 			),
// 			okText: 'Delete',
// 			cancelText: 'Cancel',
// 			onOk: () => removeProductFn(product.id),
// 		});
// 	};

// 	const handleDiscount = (product: any) => {
// 		// If credit, allow only if site settings allowed markdown
// 		if (
// 			saleType === saleTypes.CREDIT &&
// 			siteSettings?.is_markdown_allowed_if_credit === false
// 		) {
// 			message.error('Setting a markdown to this product is not allowed.');
// 			return;
// 		}

// 		if (
// 			transaction?.status !== transactionStatuses.FULLY_PAID &&
// 			!isTransactionSearched
// 		) {
// 			setSelectedDiscountProduct(product);
// 		}
// 	};

// 	const handleEditQuantity = (index: number) => {
// 		if (!uneditableStatuses.includes(transaction?.status || '')) {
// 			const newIndex = (pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE + index;
// 			setSelectedProductIndex(newIndex);
// 			setEditProductModalVisible(true);
// 		}
// 	};

// 	const handleKeyDown = throttle((event) => {
// 		if (
// 			userInterface.isModalVisible ||
// 			userInterface.isSearchSuggestionVisible
// 		) {
// 			return;
// 		}

// 		if (
// 			selectedProductIndex === NO_INDEX_SELECTED ||
// 			!products.length ||
// 			uneditableStatuses.includes(transaction?.status || '') ||
// 			isTransactionSearched
// 		) {
// 			return;
// 		}

// 		if (selectedProductIndex === NO_INDEX_SELECTED) {
// 			message.error('Please select a product from the table first.');
// 			return;
// 		}

// 		const key = getKeyDownCombination(event);

// 		// Edit
// 		if (editQuantityShortcutKeys.includes(key)) {
// 			setEditProductModalVisible(true);
// 			return;
// 		}

// 		// Delete
// 		if (deleteItemShortcutKeys.includes(key)) {
// 			handleDeleteConfirmation(products?.[selectedProductIndex]);
// 			return;
// 		}

// 		// Discount
// 		if (discountItemShortcutKeys.includes(key)) {
// 			handleDiscount(products?.[selectedProductIndex]);
// 			return;
// 		}

// 		// Select products
// 		if (
// 			(key === 'ArrowUp' || key === 'ArrowDown') &&
// 			selectedProductIndex === NO_INDEX_SELECTED
// 		) {
// 			setSelectedProductIndex(0);
// 			return;
// 		}

// 		if (key === 'ArrowUp') {
// 			const value =
// 				selectedProductIndex > 0
// 					? selectedProductIndex - 1
// 					: selectedProductIndex;
// 			const newPage = floor(value / PRODUCT_LENGTH_PER_PAGE) + 1;
// 			if (newPage < pageNumber) {
// 				previousPage();
// 			}

// 			setSelectedProductIndex(value);

// 			return;
// 		}

// 		if (key === 'ArrowDown') {
// 			let value = selectedProductIndex;
// 			if (products?.length > 0) {
// 				value =
// 					selectedProductIndex < products.length - 1
// 						? selectedProductIndex + 1
// 						: selectedProductIndex;
// 			}

// 			const newPage = floor(value / PRODUCT_LENGTH_PER_PAGE) + 1;
// 			if (newPage > pageNumber) {
// 				nextPage();
// 			}

// 			setSelectedProductIndex(value);
// 		}
// 	}, 500);

// 	return (
// 		<div className="ProductTable">
// 			<RequestErrors
// 				errors={convertIntoArray(editTransactionError?.errors)}
// 				withSpaceBottom
// 			/>

// 			<Table
// 				activeRow={selectedProductIndex}
// 				columns={columns}
// 				data={dataSource}
// 				loading={isEditTransactionLoading || isLoading}
// 			/>

// 			{editProductModalVisible && products?.[selectedProductIndex] && (
// 				<>
// 					{weighingInputType === weighingInputTypes.MANUAL && (
// 						<EditProductModalV1
// 							branchProduct={products[selectedProductIndex]}
// 							onClose={() => setEditProductModalVisible(false)}
// 						/>
// 					)}

// 					{weighingInputType === weighingInputTypes.BUILT_IN_SCALE && (
// 						<EditProductModalV2
// 							branchProduct={products[selectedProductIndex]}
// 							onClose={() => setEditProductModalVisible(false)}
// 						/>
// 					)}
// 				</>
// 			)}

// 			{selectedDiscountProduct && (
// 				<MarkdownModal
// 					branchProduct={selectedDiscountProduct}
// 					onClose={() => setSelectedDiscountProduct(null)}
// 				/>
// 			)}
// 		</div>
// 	);
// };
