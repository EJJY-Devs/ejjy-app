import {
	BookOutlined,
	EyeOutlined,
	PlusOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	Input,
	message,
	Radio,
	Row,
	Select,
	Space,
	Table,
	Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Content, TimeRangeFilter } from 'components';
import { Box, Label } from 'components/elements';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import { useQueryParams, useBranches } from 'hooks';
import useExpenses, {
	useExpenseCreate,
	useExpenseUpdate,
} from 'hooks/useExpenses';
import React, { useMemo, useState } from 'react';
import { JournalEntriesService } from 'services';
import {
	formatDateTime,
	formatInPeso,
	getLocalApiUrl,
	getLocalBranchId,
} from 'utils';
import { getAppType } from 'utils/localStorage';
import { CreateJournalEntryModal } from '../modals/CreateJournalEntryModal';
import { CreateExpenseModal } from './modals/CreateExpenseModal';
import { ViewDisbursementVoucherModal } from './modals/ViewDisbursementVoucherModal';
import { ViewExpenseJournalEntriesModal } from './modals/ViewExpenseJournalEntriesModal';
import './style.scss';

export interface ExpenseAuthorizer {
	id: number;
	first_name: string;
	last_name: string;
	middle_name?: string;
}

export interface Expense {
	id: number;
	reference_number: string | null;
	datetime_created: string;
	payee: string;
	particulars: string;
	amount: string;
	received_by: string;
	authorizer: ExpenseAuthorizer | null;
	branch: number | null;
	branch_name: string | null;
	journal_entry: number | null;
	journal_entry_reference_number: string | null;
}

