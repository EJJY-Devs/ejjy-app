import {
	ExclamationCircleOutlined,
	DeleteOutlined,
	PlusOutlined,
	MinusOutlined,
} from '@ant-design/icons';
import { Button, Modal, Tooltip, Input, Select, message } from 'antd';
import { formatInPeso } from 'ejjy-global';
import React, { useEffect, useState, useRef } from 'react';
import { EditProductModal } from 'screens/Shared/Cart/components/EditProductModal';
import { AddProductModal } from 'screens/Shared/Cart/components/AddProductModal';
import { Table } from 'screens/Shared/Cart/components/ProductTable/components/Table';
import {
	NO_INDEX_SELECTED,
	PRODUCT_LENGTH_PER_PAGE,
} from 'screens/Shared/Cart/data';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { formatQuantity, getBranchProductStatus } from 'utils';
import shallow from 'zustand/shallow';
import './style.scss';

export const editTypes = {
	ADD: 1,
	DEDUCT: 2,
};

interface Props {
	isLoading: boolean;
	type: string;
	onUnitValidationChange?: (hasEmptyUnits: boolean) => void;
}

export const ProductTable = ({
	isLoading,
	type,
	onUnitValidationChange,
}: Props) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [editProductModalVisible, setEditProductModalVisible] = useState(false);
	const [addProductModalVisible, setAddProductModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [dataSource, setDataSource] = useState([]);
	const [toggleAction, setToggleAction] = useState<{ [key: string]: boolean }>(
		{},
	);
	const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
	const [errorRemarks, setErrorRemarks] = useState<{ [key: string]: string }>(
		{},
	);
	const [unitInputs, setUnitInputs] = useState<{ [key: string]: string }>({});
	const [previousProductCount, setPreviousProductCount] = useState(0);
	const [unitErrors, setUnitErrors] = useState<{ [key: string]: boolean }>({});

	// Ref to store unit input references
	const unitInputRefs = useRef<{ [key: string]: any }>({});

	const {
		products,
		pageNumber,
		deleteProduct,
		editProduct,
		prevPage,
		resetPage,
		updateProductQuantitySign,
	} = useBoundStore(
		(state: any) => ({
			products: state.products,
			pageNumber: state.pageNumber,
			deleteProduct: state.deleteProduct,
			editProduct: state.editProduct,
			nextPage: state.nextPage,
			prevPage: state.prevPage,
			resetPage: state.resetPage,
			updateProductQuantitySign: state.updateProductQuantitySign,
		}),
		shallow,
	);

	const baseColumns =
		type === 'Adjustment Slip'
			? [
					{ name: '', width: '1px' },
					{ name: 'Barcode', width: '40px' },
					{ name: 'Description', alignment: 'center' },
					{ name: 'Action', alignment: 'center' },
					{ name: 'Value', alignment: 'center' },
					{ name: 'Remarks', alignment: 'center', width: '275px' },
			  ]
			: [
					{ name: '', width: '1px' },
					{ name: 'Barcode', width: '40px' },
					{ name: 'Product Name', alignment: 'center' },
					{ name: 'Qty', alignment: 'center' },
			  ];

	const columns = [...baseColumns];

	if (type === 'Requisition Slip') {
		columns.push(
			{ name: 'Unit', alignment: 'center' },
			{ name: 'Status', alignment: 'center' },
		);
	} else if (
		type !== 'Receiving Report' &&
		type !== 'Delivery Receipt' &&
		type !== 'Adjustment Slip'
	) {
		columns.push(
			{ name: 'Unit Price', alignment: 'center' },
			{ name: 'Amount', alignment: 'center' },
		);
	}

	if (type === 'Delivery Receipt' || type === 'Receiving Report') {
		columns.push({ name: 'Action', alignment: 'center' });
	}

	// Focus on unit input when a new product is added in Requisition Slip mode
	useEffect(() => {
		if (type === 'Requisition Slip' && products.length > previousProductCount) {
			// Get the newly added product (first in the array since they're added to the beginning)
			const newProduct = products[0];
			if (newProduct?.product?.key) {
				// Use requestAnimationFrame to ensure DOM is updated, then focus immediately
				requestAnimationFrame(() => {
					const inputRef = unitInputRefs.current[newProduct.product.key];
					if (inputRef) {
						inputRef.focus();
						// Position cursor at the beginning (left) of the input
						inputRef.setSelectionRange(0, 0);
					}
				});
			}
		}
		setPreviousProductCount(products.length);
	}, [products.length, type, previousProductCount]);

	// Cleanup refs when products are removed
	useEffect(() => {
		const currentKeys = products.map((p) => p.product?.key).filter(Boolean);
		const refKeys = Object.keys(unitInputRefs.current);
		const errorKeys = Object.keys(unitErrors);

		// Remove refs for products that no longer exist
		refKeys.forEach((key) => {
			if (!currentKeys.includes(key)) {
				delete unitInputRefs.current[key];
			}
		});

		// Remove unit errors for products that no longer exist
		errorKeys.forEach((key) => {
			if (!currentKeys.includes(key)) {
				setUnitErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors[key];
					return newErrors;
				});
			}
		});
	}, [products, unitErrors]);

	useEffect(() => {
		if (type === 'Adjustment Slip') {
			const data = products.map((branchProduct, index) => {
				const { product, quantity } = branchProduct;
				const { barcode, name, key } = product;

				return [
					<Tooltip key={`tooltip-delete-${key}`} placement="top" title="Remove">
						<Button
							icon={<DeleteOutlined />}
							type="primary"
							danger
							ghost
							onClick={() =>
								showRemoveProductConfirmation(branchProduct, index)
							}
						/>
					</Tooltip>,

					<Tooltip
						key={`tooltip-barcode-${key}`}
						placement="top"
						title={barcode}
					>
						{barcode}
					</Tooltip>,

					<Tooltip key={`tooltip-name-${key}`} placement="top" title={name}>
						{name}
					</Tooltip>,

					<Tooltip
						key={`tooltip-action-${key}`}
						placement="top"
						title={toggleAction[key] ? 'Decrease' : 'Increase'}
					>
						<Button
							icon={toggleAction[key] ? <MinusOutlined /> : <PlusOutlined />}
							type="default"
							onClick={() => {
								setToggleAction((prev) => ({
									...prev,
									[key]: !prev[key],
								}));
								updateProductQuantitySign({
									key,
									makeNegative: !toggleAction[key],
								});
							}}
						/>
					</Tooltip>,

					<Button
						key={`btn-edit-quantity-${key}`}
						type="text"
						onClick={() => handleEdit(index)}
					>
						{formatQuantity({
							unitOfMeasurement: product.unit_of_measurement,
							quantity,
						})}
					</Button>,

					<div
						key={`div-remarks-${key}`}
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '4px',
						}}
					>
						<Select
							options={[
								{ label: 'Error', value: 'Error' },
								{ label: 'Spoilage', value: 'Spoilage' },
							]}
							style={{ width: '100%' }}
							value={remarks[key]}
							onChange={(value) => {
								setRemarks((prev) => ({
									...prev,
									[key]: value,
								}));
								// Clear error remarks if not "Error"
								if (value !== 'Error') {
									setErrorRemarks((prev) => ({
										...prev,
										[key]: '',
									}));
									editProduct({
										key,
										product: {
											...branchProduct,
											remarks: value,
											errorRemarks: '',
										},
									});
								} else {
									// Update product in store
									editProduct({
										key,
										product: {
											...branchProduct,
											remarks: value,
										},
									});
								}
							}}
						/>
						{remarks[key] === 'Error' && (
							<Input
								placeholder="Reference number"
								style={{ width: '100%', textAlign: 'center' }}
								value={errorRemarks[key] || ''}
								onChange={(e) => {
									const { value } = e.target;
									setErrorRemarks((prev) => ({
										...prev,
										[key]: value,
									}));
									// Update product in store
									editProduct({
										key,
										product: {
											...branchProduct,
											errorRemarks: value,
										},
									});
								}}
							/>
						)}
					</div>,
				];
			});
			setDataSource(data);
			return;
		}

		const paginatedProducts = products.slice(
			(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE,
			pageNumber * PRODUCT_LENGTH_PER_PAGE,
		);

		const data = paginatedProducts.map((branchProduct, index) => {
			const { product, product_status, quantity } = branchProduct;

			const {
				barcode,
				textcode,
				name,
				price_per_piece,
				key,
				is_multiple_instance,
			} = product;

			// Initialize unit input from store if not already set
			if (
				type === 'Requisition Slip' &&
				branchProduct.unit &&
				!unitInputs[key]
			) {
				setUnitInputs((prev) => ({
					...prev,
					[key]: branchProduct.unit,
				}));
			}

			const row = [
				<Tooltip key={`tooltip-delete-${key}`} placement="top" title="Remove">
					<Button
						icon={<DeleteOutlined />}
						type="primary"
						danger
						ghost
						onClick={() => showRemoveProductConfirmation(branchProduct, index)}
					/>
				</Tooltip>,

				<Tooltip
					key={`tooltip-barcode-${key}`}
					placement="top"
					title={barcode || textcode}
				>
					{barcode || textcode}
				</Tooltip>,

				<Tooltip key={`tooltip-name-${key}`} placement="top" title={name}>
					{name}
				</Tooltip>,

				<Button
					key={`btn-edit-quantity-${key}`}
					type="text"
					onClick={() => handleEdit(index)}
				>
					{formatQuantity({
						unitOfMeasurement: product.unit_of_measurement,
						quantity,
					})}
				</Button>,
			];

			if (type === 'Requisition Slip') {
				const status = getBranchProductStatus(product_status);

				row.push(
					<Input
						key={`input-unit-${key}`}
						ref={(el) => {
							if (el) {
								unitInputRefs.current[key] = el;
							}
						}}
						placeholder="Enter unit"
						style={{
							textAlign: 'center',
							width: '240px',
						}}
						value={unitInputs[key] || ''}
						onBlur={(e) => {
							const { value } = e.target;
							// Validate on blur - prevent leaving if empty
							if (!value.trim()) {
								setUnitErrors((prev) => ({
									...prev,
									[key]: true,
								}));
								message.error('Unit field is required');
								// Refocus the input to prevent leaving
								setTimeout(() => {
									const inputRef = unitInputRefs.current[key];
									if (inputRef) {
										inputRef.focus();
									}
								}, 100);
								return;
							}
							// Clear error if value is provided
							setUnitErrors((prev) => ({
								...prev,
								[key]: false,
							}));
						}}
						onChange={(e) => {
							const { value } = e.target;
							setUnitInputs((prev) => ({
								...prev,
								[key]: value,
							}));

							// Clear error if user starts typing and field has content
							if (value.trim() && unitErrors[key]) {
								setUnitErrors((prev) => ({
									...prev,
									[key]: false,
								}));
							}

							// Update unit in the store
							editProduct({
								key,
								product: {
									...branchProduct,
									unit: value,
								},
							});
						}}
						onPressEnter={(e) => {
							const target = e.target as HTMLInputElement;
							const value = target.value.trim();

							// Validate before allowing blur
							if (!value) {
								setUnitErrors((prev) => ({
									...prev,
									[key]: true,
								}));
								message.error('Unit field is required');
								return; // Don't blur if validation fails
							}

							// Clear any existing error and blur
							setUnitErrors((prev) => ({
								...prev,
								[key]: false,
							}));
							target.blur();
						}}
					/>,
					<Tooltip
						key={`tooltip-status-${key}`}
						placement="top"
						title={`Status: ${status}`}
					>
						{status}
					</Tooltip>,
				);
			} else if (type !== 'Receiving Report' && type !== 'Delivery Receipt') {
				const unitPrice = price_per_piece;
				const totalPrice = unitPrice * quantity;

				row.push(
					<Tooltip
						key={`tooltip-unit-price-${key}`}
						placement="top"
						title={`Unit Price: ${formatInPeso(unitPrice)}`}
					>
						{formatInPeso(unitPrice)}
					</Tooltip>,
					<Tooltip
						key={`tooltip-total-price-${key}`}
						placement="top"
						title={`Total Amount: ${formatInPeso(totalPrice)}`}
					>
						{formatInPeso(totalPrice)}
					</Tooltip>,
				);
			}

			if (type === 'Delivery Receipt' || type === 'Receiving Report') {
				const actionContent = is_multiple_instance ? (
					<Tooltip key={`tooltip-plus-${key}`} title="Duplicate Product">
						<Button
							icon={<PlusOutlined />}
							type="primary"
							ghost
							onClick={() => {
								setSelectedProduct(branchProduct);
								setAddProductModalVisible(true);
								const newIndex =
									(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE + index;
								setActiveIndex(newIndex);
							}}
						/>
					</Tooltip>
				) : null;

				row.push(actionContent);
			}

			return row;
		});

		setDataSource(data);
	}, [
		pageNumber,
		products,
		type,
		toggleAction,
		remarks,
		errorRemarks,
		unitInputs,
	]);

	useEffect(() => {
		if (products.length === 0) {
			setActiveIndex(NO_INDEX_SELECTED);
			resetPage();
		} else if (products.length > 0 && activeIndex === NO_INDEX_SELECTED) {
			setActiveIndex(0);
			resetPage();
		}
	}, [products, activeIndex]);

	// Check for empty Unit inputs and notify parent component
	useEffect(() => {
		if (type === 'Requisition Slip' && onUnitValidationChange) {
			const hasEmptyUnits = products.some((product) => {
				const key = product.product?.key;
				const unitValue = unitInputs[key] || '';
				return !unitValue.trim();
			});
			onUnitValidationChange(hasEmptyUnits);
		}
	}, [products, unitInputs, type, onUnitValidationChange]);

	const showRemoveProductConfirmation = (branchProduct, index) => {
		const newIndex = (pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE + index;
		setActiveIndex(newIndex);
		Modal.confirm({
			className: 'EJJYModal Modal__hasFooter',
			title: 'Delete Confirmation',
			icon: <ExclamationCircleOutlined />,
			content: `Are you sure you want to delete ${branchProduct?.product?.name}?`,
			okText: 'Delete',
			cancelText: 'Cancel',
			onOk: () => {
				const newProducts = (products?.product ?? []).filter(
					({ key }) => key !== branchProduct?.product?.key,
				);

				deleteProduct({
					key: branchProduct.product.key,
					product: branchProduct.product,
				});

				const totalPages = Math.ceil(
					newProducts.length / PRODUCT_LENGTH_PER_PAGE,
				);
				const newPageNumber = Math.min(pageNumber, totalPages) || 1;

				const currentPageProducts = newProducts.slice(
					(newPageNumber - 1) * PRODUCT_LENGTH_PER_PAGE,
					newPageNumber * PRODUCT_LENGTH_PER_PAGE,
				);

				if (currentPageProducts.length === 0 && newPageNumber < pageNumber) {
					prevPage();
				}
			},
		});
	};

	const handleEdit = (index) => {
		const newIndex = (pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE + index;
		setActiveIndex(newIndex);
		setEditProductModalVisible(true);
	};

	return (
		<div className="ProductTable">
			<Table
				activeRow={activeIndex}
				columns={columns}
				data={dataSource}
				loading={isLoading}
			/>

			{editProductModalVisible && products?.[activeIndex] && (
				<EditProductModal
					product={products[activeIndex]}
					sign={toggleAction[products[activeIndex]?.product?.key] ? -1 : 1}
					onClose={() => setEditProductModalVisible(false)}
				/>
			)}

			{addProductModalVisible && selectedProduct && (
				<AddProductModal
					product={selectedProduct}
					onClose={() => {
						setAddProductModalVisible(false);
						setSelectedProduct(null);
					}}
					onSuccess={() => {
						setAddProductModalVisible(false);
						setSelectedProduct(null);
					}}
				/>
			)}
		</div>
	);
};
