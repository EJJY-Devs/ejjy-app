import {
	AreaChartOutlined,
	DeleteOutlined,
	DollarCircleOutlined,
	EditFilled,
	HomeOutlined,
	PrinterFilled,
	SearchOutlined,
	SyncOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	Input,
	Popconfirm,
	Row,
	Select,
	Space,
	Table,
	Tooltip,
	Upload,
	message,
} from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import cn from 'classnames';
import {
	ConnectionAlert,
	Content,
	EditBranchProductsModal,
	ModifyProductModal,
	PricesModal,
	RequestErrors,
	TableHeader,
	ViewBranchProductChartModal,
	ViewProductModal,
} from 'components';
import { Box, Label } from 'components/elements';
import {
	filterOption,
	getProductCode,
	printProductPriceTag,
} from 'ejjy-global';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
	pageSizeOptions,
} from 'global';
import {
	usePingOnlineServer,
	useProductCategories,
	useProductDelete,
	useProductEditLocal,
	useProductReinitialize,
	useQueryParams,
	useSiteSettings,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useProductsData } from 'screens/Shared/Products/useProductsData';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDateTime,
	getAppTagPrinterFontFamily,
	getAppTagPrinterFontSize,
	getAppTagPrinterPaperHeight,
	getAppTagPrinterPaperWidth,
	getAppType,
	getId,
	getLocalBranchId,
	isUserFromOffice,
	isStandAlone,
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
	EDIT_BRANCH_PRODUCT: 3,
	CHART: 4,
};

