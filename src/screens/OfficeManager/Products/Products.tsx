/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Container, Table, TableActions, TableHeader } from '../../../components';
import { Box, ButtonLink } from '../../../components/elements';
import { PendingTransactionsSection } from '../../../components/PendingTransactionsSection/PendingTransactionsSection';
import { types as pendingTransactionsTypes } from '../../../ducks/OfficeManager/pending-transactions';
import { types } from '../../../ducks/OfficeManager/products';
import { pendingTransactionTypes, request } from '../../../global/types';
import { useProducts } from '../../../hooks/useProducts';
import { calculateTableHeight } from '../../../utils/function';
import { usePendingTransactions } from '../hooks/usePendingTransactions';
import { CreateEditProductModal } from './components/CreateEditProductModal';
import { ViewProductModal } from './components/ViewProductModal';

const columns = [
	{ title: 'Barcode', dataIndex: 'barcode' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const Products = () => {
	// STATES
	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [createEditProductModalVisible, setCreateEditProductModalVisible] = useState(false);
	const [viewProductModalVisible, setViewProductModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);

	// CUSTOM HOOKS
	const {
		products,
		getProducts,
		removeProduct,
		status: productStatus,
		recentRequest,
	} = useProducts();
	const {
		pendingTransactions,
		listPendingTransactions,
		status: pendingTransactionsStatus,
		recentRequest: pendingTransactionRecentRequest,
	} = usePendingTransactions();

	useEffect(() => {
		getProducts();
	}, []);

	// METHODS
	// Effect: Format products to be rendered in Table
	useEffect(() => {
		let hasPendingTransactions = pendingTransactions.some(
			({ request_model }) => request_model === pendingTransactionTypes.PRODUCTS,
		);

		const formattedProducts = products.map((product) => {
			const { id, barcode, name, textcode } = product;

			return {
				_textcode: textcode,
				_barcode: barcode,
				barcode: <ButtonLink text={barcode || textcode} onClick={() => onView(product)} />,
				name,
				actions: hasPendingTransactions ? null : (
					<TableActions onEdit={() => onEdit(product)} onRemove={() => onRemoveProduct(id)} />
				),
			};
		});

		setData(formattedProducts);
		setTableData(formattedProducts);
	}, [products, pendingTransactions]);

	const getFetchLoading = useCallback(
		() =>
			(productStatus === request.REQUESTING && recentRequest === types.GET_PRODUCTS) ||
			(pendingTransactionsStatus === request.REQUESTING &&
				pendingTransactionRecentRequest === pendingTransactionsTypes.LIST_PENDING_TRANSACTIONS),
		[productStatus, pendingTransactionsStatus, recentRequest, pendingTransactionRecentRequest],
	);

	const onView = (product) => {
		setSelectedProduct(product);
		setViewProductModalVisible(true);
	};

	const onCreate = () => {
		setSelectedProduct(null);
		setCreateEditProductModalVisible(true);
	};

	const onEdit = (product) => {
		setSelectedProduct(product);
		setCreateEditProductModalVisible(true);
	};

	const onSearch = (keyword) => {
		keyword = keyword?.toLowerCase();
		const filteredData =
			keyword.length > 0
				? data.filter((item) => {
						const name = item?.name?.toLowerCase() ?? '';
						const barcode = item?._barcode?.toLowerCase() ?? '';
						const textcode = item?._textcode?.toLowerCase() ?? '';

						return (
							name.includes(keyword) || barcode.includes(keyword) || textcode.includes(keyword)
						);
				  })
				: data;

		setTableData(filteredData);
	};

	const onRemoveProduct = (productId) => {
		removeProduct(productId, ({ status, response }) => {
			if (status === request.SUCCESS) {
				if (response?.length) {
					message.warning(
						'We found an error while deleting the product details in local branch. Please check the pending transaction table below.',
					);
					listPendingTransactions(null);
				}
			}
		});
	};

	return (
		<Container title="Products" loading={getFetchLoading()} loadingText="Fetching data...">
			<section className="Products">
				<Box>
					<TableHeader buttonName="Create Product" onSearch={onSearch} onCreate={onCreate} />

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
						loading={productStatus === request.REQUESTING && recentRequest !== types.GET_PRODUCTS}
					/>

					<ViewProductModal
						product={selectedProduct}
						visible={viewProductModalVisible}
						onClose={() => setViewProductModalVisible(false)}
					/>

					<CreateEditProductModal
						product={selectedProduct}
						visible={createEditProductModalVisible}
						onFetchPendingTransactions={listPendingTransactions}
						onClose={() => setCreateEditProductModalVisible(false)}
					/>
				</Box>
			</section>

			<PendingTransactionsSection
				title="Pending Product Transactions"
				transactionType={pendingTransactionTypes.PRODUCTS}
			/>
		</Container>
	);
};

export default Products;
