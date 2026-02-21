import { DeleteOutlined, EditFilled, SearchOutlined } from '@ant-design/icons';
import {
	Button,
	Input,
	message,
	Popconfirm,
	Space,
	Table,
	Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Content } from 'components';
import { Box } from 'components/elements';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import React, { useMemo, useState } from 'react';
import useChartOfAccounts, {
	useChartOfAccountCreate,
	useChartOfAccountDelete,
	useChartOfAccountEdit,
} from 'hooks/useChartOfAccounts';
import { useQueryParams } from 'hooks';
import { getAppType } from 'utils/localStorage';
import { CreateAccountModal } from '../modals/CreateAccountModal';
import { EditAccountModal } from '../modals/EditAccountModal';
import { ViewAccountModal } from '../modals/ViewAccountModal';
import './style.scss';

export const ChartOfAccounts = () => {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [selectedAccount, setSelectedAccount] = useState<any>(null);
	const [viewAccount, setViewAccount] = useState<any>(null);
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;
	const { params, setQueryParams } = useQueryParams();
	const { data, isFetching } = useChartOfAccounts({
		params: {
			accountCode: searchText || undefined,
			accountName: searchText || undefined,
			page: params.page,
			pageSize: params.pageSize,
		},
	});
	const { chartOfAccounts, total } = data || {
		chartOfAccounts: [],
		total: 0,
	};
	const {
		mutateAsync: createAccount,
		isLoading: isCreating,
	} = useChartOfAccountCreate();
	const {
		mutateAsync: editAccount,
		isLoading: isEditing,
	} = useChartOfAccountEdit();
	const {
		mutateAsync: deleteAccount,
		isLoading: isDeleting,
	} = useChartOfAccountDelete();

	const columns = useMemo(() => {
		const baseColumns: ColumnsType<any> = [
			{
				title: 'Account Code',
				dataIndex: 'account_code',
				key: 'code',
				render: (value: string, record: any) => (
					<Button
						type="link"
						onClick={() => {
							setViewAccount(record);
							setIsViewOpen(true);
						}}
					>
						{value}
					</Button>
				),
			},
			{
				title: 'Account Name',
				dataIndex: 'account_name',
				key: 'name',
			},
		];

		if (isHeadOffice) {
			baseColumns.push({
				title: 'Actions',
				dataIndex: 'actions',
				key: 'actions',
				render: (_: unknown, record: any) => (
					<Space size={8}>
						<Tooltip title="Edit">
							<Button
								disabled={isEditing || isDeleting}
								icon={<EditFilled />}
								type="primary"
								ghost
								onClick={() => {
									setSelectedAccount(record);
									setIsEditOpen(true);
								}}
							/>
						</Tooltip>
						<Popconfirm
							cancelText="No"
							disabled={isDeleting}
							okText="Yes"
							placement="left"
							title="Are you sure to remove this?"
							onConfirm={async () => {
								try {
									await deleteAccount(record.id);
									message.success('Account was deleted successfully');
								} catch (error) {
									message.error('Failed to delete account');
								}
							}}
						>
							<Tooltip title="Remove">
								<Button
									disabled={isDeleting}
									icon={<DeleteOutlined />}
									type="primary"
									danger
									ghost
								/>
							</Tooltip>
						</Popconfirm>
					</Space>
				),
			});
		}

		return baseColumns;
	}, [deleteAccount, isDeleting, isEditing, isHeadOffice]);

	const handleCreate = async (values) => {
		try {
			await createAccount(values);
			message.success('Account was created successfully');
			setIsCreateOpen(false);
		} catch (error) {
			message.error('Failed to create account');
		}
	};

	const handleEdit = async (values) => {
		if (!selectedAccount) return;

		try {
			await editAccount({ id: selectedAccount.id, ...values });
			message.success('Account was updated successfully');
			setIsEditOpen(false);
			setSelectedAccount(null);
		} catch (error) {
			message.error('Failed to update account');
		}
	};

	return (
		<Content title="Chart of Accounts">
			<div className="ChartOfAccounts_meta">
				<span className="ChartOfAccounts_metaText">
					Account Count: <strong>{total?.toLocaleString() || 0}</strong>
				</span>
				<span className="ChartOfAccounts_metaText">
					Last Updated: <strong>11/22/2025 8:18PM</strong>
				</span>
			</div>
			<Box padding>
				<div className="ChartOfAccounts_toolbar">
					<Input
						className="ChartOfAccounts_search"
						placeholder="Search account"
						prefix={<SearchOutlined />}
						value={searchText}
						allowClear
						onChange={(event) => {
							setSearchText(event.target.value);
							setQueryParams({
								page: DEFAULT_PAGE,
								pageSize: params.pageSize,
							});
						}}
					/>
					{isHeadOffice && (
						<Button type="primary" onClick={() => setIsCreateOpen(true)}>
							Create Account
						</Button>
					)}
				</div>
				<Table
					columns={columns}
					dataSource={chartOfAccounts}
					loading={isFetching}
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
						disabled: !chartOfAccounts?.length,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					rowKey="id"
					bordered
				/>
			</Box>
			{isHeadOffice && (
				<CreateAccountModal
					isSubmitting={isCreating}
					open={isCreateOpen}
					onClose={() => setIsCreateOpen(false)}
					onCreate={handleCreate}
				/>
			)}
			{isHeadOffice && (
				<EditAccountModal
					account={selectedAccount}
					isSubmitting={isEditing}
					open={isEditOpen}
					onClose={() => {
						setIsEditOpen(false);
						setSelectedAccount(null);
					}}
					onUpdate={handleEdit}
				/>
			)}
			<ViewAccountModal
				account={viewAccount}
				open={isViewOpen}
				onClose={() => {
					setIsViewOpen(false);
					setViewAccount(null);
				}}
			/>
		</Content>
	);
};
