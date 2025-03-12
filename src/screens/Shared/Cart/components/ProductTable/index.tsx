import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { formatInPeso } from 'ejjy-global';
import React, { useEffect, useState } from 'react';
import { EditProductModal } from 'screens/Shared/Cart/components/EditProductModal';
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
	// STATES
	const [activeIndex, setActiveIndex] = useState(0);
	const [editProductModalVisible, setEditProductModalVisible] = useState(false);
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
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

	// METHODS
	const columns = [
		{ name: '', width: '1px' },
		{ name: 'Barcode', width: '40px' },
		{ name: 'Description', alignment: 'center' },
		{ name: 'Qty', alignment: 'center' },
		{ name: 'Unit Price', alignment: 'center' },
		{ name: 'Amount', alignment: 'center' },
	];

	// Adjust column names based on `type`
	if (type === 'Receiving Report') {
		columns[4].name = 'Unit Cost';
		columns[5].name = 'Total Cost';
	} else if (type === 'Requisition Slip') {
		columns[4].name = 'Balance';
		columns[5].name = 'Status';
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
				unit_of_measurement,
			} = branchProduct;

			const {
				barcode,
				textcode,
				print_details,
				cost_per_piece,
				price_per_piece,
				key,
			} = product;

			let unitPrice = price_per_piece; // Default
			let totalPrice = unitPrice * quantity; // Default

			let balance;
			let status;

			// Adjust values for "Receiving Report" and "Requisition Slip"
			if (type === 'Receiving Report') {
				unitPrice = cost_per_piece;
				totalPrice = unitPrice * quantity;
			} else if (type === 'Requisition Slip') {
				balance = `${current_balance} / ${max_balance}`;
				status = getBranchProductStatus(product_status);
			}

			return [
				<Tooltip key={`tooltip-delete-${key}`} placement="top" title="Remove">
					<Button
						icon={<DeleteOutlined />}
						type="primary"
						danger
						ghost
						onClick={() => showRemoveProductConfirmation(branchProduct)}
					/>
				</Tooltip>,

				<Tooltip
					key={`tooltip-barcode-${key}`}
					placement="top"
					title={barcode || textcode}
				>
					{barcode || textcode}
				</Tooltip>,

				<Tooltip
					key={`tooltip-name-${key}`}
					placement="top"
					title={print_details}
				>
					{print_details}
				</Tooltip>,

				<Button
					key={`btn-edit-quantity-${key}`}
					type="text"
					onClick={() => handleEdit(index)}
				>
					{formatQuantity({ unitOfMeasurement: unit_of_measurement, quantity })}
				</Button>,

				<Tooltip
					key={`tooltip-unit-price-${key}`}
					placement="top"
					title={
						type === 'Requisition Slip'
							? `Balance: ${balance}`
							: `Unit Price: ${formatInPeso(unitPrice)}`
					}
				>
					{type === 'Requisition Slip' ? balance : formatInPeso(unitPrice)}
				</Tooltip>,

				<Tooltip
					key={`tooltip-total-price-${key}`}
					placement="top"
					title={
						type === 'Requisition Slip'
							? `Status: ${status}`
							: `Total Amount: ${formatInPeso(totalPrice)}`
					}
				>
					{type === 'Requisition Slip' ? status : formatInPeso(totalPrice)}
				</Tooltip>,
			];
		});

		setDataSource(data);
	}, [pageNumber, products]);

	useEffect(() => {
		if (products.length === 0) {
			setActiveIndex(NO_INDEX_SELECTED);
			resetPage();
		} else if (products.length > 0 && activeIndex === NO_INDEX_SELECTED) {
			setActiveIndex(0);
			resetPage();
		}
	}, [products, activeIndex]);

	const showRemoveProductConfirmation = (branchProduct) => {
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

				deleteProduct(branchProduct?.product?.key);

				const totalPages = Math.ceil(
					newProducts.length / PRODUCT_LENGTH_PER_PAGE,
				);
				const newPageNumber = Math.min(pageNumber, totalPages) || 1;

				// Get the updated current page products
				const currentPageProducts = newProducts.slice(
					(newPageNumber - 1) * PRODUCT_LENGTH_PER_PAGE,
					newPageNumber * PRODUCT_LENGTH_PER_PAGE,
				);

				// If the current page is empty and there's a previous page, go back
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
		</div>
	);
};
