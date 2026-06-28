import { CheckOutlined, EditOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Row,
	Select,
	Space,
	Table,
	Tag,
	Tooltip,
	message,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader } from 'components';
import { ViewPurchaseModal, ViewPurchaseOrderModal } from 'components/modals';
import { Label } from 'components/elements';
import { EMPTY_CELL, filterOption } from 'ejjy-global';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import {
	useBranches,
	usePurchaseOrderQtyNotifications,
	usePurchaseOrderQtyNotificationResolve,
	useQueryParams,
} from 'hooks';
import React, { useEffect, useState } from 'react';
import { Cart } from 'screens/Shared/Cart';
import { useUserStore } from 'stores';
import { convertIntoArray, getLocalApiUrl, isUserFromOffice } from 'utils';

interface Props {
	branchId?: number;
}

export const TabPurchaseOrderQtyNotifications = ({ branchId }: Props) => {
	const [dataSource, setDataSource] = useState([]);
	const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
	const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<any>(null);
	const [
		adjustmentSlipNotification,
		setAdjustmentSlipNotification,
	] = useState<any>(null);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const showBranchColumn = isUserFromOffice(user.user_type) && !branchId;
	const showActionsColumn = isUserFromOffice(user.user_type);

	const {
		mutateAsync: resolveNotification,
	} = usePurchaseOrderQtyNotificationResolve();

	const {
		data: { notifications, total },
		isFetching,
		error,
	} = usePurchaseOrderQtyNotifications({
		params: {
			branchId:
				branchId ?? (params.branchId ? Number(params.branchId) : undefined),
			isResolved: false,
			page: params.page,
			pageSize: params.pageSize,
		},
		options: { notifyOnChangeProps: ['data'] },
	});

	const columns: ColumnsType = [
		{ title: 'PO Ref #', dataIndex: 'poReferenceNumber' },
		{ title: 'Purchase Ref #', dataIndex: 'purchaseReferenceNumber' },
		...(showBranchColumn ? [{ title: 'Branch', dataIndex: 'branch' }] : []),
		{ title: 'Product', dataIndex: 'product' },
		{ title: 'PO Qty', dataIndex: 'poQty', align: 'center' as const },
		{
			title: 'Purchase Qty',
			dataIndex: 'purchaseQty',
			align: 'center' as const,
		},
		{ title: 'Difference', dataIndex: 'difference', align: 'center' as const },
		...(showActionsColumn
			? [{ title: 'Actions', dataIndex: 'actions', align: 'center' as const }]
			: []),
	];

	const getDiffColor = (diff: number) => {
		if (diff < 0) return 'red';
		if (diff > 0) return 'orange';
		return 'green';
	};

	useEffect(() => {
		const data = notifications
			.filter((n: any) => {
				const poQty = Number(n.po_quantity ?? 0);
				const purchaseQty = Number(n.purchase_quantity ?? 0);
				return purchaseQty !== poQty;
			})
			.map((n: any) => {
				const poQty = Number(n.po_quantity ?? 0);
				const purchaseQty = Number(n.purchase_quantity ?? 0);
				const diff = purchaseQty - poQty;

				return {
					key: n.id,
					poReferenceNumber: n.purchase_order ? (
						<Button
							style={{ padding: 0 }}
							type="link"
							onClick={() => setSelectedPurchaseOrder(n.purchase_order)}
						>
							{n.purchase_order.reference_number}
						</Button>
					) : (
						EMPTY_CELL
					),
					purchaseReferenceNumber: n.purchase ? (
						<Button
							style={{ padding: 0 }}
							type="link"
							onClick={() => setSelectedPurchase(n.purchase)}
						>
							{n.purchase.reference_number}
						</Button>
					) : (
						EMPTY_CELL
					),
					branch: n.branch?.name ?? EMPTY_CELL,
					product: n.product?.name ?? EMPTY_CELL,
					poQty,
					purchaseQty,
					difference: (
						<Tag color={getDiffColor(diff)}>
							{diff > 0 ? '+' : ''}
							{diff}
						</Tag>
					),
					...(showActionsColumn && {
						actions: (
							<Space size={4}>
								<Tooltip title="Accept">
									<Button
										icon={<CheckOutlined />}
										size="small"
										type="primary"
										ghost
										onClick={() => handleAccept(n.id)}
									/>
								</Tooltip>
								<Tooltip title="Accept with Action (Create Adjustment Slip)">
									<Button
										icon={<EditOutlined />}
										size="small"
										type="primary"
										ghost
										onClick={() => setAdjustmentSlipNotification(n)}
									/>
								</Tooltip>
							</Space>
						),
					}),
				};
			});

		setDataSource(data);
	}, [notifications, showActionsColumn]);

	const handleAccept = (id: number) => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			onSuccess: async () => {
				setAuthorizeConfig(null);
				await handleResolve(id);
			},
			onCancel: () => {
				setAuthorizeConfig(null);
			},
		});
	};

	const handleResolve = async (id: number) => {
		try {
			await resolveNotification(id);
			message.success('Notification has been accepted.');
		} catch {
			message.error('Failed to resolve notification.');
		}
	};

	return (
		<>
			<TableHeader title="PO Mismatch" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={convertIntoArray(error, 'Notifications')}
				withSpaceBottom
			/>

			{showBranchColumn && <Filter />}

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetching}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					disabled: !dataSource.length,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					pageSizeOptions,
					position: ['bottomCenter'],
					total,
					onChange: (page, newPageSize) => {
						setQueryParams({ page, pageSize: newPageSize });
					},
				}}
				scroll={{ x: 900 }}
				bordered
			/>

			{selectedPurchaseOrder && (
				<ViewPurchaseOrderModal
					purchaseOrder={selectedPurchaseOrder}
					onClose={() => setSelectedPurchaseOrder(null)}
				/>
			)}

			{selectedPurchase && (
				<ViewPurchaseModal
					purchase={selectedPurchase}
					onClose={() => setSelectedPurchase(null)}
				/>
			)}

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}

			{adjustmentSlipNotification && (
				<Cart
					prePopulatedProduct={{
						branch_product: {
							id: adjustmentSlipNotification.branch_product?.id,
							product: adjustmentSlipNotification.product,
							branch_id: adjustmentSlipNotification.branch?.id,
							branch: adjustmentSlipNotification.branch,
						},
						adjustedBalance:
							(adjustmentSlipNotification.po_quantity ?? 0) -
							(adjustmentSlipNotification.purchase_quantity ?? 0),
						value:
							adjustmentSlipNotification.branch_product?.current_balance ?? 0,
					}}
					type="Adjustment Slip"
					onAdjustmentSlipCreated={() =>
						handleResolve(adjustmentSlipNotification.id)
					}
					onClose={() => setAdjustmentSlipNotification(null)}
				/>
			)}
		</>
	);
};

const Filter = () => {
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({ params: { pageSize: MAX_PAGE_SIZE } });

	return (
		<div className="mb-4">
			<RequestErrors
				errors={convertIntoArray(branchErrors, 'Branches')}
				withSpaceBottom
			/>

			<Row gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="Branch" spacing />
					<Select
						className="w-100"
						filterOption={filterOption}
						loading={isFetchingBranches}
						optionFilterProp="children"
						value={params.branchId ? Number(params.branchId) : null}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ branchId: value }, { shouldResetPage: true });
						}}
					>
						{branches.map((branch: any) => (
							<Select.Option key={branch.id} value={branch.id}>
								{branch.name}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>
		</div>
	);
};
