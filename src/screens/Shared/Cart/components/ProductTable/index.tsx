import {
	ExclamationCircleOutlined,
	DeleteOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { formatInPeso } from 'ejjy-global';
import React, { useEffect, useState } from 'react';
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
}

export const ProductTable = ({ isLoading, type }: Props) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [editProductModalVisible, setEditProductModalVisible] = useState(false);
	const [addProductModalVisible, setAddProductModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [dataSource, setDataSource] = useState([]);

	const {
		products,
		pageNumber,
		deleteProduct,
		prevPage,
		resetPage,
	} = useBoundStore(
		(state: any) => ({
			products: state.products,
			pageNumber: state.pageNumber,
			deleteProduct: state.deleteProduct,
			nextPage: state.nextPage,
			prevPage: state.prevPage,
			resetPage: state.resetPage,
		}),
		shallow,
	);

	const baseColumns = [
		{ name: '', width: '1px' },
		{ name: 'Barcode', width: '40px' },
		{ name: 'Product Name', alignment: 'center' },
		{ name: 'Qty', alignment: 'center' },
	];

	const columns = [...baseColumns];

	if (type === 'Requisition Slip') {
		columns.push(
			{ name: 'Balance', alignment: 'center' },
			{ name: 'Status', alignment: 'center' },
		);
	} else if (type !== 'Receiving Report' && type !== 'Delivery Receipt') {
		columns.push(
			{ name: 'Unit Price', alignment: 'center' },
			{ name: 'Amount', alignment: 'center' },
		);
	}

	if (type === 'Delivery Receipt' || type === 'Receiving Report') {
		columns.push({ name: 'Action', alignment: 'center' });
	}

	useEffect(() => {
		const paginatedProducts = products.slice(
			(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE,
			pageNumber * PRODUCT_LENGTH_PER_PAGE,
		);

		const data = paginatedProducts.map((branchProduct, index) => {
			const {
				product,
				max_balance,
				current_balance,
				product_status,
				quantity,
			} = branchProduct;

			const {
				barcode,
				textcode,
				name,
				price_per_piece,
				key,
				is_multiple_instance,
			} = product;

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
				const balance = `${current_balance} / ${max_balance}`;
				const status = getBranchProductStatus(product_status);

				row.push(
					<Tooltip
						key={`tooltip-balance-${key}`}
						placement="top"
						title={`Balance: ${balance}`}
					>
						{balance}
					</Tooltip>,
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
	}, [pageNumber, products, type]);

	useEffect(() => {
		if (products.length === 0) {
			setActiveIndex(NO_INDEX_SELECTED);
			resetPage();
		} else if (products.length > 0 && activeIndex === NO_INDEX_SELECTED) {
			setActiveIndex(0);
			resetPage();
		}
	}, [products, activeIndex]);

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
