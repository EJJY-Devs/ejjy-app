import {
	AreaChartOutlined,
	DeleteOutlined,
	DollarCircleOutlined,
	EditFilled,
	PrinterFilled,
	SearchOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	Input,
	message,
	Popconfirm,
	Row,
	Select,
	Space,
	Table,
	Tooltip,
	Upload,
} from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import cn from 'classnames';
import {
	ConnectionAlert,
	Content,
	ModifyProductModal,
	PricesModal,
	ProductsInfo,
	RequestErrors,
	TableHeader,
	ViewBranchProductChartModal,
	ViewProductModal,
} from 'components';
import { Box, Label } from 'components/elements';
import { printProductPriceTag } from 'configurePrinter';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	SEARCH_DEBOUNCE_TIME,
	userTypes,
} from 'global';
import {
	usePingOnlineServer,
	useProductCategories,
	useProductDelete,
	useProductReinitialize,
	useQueryParams,
} from 'hooks';
import jsPDF from 'jspdf';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useProductsData } from 'screens/Shared/Products/useProductsData';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	filterOption,
	getId,
	getLocalBranchId,
	getProductCode,
	isCUDShown,
	isUserFromBranch,
} from 'utils';

const columns: ColumnsType = [
	{
		title: 'Code',
		dataIndex: 'code',
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
	CHART: 4,
};

export const Products = () => {
	// STATES
	const [modalType, setModalType] = useState(null);
	const [dataSource, setDataSource] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [hasPendingTransactions] = useState(false);
	const [isCreatingPdf, setIsCreatingPdf] = useState(false);
	const [html, setHtml] = useState('');

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { isConnected } = usePingOnlineServer();
	const user = useUserStore((state) => state.user);
	const {
		data: { products, total: productsTotal },
		isFetching: isFetchingProducts,
		error: productsError,
	} = useProductsData({
		params: {
			...params,
			branchId: getLocalBranchId(),
		},
		user,
	});
	const {
		mutateAsync: deleteProduct,
		isLoading: isDeletingProduct,
		error: deleteProductError,
	} = useProductDelete();
	const {
		mutateAsync: reinitializeProduct,
		isLoading: isReinitializingProduct,
		error: reinitializeProductError,
	} = useProductReinitialize();

	// METHODS
	useEffect(() => {
		const formattedProducts = products.map((product) => {
			const { id, name } = product;

			return {
				key: id,
				code: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => handleOpenModal(product, modals.VIEW)}
					>
						{getProductCode(product)}
					</Button>
				),
				name,
				actions: hasPendingTransactions ? null : (
					<Space>
						<Tooltip title="Set Prices">
							<Button
								disabled={isConnected === false}
								icon={<DollarCircleOutlined />}
								type="primary"
								ghost
								onClick={() => handleOpenModal(product, modals.EDIT_PRICE_COST)}
							/>
						</Tooltip>
						{isCUDShown(user.user_type) && (
							<Tooltip title="Edit">
								<Button
									disabled={isConnected === false}
									icon={<EditFilled />}
									type="primary"
									ghost
									onClick={() => handleOpenModal(product, modals.MODIFY)}
								/>
							</Tooltip>
						)}
						<Tooltip title="Print Price Tag">
							<Button
								disabled={isConnected === false}
								icon={<PrinterFilled />}
								loading={isCreatingPdf === product.id}
								type="primary"
								ghost
								onClick={() => {
									handleCreatePdf(product);
								}}
							/>
						</Tooltip>
						<Tooltip title="Show Chart">
							<Button
								icon={<AreaChartOutlined />}
								type="primary"
								ghost
								onClick={() => handleOpenModal(product, modals.CHART)}
							/>
						</Tooltip>
						{isCUDShown(user.user_type) && (
							<Popconfirm
								cancelText="No"
								disabled={isConnected === false}
								okText="Yes"
								placement="left"
								title="Are you sure to remove this?"
								onConfirm={async () => {
									await deleteProduct({
										id: getId(product),
										actingUserId: getId(user),
									});

									message.success('Product was deleted successfully.');
								}}
							>
								<Tooltip title="Remove">
									<Button
										icon={<DeleteOutlined />}
										type="primary"
										danger
										ghost
									/>
								</Tooltip>
							</Popconfirm>
						)}
					</Space>
				),
			};
		});

		setDataSource(formattedProducts);
	}, [products, user, hasPendingTransactions, isConnected, isCreatingPdf]);

	const handleOpenModal = (product, type) => {
		setModalType(type);
		setSelectedProduct(product);
	};

	const handleCreatePdf = (product) => {
		setIsCreatingPdf(product.id);

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF('l', 'px', [113.38582677, 75.590551181]);

		const dataHtml = printProductPriceTag(product);

		setHtml(dataHtml);

		setTimeout(() => {
			pdf.html(dataHtml, {
				margin: 0,
				filename: `ProductPriceTag_${product.print_details}`,
				callback: (instance) => {
					window.open(instance.output('bloburl').toString());
					setIsCreatingPdf(false);
					setHtml('');
				},
			});
		}, 500);
	};

	const handleReinitialize = async (file) => {
		const formData = new FormData();
		formData.append('csv_file', file);

		await reinitializeProduct(formData);

		message.success('Products were reinitialized successfully.');

		return false;
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
		<Content
			title={`${
				isUserFromBranch(user.user_type) ? 'Branch' : 'General'
			} Products`}
		>
			<ProductsInfo />

			<ConnectionAlert />

			<Box>
				{isCUDShown(user.user_type) && (
					<TableHeader
						buttonName="Create Product"
						buttons={
							user.user_type === userTypes.OFFICE_MANAGER && (
								<Upload
									accept=".csv"
									beforeUpload={handleReinitialize}
									disabled={isReinitializingProduct}
									showUploadList={false}
								>
									<Button
										icon={<UploadOutlined />}
										loading={isReinitializingProduct}
									>
										Upload CSV
									</Button>
								</Upload>
							)
						}
						onCreate={() => handleOpenModal(null, modals.MODIFY)}
						onCreateDisabled={isConnected === false}
					/>
				)}

				<RequestErrors
					className={cn('px-6', {
						'mt-6': !isCUDShown(user.user_type),
					})}
					errors={[
						...convertIntoArray(productsError, 'Product'),
						...convertIntoArray(deleteProductError?.errors, 'Product Delete'),
						...convertIntoArray(
							reinitializeProductError?.errors,
							'Product Reinitialize',
						),
					]}
				/>

				<Filter />

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={
						isFetchingProducts || isDeletingProduct || isReinitializingProduct
					}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total: productsTotal,
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
					scroll={{ x: 650 }}
					bordered
				/>

				{modalType === modals.VIEW && selectedProduct && (
					<ViewProductModal
						product={selectedProduct}
						onClose={() => handleOpenModal(null, null)}
					/>
				)}

				{modalType === modals.MODIFY && (
					<ModifyProductModal
						product={selectedProduct}
						onClose={() => handleOpenModal(null, null)}
					/>
				)}

				{modalType === modals.EDIT_PRICE_COST && selectedProduct && (
					<PricesModal
						product={selectedProduct}
						onClose={() => handleOpenModal(null, null)}
					/>
				)}

				{modalType === modals.CHART && selectedProduct && (
					<ViewBranchProductChartModal
						branchProduct={
							isUserFromBranch(user.user_type) ? selectedProduct : undefined
						}
						product={
							isUserFromBranch(user.user_type) ? undefined : selectedProduct
						}
						onClose={() => handleOpenModal(null, null)}
					/>
				)}
			</Box>

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: html }}
				style={{ display: 'none' }}
			/>

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

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
		error: productCategoriesErrors,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// METHODS
	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setQueryParams({ search }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<>
			<RequestErrors
				className="px-6"
				errors={convertIntoArray(productCategoriesErrors, 'Product Category')}
			/>

			<Row
				className={cn('pa-6', {
					'pt-0': isCUDShown(user.user_type),
				})}
				gutter={[16, 16]}
			>
				<Col lg={12} span={24}>
					<Label label="Search" spacing />
					<Input
						defaultValue={params.search}
						prefix={<SearchOutlined />}
						allowClear
						onChange={(event) =>
							handleSearchDebounced(event.target.value.trim())
						}
					/>
				</Col>

				<Col lg={12} span={24}>
					<Label label="Category" spacing />
					<Select
						className="w-100"
						defaultValue={params.productCategory}
						filterOption={filterOption}
						loading={isFetchingProductCategories}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ productCategory: value },
								{ shouldResetPage: true },
							);
						}}
					>
						{productCategories.map(({ id, name }) => (
							<Select.Option key={id} value={name}>
								{name}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>
		</>
	);
};
