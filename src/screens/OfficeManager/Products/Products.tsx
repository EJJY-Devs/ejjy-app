/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { Container, Table, TableActions, TableHeader } from '../../../components';
import { Box, ButtonLink } from '../../../components/elements';
import { types } from '../../../ducks/OfficeManager/products';
import { types as pendingTransactionsTypes } from '../../../ducks/OfficeManager/pending-transactions';
import { request } from '../../../global/types';
import { useProducts } from '../../../hooks/useProducts';
import { calculateTableHeight, formatDateTime, showErrorMessages } from '../../../utils/function';
import { usePendingTransactions } from '../hooks/usePendingTransactions';
import { CreateEditProductModal } from './components/CreateEditProductModal';
import { ViewProductModal } from './components/ViewProductModal';
import { pendingTransactionTypes } from '../../../global/types';
import { message } from 'antd';

const columns = [
	{ title: 'Barcode', dataIndex: 'barcode' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const pendingTransactionColumns = [
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Branch', dataIndex: 'branch' },
	{ title: 'Datetime', dataIndex: 'datetime_created' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const Products = () => {
	// STATES
	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [pendingTransactionsData, setPendingTransactionsTableData] = useState([]);
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
		executePendingTransactions,
		removePendingTransactions,
		status: pendingTransactionsStatus,
		recentRequest: pendingTransactionRecentRequest,
	} = usePendingTransactions();

	useEffect(() => {
		getProducts();
		listPendingTransactions(null);
	}, []);

	// METHODS
	// Effect: Format products to be rendered in Table
	useEffect(() => {
		const formattedProducts = products.map((product) => {
			const { id, barcode, name, textcode } = product;

			return {
				_textcode: textcode,
				_barcode: barcode,
				barcode: <ButtonLink text={barcode || textcode} onClick={() => onView(product)} />,
				name,
				actions: pendingTransactionsData?.length ? null : (
					<TableActions onEdit={() => onEdit(product)} onRemove={() => onRemoveProduct(id)} />
				),
			};
		});

		setData(formattedProducts);
		setTableData(formattedProducts);
	}, [products, pendingTransactionsData]);

	// Effect: Format pending transactions to be rendered in Table
	useEffect(() => {
		const formattedPendingTransactions = pendingTransactions
			.filter(({ request_model }) => request_model === pendingTransactionTypes.PRODUCTS)
			.map((pendingTransaction) => {
				const { name, branch, datetime_created } = pendingTransaction;

				return {
					name,
					branch: branch?.name,
					datetime_created: formatDateTime(datetime_created),
					actions: (
						<TableActions
							onExecutePendingTransaction={() => onExecutePendingTransaction(pendingTransaction)}
							onRemove={() => onRemovePendingTransaction(pendingTransaction.id, true)}
						/>
					),
				};
			});

		setPendingTransactionsTableData(formattedPendingTransactions);
	}, [pendingTransactions]);

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

	const onExecutePendingTransaction = (pendingTransaction) => {
		executePendingTransactions(
			{
				...pendingTransaction,
				request_body: JSON.parse(pendingTransaction?.request_body || '{}'),
				request_query_params: JSON.parse(pendingTransaction?.request_query_params || '{}'),
			},
			({ status, error }) => {
				if (status === request.SUCCESS) {
					onRemovePendingTransaction(pendingTransaction.id, false);
				} else if (status === request.ERROR) {
					showErrorMessages(error);
				}
			},
			true,
		);
	};

	const onRemovePendingTransaction = (pendingTransactionId, showFeedbackMessage) => {
		removePendingTransactions(
			{ id: pendingTransactionId },
			({ status, error }) => {
				if (status === request.SUCCESS) {
					listPendingTransactions(null);
				} else if (status === request.ERROR) {
					showErrorMessages(error);
				}
			},
			showFeedbackMessage,
		);
	};

	return (
		<Container title="Products" loading={getFetchLoading()} loadingText="Fetching data...">
			<section className="Products">
				<Box>
					<TableHeader buttonName="Create Product" onSearch={onSearch} onCreate={null} />

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

			<section className="PendingProductTransactions">
				<Box>
					<TableHeader title="Pending Product Transactions" />

					<Table
						columns={pendingTransactionColumns}
						dataSource={pendingTransactionsData}
						scroll={{ y: calculateTableHeight(pendingTransactionsData.length), x: '100%' }}
						loading={pendingTransactionsStatus === request.REQUESTING}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default Products;
