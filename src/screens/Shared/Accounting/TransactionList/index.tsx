import {
	DeleteOutlined,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Input, message, Popconfirm, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Content } from 'components';
import { Box } from 'components/elements';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	userTypes,
} from 'global';
import useAccountingTransactions, {
	useAccountingTransactionCreate,
	useAccountingTransactionDelete,
} from 'hooks/useAccountingTransactions';
import React, { useCallback, useMemo, useState } from 'react';
import { useQueryParams } from 'hooks';
import { getAppType, getLocalApiUrl } from 'utils';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import {
	ViewTransactionModal,
	Transaction,
} from '../modals/ViewTransactionModal';
import { CreateTransactionModal } from '../modals/CreateTransactionModal';
import './style.scss';

export const TransactionList = () => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);
	const [viewTransaction, setViewTransaction] = useState<Transaction | null>(
		null,
	);
	const { params, setQueryParams } = useQueryParams();

	const { data, isFetching } = useAccountingTransactions({
		params: {
			page: Number(params.page) || DEFAULT_PAGE,
			pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
			search: params.search,
		},
	});

	const {
		mutateAsync: createTransaction,
		isLoading: isCreating,
	} = useAccountingTransactionCreate();

	const { mutateAsync: deleteTransaction } = useAccountingTransactionDelete();

	const transactions = useMemo(() => {
		return (data?.accountingTransactions || []).map((t: any) => ({
			id: t.id,
			name: t.name,
			information: t.information,
			entries: (t.entries || []).map((e: any) => ({
				debitAccount: e.debit_account,
				creditAccount: e.credit_account,
			})),
		}));
	}, [data]);

	const columns: ColumnsType<any> = useMemo(() => {
		const cols: ColumnsType<any> = [
			{
				title: 'Transaction ID',
				dataIndex: 'id',
				key: 'id',
				render: (value: number, record: Transaction) => (
					<Button
						type="link"
						onClick={() => {
							setViewTransaction(record);
							setIsViewOpen(true);
						}}
					>
						{value}
					</Button>
				),
			},
			{
				title: 'Transaction Name',
				dataIndex: 'name',
				key: 'name',
			},
			{
				title: 'Transaction Information',
				dataIndex: 'information',
				key: 'information',
			},
		];

		if (isHeadOffice) {
			cols.push({
				title: 'Action',
				key: 'action',
				width: 100,
				render: (_: any, record: Transaction) => (
					<Popconfirm
						cancelText="No"
						okText="Yes"
						placement="left"
						title="Are you sure to remove this?"
						onConfirm={async () => {
							try {
								await deleteTransaction(record.id);
								message.success('Transaction deleted successfully');
							} catch {
								message.error('Failed to delete transaction');
							}
						}}
					>
						<Tooltip title="Remove">
							<Button icon={<DeleteOutlined />} type="primary" danger ghost />
						</Tooltip>
					</Popconfirm>
				),
			});
		}

		return cols;
	}, [isHeadOffice, deleteTransaction]);

	const handleAddTransaction = useCallback(() => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			userTypes: [userTypes.ADMIN],
			onSuccess: () => {
				setAuthorizeConfig(null);
				setIsCreateOpen(true);
			},
			onCancel: () => setAuthorizeConfig(null),
		});
	}, []);

	return (
		<Content title="Transaction List">
			<Box padding>
				<div className="TransactionList_toolbar">
					<Input
						className="TransactionList_search"
						placeholder="Search transaction"
						prefix={<SearchOutlined />}
						value={params.search || ''}
						allowClear
						onChange={(event) => {
							setQueryParams({
								search: event.target.value,
								page: DEFAULT_PAGE,
								pageSize: params.pageSize,
							});
						}}
					/>
					{isHeadOffice && (
						<Button
							icon={<PlusOutlined />}
							type="primary"
							onClick={handleAddTransaction}
						>
							Add Transaction
						</Button>
					)}
				</div>
				<Table
					columns={columns}
					dataSource={transactions}
					loading={isFetching}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total: data?.total || 0,
						pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
						onChange: (page, newPageSize) => {
							setQueryParams({
								page,
								pageSize: newPageSize,
								search: params.search,
							});
						},
						disabled: !transactions.length,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					rowKey="id"
					bordered
				/>
			</Box>
			<ViewTransactionModal
				open={isViewOpen}
				transaction={viewTransaction}
				onClose={() => {
					setIsViewOpen(false);
					setViewTransaction(null);
				}}
			/>
			<CreateTransactionModal
				isSubmitting={isCreating}
				open={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
				onCreate={async (values) => {
					await createTransaction(values);
					setIsCreateOpen(false);
				}}
			/>
			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</Content>
	);
};
