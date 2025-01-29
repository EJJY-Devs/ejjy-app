import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { getKeyDownCombination, formatInPeso } from 'ejjy-global';
import { useHistory } from 'react-router';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { EditProductModal } from 'screens/Shared/Cart/components/EditProductModal';
import { Table } from 'screens/Shared/Cart/components/ProductTable/components/Table';
import {
	NO_INDEX_SELECTED,
	PRODUCT_LENGTH_PER_PAGE,
	deleteItemShortcutKeys,
	editQuantityShortcutKeys,
} from 'screens/Shared/Cart/data';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { formatQuantity } from 'utils';
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

	const columns = [
		{ name: '', width: '1px' },
		{ name: 'Barcode', width: '40px' },
		{ name: 'Description', alignment: 'center' },
		{ name: 'Qty', alignment: 'center' },
		{
			name: type === 'Receiving Report' ? 'Unit Cost' : 'Unit Price',
			alignment: 'center',
		},
		{
			name: type === 'Receiving Report' ? 'Total Cost' : 'Amount',
			alignment: 'center',
		},
	];

	// METHODS
	useEffect(() => {
		const data = products
			.slice(
				(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE,
				pageNumber * PRODUCT_LENGTH_PER_PAGE,
			)
			.map((product, index) => {
				// Determine the unit price and total price based on the title
				const unitPrice =
					type === 'Receiving Report'
						? product.cost_per_piece
						: product.price_per_piece;

				const totalPrice = unitPrice * product.quantity;

				return [
					<Tooltip
						key={`tooltip-delete-${product.id || index}`}
						placement="top"
						title="Remove"
					>
						<Button
							icon={<DeleteOutlined />}
							type="primary"
							danger
							ghost
							onClick={() => showRemoveProductConfirmation(product)}
						/>
					</Tooltip>,

					<Tooltip
						key={`tooltip-barcode-${product.id || index}`}
						placement="top"
						title={product.barcode || product.textcode}
					>
						{product.barcode || product.textcode}
					</Tooltip>,

					<Tooltip
						key="productName"
						placement="top"
						title={product.print_details}
					>
						{product.name}
					</Tooltip>,

					<Button
						key="btnEditQuantity"
						type="text"
						onClick={() => handleEdit(index)}
					>
						{formatQuantity({
							unitOfMeasurement: product.unit_of_measurement,
							quantity: product.quantity,
						})}
					</Button>,

					<Tooltip
						key={`tooltip-unit-price-${product.id || index}`}
						placement="top"
						title={`Unit Price: ${formatInPeso(unitPrice)}`}
					>
						{formatInPeso(unitPrice)}
					</Tooltip>,

					<Tooltip
						key={`tooltip-total-price-${product.id || index}`}
						placement="top"
						title={`Total Price: ${formatInPeso(totalPrice)}`}
					>
						{formatInPeso(totalPrice)}
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

	const showRemoveProductConfirmation = (product) => {
		Modal.confirm({
			className: 'EJJYModal Modal__hasFooter',
			title: 'Delete Confirmation',
			icon: <ExclamationCircleOutlined />,
			content: `Are you sure you want to delete ${product.name}?`,
			okText: 'Delete',
			cancelText: 'Cancel',
			onOk: () => {
				const newProducts = products.filter(({ key }) => key !== product.key);

				deleteProduct(product.key);

				const currentPageProducts = newProducts.slice(
					(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE,
					pageNumber * PRODUCT_LENGTH_PER_PAGE,
				);

				if (currentPageProducts.length === 0) {
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