export const Products = () => {
	// STATES
	const [modalType, setModalType] = useState(null);
	const [dataSource, setDataSource] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [hasPendingTransactions] = useState(false);
	const [isCreatingPdf, setIsCreatingPdf] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { isConnected } = usePingOnlineServer();
	const user = useUserStore((state) => state.user);
	const {
		data: siteSettings,
		isFetching: isFetchingSiteSettings,
		error: siteSettingsError,
	} = useSiteSettings();
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
	const { mutateAsync: editProductLocal } = useProductEditLocal();

	// Add sync status monitoring
	useQuery(
		'syncStatus',
		() => {
			// Check if we have pending sync operations
			const hasPendingSync = localStorage.getItem('pendingProductSync');
			return { hasPendingSync: !!hasPendingSync };
		},
		{
			refetchInterval: 1000, // Check every second
			enabled: isStandAlone(),
		},
	);

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
						{getAppType() === appTypes.HEAD_OFFICE && (
							<Tooltip title="Edit General Product">
								<Button
									disabled={isConnected === false}
									icon={<EditFilled />}
									type="primary"
									ghost
									onClick={() => handleOpenModal(product, modals.MODIFY)}
								/>
							</Tooltip>
						)}
						<Tooltip title="Edit Branch Product">
							<Button
								disabled={isConnected === false}
								icon={<HomeOutlined />}
								type="primary"
								ghost
								onClick={() =>
									handleOpenModal(product, modals.EDIT_BRANCH_PRODUCT)
								}
							/>
						</Tooltip>
						<Tooltip title="Print Price Tag">
							<Button
								disabled={isConnected === false}
								icon={<PrinterFilled />}
								loading={isCreatingPdf === product.id}
								type="primary"
								ghost
								onClick={() => {
									handlePrintPriceTag(product);
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
						{getAppType() !== appTypes.BACK_OFFICE && (
							<Tooltip title="Sync Manually">
								<Button
									icon={<SyncOutlined />}
									type="primary"
									ghost
									onClick={() => handleManualSync(product)}
								/>
							</Tooltip>
						)}
						{getAppType() === appTypes.HEAD_OFFICE && (
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

	// Add a method to handle successful operations
	const handleOperationSuccess = (successMessage: string) => {
		message.success(successMessage);

		// If standalone, mark that we have pending sync
		if (isStandAlone()) {
			localStorage.setItem('pendingProductSync', 'true');
			setIsSyncing(true);

			// Clear the sync flag after a delay (background sync should complete)
			setTimeout(() => {
				localStorage.removeItem('pendingProductSync');
				setIsSyncing(false);
			}, 5000);
		}
	};

	const handleManualSync = async (product) => {
		try {
			// Use local API edit function to ensure branch products are updated
			// This updates both product and branch products datetime_updated fields
			await editProductLocal({
				id: getId(product),
				actingUserId: getId(user),
				// Just pass the essential fields to trigger the update
				name: product.name,
				description: product.description || '',
				type: product.type,
				unitOfMeasurement: product.unit_of_measurement,
				piecesInBulk: product.pieces_in_bulk,
				pricePerPiece: product.price_per_piece,
				pricePerBulk: product.price_per_bulk,
				costPerPiece: product.cost_per_piece,
				costPerBulk: product.cost_per_bulk,
				isSoldInBranch: product.is_sold_in_branch,
				isVatExempted: product.is_vat_exempted,
				reorderPoint: product.reorder_point,
				maxBalance: product.max_balance,
				productCategory: product.product_category,
			});

			message.success(
				'Manual sync completed. Product and branch products datetime updated for syncing.',
			);
		} catch (error) {
			message.error('Failed to synchronize product');
			console.error('Manual sync error:', error);
		}
	};

	const handlePrintPriceTag = (product) => {
		setIsCreatingPdf(product.id);

		const tagWidth = Number(getAppTagPrinterPaperWidth());
		const tagHeight = Number(getAppTagPrinterPaperHeight());

		printProductPriceTag(product, siteSettings, {
			paperWidth: tagWidth,
			paperHeight: tagHeight,
			fontSize: Number(getAppTagPrinterFontSize()),
			fontFamily: getAppTagPrinterFontFamily(),
		});

		setIsCreatingPdf(false);
	};

	const handleReinitialize = async (file) => {
		const formData = new FormData();
		formData.append('csv_file', file);

		await reinitializeProduct(formData);

		message.success('Products were reinitialized successfully.');

		return false;
	};

	// Calculate product statistics
	const productCount = productsTotal || 0;
	const latestDateTime = siteSettings?.datetime_last_updated_products
		? formatDateTime(siteSettings.datetime_last_updated_products)
		: 'No updates';

	return (
		<Content
			title={`${
				getAppType() === appTypes.BACK_OFFICE ? 'Branch' : 'General'
			} Products`}
		>
			<ConnectionAlert />

			{/* Product Statistics */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					padding: '16px 24px 0 24px',
					fontSize: '14px',
					color: '#666',
				}}
			>
				<div style={{ textAlign: 'right' }}>
					<span style={{ color: '#fa8c16', fontSize: '12px' }}>
						Product Count: <strong>{productCount.toLocaleString()}</strong>
					</span>
					<span
						style={{ marginLeft: '16px', fontSize: '12px', color: '#fa8c16' }}
					>
						Product Last Updated: <strong>{latestDateTime}</strong>
					</span>
				</div>
			</div>

			{/* Add sync indicator */}
			{isSyncing && (
				<div
					className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded"
					style={{
						margin: '16px 0',
						padding: '8px 16px',
						backgroundColor: '#e6f7ff',
						border: '1px solid #91d5ff',
						borderRadius: '4px',
					}}
				>
					<span style={{ color: '#1890ff' }}>
						🔄 Syncing product changes in background...
					</span>
				</div>
			)}

			<Box padding>
				{getAppType() === appTypes.HEAD_OFFICE && (
					<TableHeader
						buttonName="Create Product"
						buttons={
							isUserFromOffice(user.user_type) && (
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
						'mt-6': getAppType() !== appTypes.HEAD_OFFICE,
					})}
					errors={[
						...convertIntoArray(productsError, 'Product'),
						...convertIntoArray(siteSettingsError, 'Settings'),
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
						isFetchingProducts ||
						isDeletingProduct ||
						isReinitializingProduct ||
						isFetchingSiteSettings
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

				{modalType === modals.MODIFY &&
					getAppType() === appTypes.HEAD_OFFICE && (
						<ModifyProductModal
							product={selectedProduct}
							onClose={() => handleOpenModal(null, null)}
							onSuccess={handleOperationSuccess}
						/>
					)}

				{modalType === modals.EDIT_PRICE_COST && selectedProduct && (
					<PricesModal
						product={selectedProduct}
						onClose={() => handleOpenModal(null, null)}
					/>
				)}

				{modalType === modals.EDIT_BRANCH_PRODUCT && selectedProduct && (
					<EditBranchProductsModal
						product={selectedProduct}
						onClose={() => handleOpenModal(null, null)}
					/>
				)}

				{modalType === modals.CHART && selectedProduct && (
					<ViewBranchProductChartModal
						branchProduct={
							getAppType() === appTypes.BACK_OFFICE
								? selectedProduct
								: undefined
						}
						product={
							getAppType() === appTypes.BACK_OFFICE
								? undefined
								: selectedProduct
						}
						onClose={() => handleOpenModal(null, null)}
					/>
				)}
			</Box>
		</Content>
	);
};

const Filter = () => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
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
					'pt-0': getAppType() === appTypes.HEAD_OFFICE,
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
