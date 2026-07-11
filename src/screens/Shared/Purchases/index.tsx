import {
	EyeOutlined,
	FileAddOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	Input,
	message,
	Radio,
	Row,
	Space,
	Table,
	Tooltip,
} from 'antd';
import { Content, TimeRangeFilter } from 'components';
import { Box, Label } from 'components/elements';
import { ViewPurchaseModal, ViewPurchaseOrderModal } from 'components/modals';
import { EMPTY_CELL } from 'ejjy-global';
import { pageSizeOptions, DEFAULT_PAGE, appTypes } from 'global';
import { useQueryParams } from 'hooks';
import usePurchases, { usePurchaseUpdate } from 'hooks/usePurchases';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { JournalEntriesService } from 'services';
import { Cart } from 'screens/Shared/Cart';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import { CreateJournalEntryModal } from 'screens/Shared/Accounting/modals/CreateJournalEntryModal';
import { formatDateTime, getLocalApiUrl, getAppType } from 'utils';
import { ViewPurchaseJournalEntriesModal } from './ViewPurchaseJournalEntriesModal';

import './style.scss';

export const Purchases = () => {
	const { pathname } = useLocation();
	const isOfficeManager = pathname.startsWith('/office-manager');
	const isBackOffice = getAppType() === appTypes.BACK_OFFICE;
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	const [dataSource, setDataSource] = useState([]);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
	const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
	const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<any>(null);
	const [purchaseForJE, setPurchaseForJE] = useState<any>(null);
	const [viewJePurchase, setViewJePurchase] = useState<any>(null);
	const [isJeSubmitting, setIsJeSubmitting] = useState(false);

	const { refetchData, setRefetchData } = useBoundStore();
	const { params, setQueryParams } = useQueryParams();
	const { mutateAsync: updatePurchase } = usePurchaseUpdate();

	const {
		data: { purchases = [], total },
		isFetching,
		refetch,
	} = usePurchases({ params });

	const { data: withoutJeData, refetch: refetchCount } = usePurchases({
		params: {
			page: DEFAULT_PAGE,
			pageSize: 1,
			timeRange: params.timeRange,
			journalEntryStatus: 'without',
		},
	});
	const withoutJeCount = withoutJeData?.total || 0;

	useEffect(() => {
		if (purchases) {
			const data = purchases.map((item: any) => ({
				key: item.id,
				purchase: item,
				datetime: formatDateTime(item.datetime_created),
				referenceNumber: item.reference_number || EMPTY_CELL,
				supplierName: item.supplier_name || EMPTY_CELL,
				encodedBy: item.encoded_by
					? `${item.encoded_by.first_name} ${item.encoded_by.last_name}`
					: EMPTY_CELL,
				authorizer: item.authorizer
					? `${item.authorizer.first_name} ${item.authorizer.last_name}`
					: EMPTY_CELL,
				remarks: item.overall_remarks || EMPTY_CELL,
				purchaseOrder: item.purchase_order?.reference_number || EMPTY_CELL,
			}));

			setDataSource(data);
		}
	}, [purchases]);

	useEffect(() => {
		if (refetchData) {
			refetch();
			refetchCount();
			setRefetchData();
		}
	}, [refetchData, refetch, refetchCount, setRefetchData]);

	const columns = [
		{
			title: 'Reference #',
			dataIndex: 'referenceNumber',
			render: (value: string, record: any) => (
				<Button
					type="link"
					onClick={() => setSelectedPurchase(record.purchase)}
				>
					{value}
				</Button>
			),
		},
		{ title: 'Date/Time', dataIndex: 'datetime' },
		{ title: 'Supplier', dataIndex: 'supplierName' },
		{ title: 'Authorizer', dataIndex: 'authorizer' },
		{ title: 'Remarks', dataIndex: 'remarks' },
		{
			title: 'PO',
			dataIndex: 'purchaseOrder',
			render: (value: string, record: any) =>
				record.purchase.purchase_order ? (
					<Button
						type="link"
						onClick={() =>
							setSelectedPurchaseOrder(record.purchase.purchase_order)
						}
					>
						{value}
					</Button>
				) : (
					value
				),
		},
		{
			title: 'Actions',
			dataIndex: 'actions',
			align: 'center' as const,
			render: (_: any, record: any) => {
				const { purchase } = record;
				return (
					<Space size={4}>
						<Tooltip title="View Journal Entries">
							<Button
								disabled={!purchase.journal_entry}
								icon={<EyeOutlined />}
								size="small"
								type="primary"
								onClick={() => setViewJePurchase(purchase)}
							/>
						</Tooltip>
						{!isOfficeManager && (
							<Tooltip title="Create Journal Entry">
								<Button
									disabled={!!purchase.journal_entry || isHeadOffice}
									icon={<FileAddOutlined />}
									size="small"
									type="primary"
									onClick={() => setPurchaseForJE(purchase)}
								/>
							</Tooltip>
						)}
					</Space>
				);
			},
		},
	];

	return (
		<Content title="Purchases">
			<Box padding>
				{isBackOffice && (
					<Row className="mb-4" justify="end">
						<Col>
							<Button
								type="primary"
								onClick={() => setIsCartModalVisible(true)}
							>
								Create Purchase
							</Button>
						</Col>
					</Row>
				)}

				<Row className="Purchases_toolbar" gutter={[16, 16]}>
					<Col span={24}>
						<Label label="Search" spacing />
						<Input
							prefix={<SearchOutlined />}
							value={params.search || ''}
							allowClear
							onChange={(e) =>
								setQueryParams({
									search: e.target.value,
									page: DEFAULT_PAGE,
									pageSize: params.pageSize,
								})
							}
						/>
					</Col>

					<Col span={24}>
						<Row gutter={[16, 0]}>
							<Col flex="none">
								<TimeRangeFilter disabled={isFetching} />
							</Col>
							<Col flex="none">
								<Label label="Journal Entry" spacing />
								<Radio.Group
									buttonStyle="solid"
									optionType="button"
									value={(params.journalEntryStatus as string) ?? 'without'}
									onChange={(e) =>
										setQueryParams({
											journalEntryStatus: e.target.value,
											page: DEFAULT_PAGE,
											pageSize: params.pageSize,
										})
									}
								>
									<Radio.Button
										className="Purchases_withoutJeBtn"
										value="without"
									>
										Without JE
										{withoutJeCount > 0 && (
											<span className="Purchases_jeCount">
												{withoutJeCount}
											</span>
										)}
									</Radio.Button>
									<Radio.Button value="with">With JE</Radio.Button>
									<Radio.Button value="all">All</Radio.Button>
								</Radio.Group>
							</Col>
						</Row>
					</Col>
				</Row>

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={isFetching}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total,
						pageSize: Number(params.pageSize) || 10,
						position: ['bottomCenter'],
						pageSizeOptions,
						onChange: (page, newPageSize) => {
							setQueryParams({ page, pageSize: newPageSize });
						},
					}}
					scroll={{ x: 800 }}
					bordered
				/>

				{isCartModalVisible && (
					<Cart type="Purchase" onClose={() => setIsCartModalVisible(false)} />
				)}

				{selectedPurchase && (
					<ViewPurchaseModal
						purchase={selectedPurchase}
						onClose={() => setSelectedPurchase(null)}
					/>
				)}

				{selectedPurchaseOrder && (
					<ViewPurchaseOrderModal
						purchaseOrder={selectedPurchaseOrder}
						onClose={() => setSelectedPurchaseOrder(null)}
					/>
				)}

				<ViewPurchaseJournalEntriesModal
					open={!!viewJePurchase}
					purchase={viewJePurchase}
					onClose={() => setViewJePurchase(null)}
				/>

				<CreateJournalEntryModal
					isSubmitting={isJeSubmitting}
					open={!!purchaseForJE}
					onClose={() => setPurchaseForJE(null)}
					onSubmit={async (values) => {
						setIsJeSubmitting(true);
						try {
							const baseURL = getLocalApiUrl();
							const results = await values.entries.reduce(
								async (acc, entry) => {
									const prev = await acc;
									const result = await JournalEntriesService.create(
										{
											branch_id: purchaseForJE?.branch?.id ?? undefined,
											purchase_id: purchaseForJE?.id,
											entry_type: 'manual',
											debit_account: entry.debitAccount,
											credit_account: entry.creditAccount,
											amount: entry.amount,
											remarks: values.remarks || '',
											description: purchaseForJE?.reference_number ?? '',
											datetime_created: values.datetimeCreated,
										},
										baseURL,
									);
									return [...prev, result];
								},
								Promise.resolve([] as any[]),
							);

							const firstJeId = results[0]?.data?.id;
							if (purchaseForJE?.id && firstJeId) {
								await updatePurchase({
									id: purchaseForJE.id,
									journalEntryId: firstJeId,
								});
							}

							message.success('Journal entry created successfully');
							setPurchaseForJE(null);
						} catch {
							message.error('Failed to create journal entry');
						} finally {
							setIsJeSubmitting(false);
						}
					}}
				/>
			</Box>
		</Content>
	);
};
