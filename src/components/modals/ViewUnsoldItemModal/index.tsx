import {
	DeleteOutlined,
	DollarCircleOutlined,
	FileTextOutlined,
	PrinterOutlined,
} from '@ant-design/icons';
import {
	Button,
	Modal,
	Popconfirm,
	Space,
	Table,
	Typography,
	message,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons } from 'components/Printing';
import dayjs from 'dayjs';
import {
	Branch,
	BranchMachine,
	printUnsoldItem,
	ReceiptHeaderV2,
} from 'ejjy-global';
import { appTypes, headOfficeTypes } from 'global';
import { usePdf, useProductDelete } from 'hooks';
import React, { useEffect, useState } from 'react';
import { PricesModal } from 'components/modals/PricesModal';
import { ProductsService } from 'services';
import { getLocalApiUrl, getId, getAppType, getHeadOfficeType } from 'utils';
import { useUserStore } from 'stores';

export interface UnsoldItemSummary {
	id?: number;
	name: string;
	quantity: number;
	datetime_created?: string;
	productId?: number;
	online_id?: number;
	branch_product_id?: number;
}

const { Text } = Typography;

interface Props {
	unsoldItemSummary: UnsoldItemSummary[];
	branch: Branch;
	branchMachine?: BranchMachine;
	loading?: boolean;
	reportDate?: string;
	onClose: () => void;
}