export const Expenses = () => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [dvExpense, setDvExpense] = useState<Expense | null>(null);
	const [jeExpense, setJeExpense] = useState<Expense | null>(null);
	const [viewJeExpense, setViewJeExpense] = useState<Expense | null>(null);
	const [isJeSubmitting, setIsJeSubmitting] = useState(false);

	const { params, setQueryParams } = useQueryParams();

	const { data: branchesData } = useBranches({
		options: { enabled: isHeadOffice },
	});
	const branches = branchesData?.branches || [];

	const { data, isFetching } = useExpenses({
		params: {
			page: Number(params.page) || DEFAULT_PAGE,
			pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
			search: params.search,
			branchId: isHeadOffice ? params.branchId : undefined,
			timeRange: params.timeRange,
			journalEntryStatus: params.journalEntryStatus,
		},
	});

	const {
		mutateAsync: createExpense,
		isLoading: isCreating,
	} = useExpenseCreate();
	const { mutateAsync: updateExpense } = useExpenseUpdate();

	const expenses: Expense[] = useMemo(() => data?.expenses || [], [data]);

	const columns: ColumnsType<Expense> = useMemo(() => {
		const cols: ColumnsType<Expense> = [
			{
				title: 'Reference #',
				dataIndex: 'reference_number',
				key: 'reference_number',
				render: (value: string | null, record: Expense) => (
					<Button type="link" onClick={() => setDvExpense(record)}>
						{value || `E-${record.id}`}
					</Button>
				),
			},
			{
				title: 'Datetime',
				dataIndex: 'datetime_created',
				key: 'datetime_created',
				render: (value: string) => formatDateTime(value),
			},
			{
				title: 'Payee',
				dataIndex: 'payee',
				key: 'payee',
			},
			{
				title: 'Particulars',
				dataIndex: 'particulars',
				key: 'particulars',
			},
			{
				title: 'Amount',
				dataIndex: 'amount',
				key: 'amount',
				align: 'right',
				render: (value: string) => formatInPeso(value),
			},
			{
				title: 'Actions',
				key: 'journal_entry',
				width: 130,
				align: 'center',
				render: (_: any, record: Expense) => (
					<Space size={4}>
						<Tooltip title="View Journal Entries">
							<Button
								disabled={!record.journal_entry}
								icon={<EyeOutlined />}
								size="small"
								type="primary"
								onClick={() => setViewJeExpense(record)}
							/>
						</Tooltip>
						<Tooltip title="Create Journal Entry">
							<Button
								disabled={!!record.journal_entry || isHeadOffice}
								icon={<BookOutlined />}
								size="small"
								type="primary"
								onClick={() => setJeExpense(record)}
							/>
						</Tooltip>
					</Space>
				),
			},
		];

		if (isHeadOffice) {
			cols.splice(2, 0, {
				title: 'Branch',
				dataIndex: 'branch_name',
				key: 'branch_name',
			});
		}

		return cols;
	}, [isHeadOffice]);

	return (
		<Content title="Expenses">
			<Box padding>
				{!isHeadOffice && (
					<Row className="mb-4" justify="end">
						<Col>
							<Button
								icon={<PlusOutlined />}
								type="primary"
								onClick={() => setIsCreateOpen(true)}
							>
								Add Expense
							</Button>
						</Col>
					</Row>
				)}

				<Row className="Expenses_toolbar" gutter={[16, 16]}>
					<Col span={24}>
						<TimeRangeFilter disabled={isFetching} />
					</Col>

					<Col lg={12} span={24}>
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

					{isHeadOffice && (
						<Col lg={12} span={24}>
							<Label label="Branch" spacing />
							<Select
								className="w-100"
								options={branches.map((b: any) => ({
									label: b.name,
									value: b.id,
								}))}
								placeholder="All Branches"
								value={params.branchId ? Number(params.branchId) : undefined}
								allowClear
								onChange={(value) =>
									setQueryParams({
										branchId: value,
										page: DEFAULT_PAGE,
										pageSize: params.pageSize,
									})
								}
							/>
						</Col>
					)}

					<Col span={24}>
						<Label label="Journal Entry" spacing />
						<Radio.Group
							buttonStyle="solid"
							options={[
								{ label: 'Without JE', value: 'without' },
								{ label: 'With JE', value: 'with' },
								{ label: 'All', value: 'all' },
							]}
							optionType="button"
							value={(params.journalEntryStatus as string) ?? 'without'}
							onChange={(e) =>
								setQueryParams({
									journalEntryStatus: e.target.value,
									page: DEFAULT_PAGE,
									pageSize: params.pageSize,
								})
							}
						/>
					</Col>
				</Row>

				<Table
					columns={columns}
					dataSource={expenses}
					loading={isFetching}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total: data?.total || 0,
						pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
						onChange: (page, newPageSize) =>
							setQueryParams({
								page,
								pageSize: newPageSize,
								search: params.search,
							}),
						disabled: !expenses.length,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					rowKey="id"
					bordered
				/>
			</Box>

			<CreateExpenseModal
				isSubmitting={isCreating}
				open={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
				onCreate={async (values) => {
					await createExpense({
						payee: values.payee,
						particulars: values.particulars,
						amount: values.amount,
						receivedBy: values.receivedBy,
						authorizerId: values.authorizerId,
						branchId: getLocalBranchId()
							? Number(getLocalBranchId())
							: undefined,
					});
					message.success('Expense created successfully');
					setIsCreateOpen(false);
				}}
			/>

			<ViewDisbursementVoucherModal
				expense={dvExpense}
				open={!!dvExpense}
				onClose={() => setDvExpense(null)}
			/>

			<ViewExpenseJournalEntriesModal
				expense={viewJeExpense}
				open={!!viewJeExpense}
				onClose={() => setViewJeExpense(null)}
			/>

			<CreateJournalEntryModal
				isSubmitting={isJeSubmitting}
				open={!!jeExpense}
				onClose={() => setJeExpense(null)}
				onSubmit={async (values) => {
					setIsJeSubmitting(true);
					try {
						const baseURL = getLocalApiUrl();
						const expenseId = jeExpense?.id;
						const expenseParticulars = jeExpense?.particulars || '';
						const results = await values.entries.reduce(async (acc, entry) => {
							const prev = await acc;
							const result = await JournalEntriesService.create(
								{
									branch_id: jeExpense?.branch ?? undefined,
									expense_id: expenseId,
									entry_type: 'manual',
									debit_account: entry.debitAccount,
									credit_account: entry.creditAccount,
									amount: entry.amount,
									remarks: values.remarks || '',
									description: expenseParticulars,
									datetime_created: values.datetimeCreated,
								},
								baseURL,
							);
							return [...prev, result];
						}, Promise.resolve([] as any[]));

						const firstJeId = results[0]?.data?.id;
						if (expenseId && firstJeId) {
							await updateExpense({
								id: expenseId,
								journalEntryId: firstJeId,
							});
						}

						message.success('Journal entry created successfully');
						setJeExpense(null);
					} catch {
						message.error('Failed to create journal entry');
					} finally {
						setIsJeSubmitting(false);
					}
				}}
			/>
		</Content>
	);
};
