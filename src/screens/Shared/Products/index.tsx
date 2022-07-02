import { SearchOutlined } from '@ant-design/icons';
import { Alert, Col, Input, Row, Select, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import {
	Content,
	ModifyProductModal,
	RequestErrors,
	TableActions,
	TableHeader,
	ViewProductModal,
} from 'components';
import { Box, ButtonLink, Label } from 'components/elements';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	SEARCH_DEBOUNCE_TIME,
} from 'global';
import {
	usePingOnlineServer,
	useProductCategories,
	useProductDelete,
	useProducts,
	useQueryParams,
} from 'hooks';
import { useAuth } from 'hooks/useAuth';
import { useUsers } from 'hooks/useUsers';
import { debounce } from 'lodash';
import * as queryString from 'query-string';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { convertIntoArray, isUserFromBranch } from 'utils';
import { PricesModal } from '../../../components/modals/PricesModal';

const columns: ColumnsType = [
	{
		title: 'Barcode',
		dataIndex: 'barcode',
		width: 150,
		fixed: 'left',
	},
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const modals = {
	VIEW: 0,
	MODIFY: 1,
	EDIT_PRICE_COST: 2,
};

export const Products = () => {
	// STATES
	const [modalType, setModalType] = useState(null);
	const [dataSource, setDataSource] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [hasPendingTransactions, setHasPendingTransactions] = useState(false);

	// REFS
	const pendingTransactionsRef = useRef(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { isConnected } = usePingOnlineServer();
	const { user } = useAuth();
	const {
		data: { products, total },
		isFetching: isFetchingProducts,
		error: listError,
	} = useProducts({ params });
	const { mutate: deleteProduct, error: deleteError } = useProductDelete();

	// METHODS
	useEffect(() => {
		const formattedProducts =
			products?.map((product) => {
				const { id, barcode, name, textcode } = product;

				return {
					key: id,
					barcode: (
						<ButtonLink
							text={barcode || textcode}
							onClick={() => onOpenModal(product, modals.VIEW)}
						/>
					),
					name,
					actions: hasPendingTransactions ? null : (
						<TableActions
							areButtonsDisabled={isConnected === false}
							onAddName="Set Prices"
							onAddIcon={require('assets/images/icon-money.svg')}
							onAdd={() => onOpenModal(product, modals.EDIT_PRICE_COST)}
							onEdit={
								isUserFromBranch(user)
									? undefined
									: () => onOpenModal(product, modals.MODIFY)
							}
							onRemove={
								isUserFromBranch(user)
									? undefined
									: () =>
											deleteProduct({ id: product.id, actingUserId: user.id })
							}
						/>
					),
				};
			}) || [];

		setDataSource(formattedProducts);
	}, [products, user, hasPendingTransactions, isConnected]);

	const onOpenModal = (product, type) => {
		setModalType(type);
		setSelectedProduct(product);
	};

	// NOTE: Temporarily disable the initial deletion of data
	// const onRemoveProduct = (product) => {
	// 	removeProduct(
	// 		{ id: product.id, actingUserId: user.id },
	// 		({ status, response }) => {
	// 			if (status === request.SUCCESS) {
	// 				if (response?.length) {
	// 					message.warning(
	// 						'We found an error while deleting the product details in local branch. Please check the pending transaction table below.',
	// 					);

	// 					pendingTransactionsRef.current?.refreshList();
	// 				}

	// 				refreshList();
	// 			}
	// 		},
	// 	);
	// };

	return (
		<Content className="Products" title="Products">
			{isConnected === false && (
				<Alert
					className="mb-4"
					message="Online Server cannot be reached."
					description="Create, Edit, and Delete functionalities are temporarily disabled until connection to Online Server is restored."
					type="error"
					showIcon
				/>
			)}

			<Box>
				<TableHeader
					buttonName="Create Product"
					onCreateDisabled={isConnected === false}
					onCreate={
						isUserFromBranch(user)
							? undefined
							: () => onOpenModal(null, modals.MODIFY)
					}
				/>

				<RequestErrors
					className="PaddingHorizontal"
					errors={[
						...convertIntoArray(listError, 'Product'),
						...convertIntoArray(deleteError?.errors, 'Product Delete'),
					]}
					withSpaceBottom
				/>

				<Filter
					setQueryParams={(params) => {
						setQueryParams(params, { shouldResetPage: true });
					}}
				/>

				<Table
					columns={columns}
					dataSource={dataSource}
					scroll={{ x: 650 }}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total,
						pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
						onChange: (page, newPageSize) => {
							setQueryParams({
								page,
								pageSize: newPageSize,
							});
						},
						disabled: !dataSource,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					loading={isFetchingProducts}
				/>

				{modalType === modals.VIEW && selectedProduct && (
					<ViewProductModal
						product={selectedProduct}
						onClose={() => onOpenModal(null, null)}
					/>
				)}

				{modalType === modals.MODIFY && (
					<ModifyProductModal
						product={selectedProduct}
						onClose={() => onOpenModal(null, null)}
					/>
				)}

				{modalType === modals.EDIT_PRICE_COST && selectedProduct && (
					<PricesModal
						product={selectedProduct}
						onClose={() => onOpenModal(null, null)}
					/>
				)}
			</Box>

			{/* TODO: Temporarily hid the Pending Transactions section. Need to be revisited if this is still needed */}
			{/* {!isUserFromBranch(user.user_type) && (
				<PendingTransactionsSection
					ref={pendingTransactionsRef}
					title="Pending Product Transactions"
					transactionType={pendingTransactionTypes.PRODUCTS}
					setHasPendingTransactions={setHasPendingTransactions}
					withActionColumn
				/>
			)} */}
		</Content>
	);
};

interface FilterProps {
	setQueryParams: any;
}

const Filter = ({ setQueryParams }: FilterProps) => {
	// CUSTOM HOOKS
	const history = useHistory();
	const params = queryString.parse(history.location.search);
	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
		error: productCategoriesErrors,
	} = useProductCategories({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	// METHODS
	const onSearchDebounced = useCallback(
		debounce((search) => {
			setQueryParams({ search });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<Row className="PaddingHorizontal PaddingVertical pt-0" gutter={[16, 16]}>
			<Col span={24}>
				<RequestErrors
					className="PaddingHorizontal"
					errors={convertIntoArray(productCategoriesErrors, 'Product Category')}
				/>
			</Col>

			<Col lg={12} span={24}>
				<Label label="Search" spacing />
				<Input
					prefix={<SearchOutlined />}
					defaultValue={params.search}
					onChange={(event) => onSearchDebounced(event.target.value.trim())}
					allowClear
				/>
			</Col>

			<Col lg={12} span={24}>
				<Label label="Category" spacing />
				<Select
					style={{ width: '100%' }}
					defaultValue={params.productCategory}
					onChange={(value) => {
						setQueryParams({ productCategory: value });
					}}
					loading={isFetchingProductCategories}
					optionFilterProp="children"
					filterOption={(input, option) =>
						option.children
							.toString()
							.toLowerCase()
							.indexOf(input.toLowerCase()) >= 0
					}
					showSearch
					allowClear
				>
					{productCategories.map(({ name }) => (
						<Select.Option value={name}>{name}</Select.Option>
					))}
				</Select>
			</Col>
		</Row>
	);
};