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
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import { useQueryParams, useBranches } from 'hooks';
import useExpenseVouchers, {
	useExpenseVoucherCreate,
	useExpenseVoucherUpdate,
} from 'hooks/useExpenseVouchers';
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
import { CreateExpenseVoucherModal } from './modals/CreateExpenseVoucherModal';
import { ViewExpenseVoucherModal } from './modals/ViewExpenseVoucherModal';
import { ViewExpenseJournalEntriesModal } from './modals/ViewExpenseJournalEntriesModal';
import './style.scss';

export interface ExpenseVoucherAuthorizer {
	id: number;
	first_name: string;
	last_name: string;
	middle_name?: string;
}

export interface ExpenseVoucherParticular {
	description: string;
	amount: string;
	type: 'V' | 'VE';
}

export interface ExpenseVoucher {
	id: number;
	reference_number: string | null;
	datetime_created: string;
	payee: string;
	invoice_number: string | null;
	payment_type: 'pay' | 'on_account';
	particulars: ExpenseVoucherParticular[];
	amount: string;
	remarks: string;
	authorizer: ExpenseVoucherAuthorizer | null;
	branch: number | null;
	branch_name: string | null;
	journal_entry: number | null;
	journal_entry_reference_number: string | null;
}

export const ExpenseVouchers = () => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [
		dvExpenseVoucher,
		setDvExpenseVoucher,
	] = useState<ExpenseVoucher | null>(null);
	const [
		jeExpenseVoucher,
		setJeExpenseVoucher,
	] = useState<ExpenseVoucher | null>(null);
	const [
		viewJeExpenseVoucher,
		setViewJeExpenseVoucher,
	] = useState<ExpenseVoucher | null>(null);
	const [isJeSubmitting, setIsJeSubmitting] = useState(false);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	const { params, setQueryParams } = useQueryParams();

	const { data: branchesData } = useBranches({
		options: { enabled: isHeadOffice },
	});
	const branches = branchesData?.branches || [];

	const { data, isFetching } = useExpenseVouchers({
		params: {
			page: Number(params.page) || DEFAULT_PAGE,
			pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
			search: params.search,
			branchId: isHeadOffice ? params.branchId : undefined,
			timeRange: params.timeRange,
			journalEntryStatus: params.journalEntryStatus,
		},
	});

	const { data: withoutJeData } = useExpenseVouchers({
		params: {
			page: DEFAULT_PAGE,
			pageSize: 1,
			branchId: isHeadOffice ? params.branchId : undefined,
			timeRange: params.timeRange,
			journalEntryStatus: 'without',
		},
	});
	const withoutJeCount = withoutJeData?.total || 0;

	const {
		mutateAsync: createExpenseVoucher,
		isLoading: isCreating,
	} = useExpenseVoucherCreate();
	const { mutateAsync: updateExpenseVoucher } = useExpenseVoucherUpdate();

	const expenseVouchers: ExpenseVoucher[] = useMemo(
		() => data?.expenseVouchers || [],
		[data],
	);

	const columns: ColumnsType<ExpenseVoucher> = useMemo(() => {
		const cols: ColumnsType<ExpenseVoucher> = [
			{
				title: 'Reference #',
				dataIndex: 'reference_number',
				key: 'reference_number',
				render: (value: string | null, record: ExpenseVoucher) => (
					<Button type="link" onClick={() => setDvExpenseVoucher(record)}>
						{value || `EV-${record.id}`}
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
				title: 'Invoice #',
				dataIndex: 'invoice_number',
				key: 'invoice_number',
			},
			{
				title: 'Particulars',
				dataIndex: 'particulars',
				key: 'particulars',
				render: (value: ExpenseVoucherParticular[]) =>
					(value || []).map((item) => item.description).join(', '),
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
				render: (_: any, record: ExpenseVoucher) => (
					<Space size={4}>
						<Tooltip title="View Journal Entries">
							<Button
								disabled={!record.journal_entry}
								icon={<EyeOutlined />}
								size="small"
								type="primary"
								onClick={() => setViewJeExpenseVoucher(record)}
							/>
						</Tooltip>
						<Tooltip title="Create Journal Entry">
							<Button
								disabled={!!record.journal_entry || isHeadOffice}
								icon={<BookOutlined />}
								size="small"
								type="primary"
								onClick={() => setJeExpenseVoucher(record)}
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
		<Content title="Expense Vouchers">
			<Box padding>
				{!isHeadOffice && (
					<Row className="mb-4" justify="end">
						<Col>
							<Button
								icon={<PlusOutlined />}
								type="primary"
								onClick={() => setIsCreateOpen(true)}
							>
								Add Expense Voucher
							</Button>
						</Col>
					</Row>
				)}

				<Row className="ExpenseVouchers_toolbar" gutter={[16, 16]}>
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
										className="ExpenseVouchers_withoutJeBtn"
										value="without"
									>
										Without JE
										{withoutJeCount > 0 && (
											<span className="ExpenseVouchers_jeCount">
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
					dataSource={expenseVouchers}
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
						disabled: !expenseVouchers.length,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					rowKey="id"
					bordered
				/>
			</Box>

			<CreateExpenseVoucherModal
				isSubmitting={isCreating}
				open={isCreateOpen}
				onClose={() => setIsCreateOpen(false)}
				onCreate={async (values) => {
					try {
						await createExpenseVoucher({
							payee: values.payee,
							invoiceNumber: values.invoiceNumber,
							paymentType: values.paymentType,
							particulars: values.particulars,
							amount: values.amount,
							remarks: values.remarks,
							authorizerId: values.authorizerId,
							supplierAccountId: values.supplierAccountId,
							branchId: getLocalBranchId()
								? Number(getLocalBranchId())
								: undefined,
						});
						message.success('Expense voucher created successfully');
						setIsCreateOpen(false);
					} catch {
						message.error('Failed to create expense voucher');
					}
				}}
			/>

			<ViewExpenseVoucherModal
				expenseVoucher={dvExpenseVoucher}
				open={!!dvExpenseVoucher}
				onClose={() => setDvExpenseVoucher(null)}
			/>

			<ViewExpenseJournalEntriesModal
				expenseVoucher={viewJeExpenseVoucher}
				open={!!viewJeExpenseVoucher}
				onClose={() => setViewJeExpenseVoucher(null)}
			/>

			<CreateJournalEntryModal
				isSubmitting={isJeSubmitting}
				open={!!jeExpenseVoucher}
				onClose={() => setJeExpenseVoucher(null)}
				onSubmit={async (values) => {
					setAuthorizeConfig({
						baseURL: getLocalApiUrl(),
						title: 'Authorize Journal Entry',
						onSuccess: async (authorizer) => {
							setAuthorizeConfig(null);
							setIsJeSubmitting(true);
							try {
								const baseURL = getLocalApiUrl();
								const expenseVoucherId = jeExpenseVoucher?.id;
								const expenseVoucherParticulars = (
									jeExpenseVoucher?.particulars || []
								)
									.map((item) => item.description)
									.join(', ');
								const results = await values.entries.reduce(
									async (acc, entry) => {
										const prev = await acc;
										const result = await JournalEntriesService.create(
											{
												branch_id: jeExpenseVoucher?.branch ?? undefined,
												expense_id: expenseVoucherId,
												entry_type: 'manual',
												debit_account: entry.debitAccount,
												credit_account: entry.creditAccount,
												amount: entry.amount,
												remarks: values.remarks || '',
												description: expenseVoucherParticulars,
												datetime_created: values.datetimeCreated,
												authorizer_id: authorizer?.id,
											},
											baseURL,
										);
										return [...prev, result];
									},
									Promise.resolve([] as any[]),
								);

								const firstJeId = results[0]?.data?.id;
								if (expenseVoucherId && firstJeId) {
									await updateExpenseVoucher({
										id: expenseVoucherId,
										journalEntryId: firstJeId,
									});
								}

								message.success('Journal entry created successfully');
								setJeExpenseVoucher(null);
							} catch {
								message.error('Failed to create journal entry');
							} finally {
								setIsJeSubmitting(false);
							}
						},
						onCancel: () => setAuthorizeConfig(null),
					});
				}}
			/>

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</Content>
	);
};
