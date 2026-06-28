import { EyeOutlined } from '@ant-design/icons';
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
import { PricesModal, ViewPurchaseModal } from 'components/modals';
import { Label } from 'components/elements';
import { EMPTY_CELL, filterOption } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import {
	useBranches,
	usePurchaseCostNotificationResolve,
	usePurchaseCostNotifications,
	useQueryParams,
} from 'hooks';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useUserStore } from 'stores';
import { convertIntoArray, formatInPeso, isUserFromOffice } from 'utils';

interface Props {
	branchId?: number;
}

export const TabPurchaseCostNotifications = ({ branchId }: Props) => {
	const [dataSource, setDataSource] = useState([]);
	const [selectedNotification, setSelectedNotification] = useState<any>(null);
	const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
	const queryClient = useQueryClient();
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const showBranchColumn = isUserFromOffice(user.user_type) && !branchId;
	const showActionsColumn = isUserFromOffice(user.user_type);

	const {
		mutateAsync: resolveNotification,
	} = usePurchaseCostNotificationResolve();

	const {
		data: { notifications, total },
		isFetching,
		error,
	} = usePurchaseCostNotifications({
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
		{ title: 'Purchase Ref #', dataIndex: 'referenceNumber' },
		...(showBranchColumn ? [{ title: 'Branch', dataIndex: 'branch' }] : []),
		{ title: 'Product', dataIndex: 'product' },
		{ title: 'Current Cost', dataIndex: 'oldCost', align: 'right' as const },
		{ title: 'Purchase Cost', dataIndex: 'newCost', align: 'right' as const },
		{ title: 'Difference', dataIndex: 'difference', align: 'right' as const },
		...(showActionsColumn
			? [{ title: 'Actions', dataIndex: 'actions', align: 'center' as const }]
			: []),
	];

	useEffect(() => {
		const data = notifications.map((n: any) => {
			const oldCost = parseFloat(n.old_cost_per_piece);
			const newCost = parseFloat(n.new_cost_per_piece);
			const diff = newCost - oldCost;

			return {
				key: n.id,
				referenceNumber: n.purchase ? (
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
				oldCost: formatInPeso(oldCost),
				newCost: formatInPeso(newCost),
				difference: (
					<Tag color={diff > 0 ? 'red' : 'green'}>
						{diff > 0 ? '+' : ''}
						{formatInPeso(diff)}
					</Tag>
				),
				...(showActionsColumn && {
					actions: (
						<Space size={4}>
							<Tooltip title="Edit Prices">
								<Button
									icon={<EyeOutlined />}
									size="small"
									type="primary"
									ghost
									onClick={() => setSelectedNotification(n)}
								/>
							</Tooltip>
						</Space>
					),
				}),
			};
		});

		setDataSource(data);
	}, [notifications, showActionsColumn]);

	const handleResolve = async (id: number) => {
		try {
			await resolveNotification(id);
			queryClient.invalidateQueries('usePurchaseCostNotifications');
		} catch {
			message.error('Failed to resolve notification.');
		}
	};

	const selectedOldCost = selectedNotification
		? parseFloat(selectedNotification.old_cost_per_piece)
		: 0;
	const selectedNewCost = selectedNotification
		? parseFloat(selectedNotification.new_cost_per_piece)
		: 0;

	return (
		<>
			<TableHeader title="Purchase Cost Changes" wrapperClassName="pt-2 px-0" />

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
				scroll={{ x: 800 }}
				bordered
			/>

			{selectedPurchase && (
				<ViewPurchaseModal
					purchase={selectedPurchase}
					onClose={() => setSelectedPurchase(null)}
				/>
			)}

			{selectedNotification && (
				<PricesModal
					costDiffInfo={{
						oldCost: selectedOldCost,
						newCost: selectedNewCost,
						diff: selectedNewCost - selectedOldCost,
					}}
					product={selectedNotification.product}
					onClose={() => setSelectedNotification(null)}
					onSuccess={() => handleResolve(selectedNotification.id)}
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