export const ViewUnsoldItemModal = ({
	unsoldItemSummary,
	branch,
	branchMachine,
	loading = false,
	reportDate,
	onClose,
}: Props) => {
	// STATES
	const [isCreatingTxt, setIsCreatingTxt] = useState<boolean>(false);
	const [selectedProductId, setSelectedProductId] = useState<number | null>(
		null,
	);
	const [isEditModalVisible, setIsEditModalVisible] = useState(false);
	const [product, setProduct] = useState<any>(null);
	const [isFetchingProduct, setIsFetchingProduct] = useState(false);
	const [filteredUnsoldItems, setFilteredUnsoldItems] = useState<
		UnsoldItemSummary[]
	>(unsoldItemSummary);

	// Update filtered items when prop changes
	useEffect(() => {
		setFilteredUnsoldItems(unsoldItemSummary);
	}, [unsoldItemSummary]);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const appType = getAppType();
	const {
		mutateAsync: deleteProduct,
		isLoading: isDeletingProduct,
	} = useProductDelete();

	useEffect(() => {
		const fetchProduct = async () => {
			if (selectedProductId === null) {
				setProduct(null);
				return;
			}

			setIsFetchingProduct(true);
			try {
				const response = await ProductsService.retrieve(
					selectedProductId,
					getLocalApiUrl(),
				);
				setProduct(response.data);
			} catch (error) {
				console.error('Error fetching product:', error);
				setProduct(null);
			} finally {
				setIsFetchingProduct(false);
			}
		};

		fetchProduct();
	}, [selectedProductId]);

	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `UnsoldItemSummary_${new Date().toISOString().split('T')[0]}`,
		print: () =>
			printUnsoldItem({
				unsoldItemSummary: filteredUnsoldItems,
				branch,
				branchMachine,
				isPdf: true,
				reportDate,
			}),
	});

	// METHODS
	const handlePrint = () => {
		printUnsoldItem({
			unsoldItemSummary: filteredUnsoldItems,
			branch,
			branchMachine,
			reportDate,
		});
	};

	const handleCreateTxt = () => {
		setIsCreatingTxt(true);
		// TODO: Implement createUnsoldItemTxt when TXT printing is needed
		console.log('Create unsold item TXT:', {
			unsoldItemSummary: filteredUnsoldItems,
			branch,
			branchMachine,
		});
		setIsCreatingTxt(false);
	};

	const handleEditPrice = (item: UnsoldItemSummary) => {
		if (!item.productId) {
			console.error('No productId found in item:', item);
			return;
		}

		setSelectedProductId(item.productId);
		setIsEditModalVisible(true);
	};

	const handleDeleteProduct = async (item: UnsoldItemSummary) => {
		if (!item.productId) {
			console.error('No productId found in item:', item);
			return;
		}

		try {
			console.log('Deleting product with ID:', item.productId);
			console.log('Using online ID:', item.online_id);
			await deleteProduct({
				id:
					getHeadOfficeType() === headOfficeTypes.MAIN
						? item.online_id
						: item.productId,
				actingUserId: Number(getId(user)),
			});

			// Remove the deleted item from the local state
			setFilteredUnsoldItems((prevItems) =>
				prevItems.filter((i) => i.productId !== item.productId),
			);

			message.success('Product deleted successfully');
		} catch (error) {
			console.error('Error deleting product:', error);
			message.error('Failed to delete product');
		}
	};
	const handleCloseEditModal = () => {
		setIsEditModalVisible(false);
		setSelectedProductId(null);
	};

	// TABLE COLUMNS
	const columns: ColumnsType<UnsoldItemSummary> = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			width: appType === appTypes.HEAD_OFFICE ? '50%' : '70%',
		},
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			key: 'quantity',
			width: appType === appTypes.HEAD_OFFICE ? '20%' : '30%',
			align: 'center',
			render: (quantity: number) => quantity.toLocaleString(),
		},
		...(appType === appTypes.HEAD_OFFICE
			? [
					{
						title: 'Actions',
						key: 'actions',
						width: '30%',
						align: 'center' as const,
						render: (_: any, record: UnsoldItemSummary) => (
							<Space size="small">
								<Button
									icon={<DollarCircleOutlined />}
									size="small"
									type="primary"
									onClick={() => handleEditPrice(record)}
								/>
								<Popconfirm
									cancelText="No"
									okText="Yes"
									title="Are you sure you want to delete this product?"
									onConfirm={() => handleDeleteProduct(record)}
								>
									<Button
										icon={<DeleteOutlined />}
										loading={isDeletingProduct}
										size="small"
										type="primary"
										danger
									/>
								</Popconfirm>
							</Space>
						),
					},
			  ]
			: []),
	];

	const currentDate = dayjs();
	const currentDateTime = currentDate.format('MM/DD/YYYY hh:mm A');

	return (
		<>
			<Modal
				className="Modal__hasFooter"
				footer={[
					<Button
						key="print"
						disabled={isLoadingPdf || isCreatingTxt || loading}
						icon={<PrinterOutlined />}
						type="primary"
						onClick={handlePrint}
					>
						Print
					</Button>,
					<PdfButtons
						key="pdf"
						downloadPdf={downloadPdf}
						isDisabled={isLoadingPdf || loading}
						isLoading={isLoadingPdf}
						previewPdf={previewPdf}
					/>,
					<Button
						key="txt"
						disabled={isLoadingPdf || isCreatingTxt || loading}
						icon={<FileTextOutlined />}
						loading={isCreatingTxt}
						type="primary"
						onClick={handleCreateTxt}
					>
						Create TXT
					</Button>,
				]}
				title="Unsold Items"
				width={425}
				centered
				closable
				open
				onCancel={onClose}
			>
				<ReceiptHeaderV2
					branchHeader={branch}
					branchMachine={branchMachine}
					title="UNSOLD ITEMS"
				/>
				<Space
					align="center"
					className="w-100 text-center"
					direction="vertical"
					size={0}
				>
					<br />
					<Text style={{ whiteSpace: 'pre-line' }} strong>
						Report Date:
					</Text>
					<Text style={{ whiteSpace: 'pre-line' }}>{reportDate}</Text>
				</Space>
				{filteredUnsoldItems.length === 0 ? (
					<div className="py-8 text-center">
						<span>No unsold items found</span>
					</div>
				) : (
					<Table
						className="mt-6"
						columns={columns}
						dataSource={filteredUnsoldItems}
						pagination={{
							defaultPageSize: 20,
							showSizeChanger: true,
							pageSizeOptions: ['20', '50', '100', '200'],
							showTotal: (total, range) =>
								`${range[0]}-${range[1]} of ${total} items`,
						}}
						rowKey="name"
						size="small"
						bordered
					/>
				)}{' '}
				<Space
					align="center"
					className="w-100 text-center"
					direction="vertical"
					size={0}
				>
					<br />
					<Text style={{ whiteSpace: 'pre-line' }}>
						Print Details: {currentDateTime}
					</Text>
				</Space>
				<div
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{ __html: htmlPdf }}
					style={{ display: 'none' }}
				/>
			</Modal>

			{isEditModalVisible && product && !isFetchingProduct && (
				<PricesModal
					isBulkEdit={appType === appTypes.HEAD_OFFICE}
					product={product}
					onClose={handleCloseEditModal}
				/>
			)}
		</>
	);
};
