import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, message, Row, Select, Table, Tabs } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Content, TimeRangeFilter } from 'components';
import { Box, Label } from 'components/elements';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import {
	useJournalEntries,
	useJournalEntryCreate,
	useBranches,
	useQueryParams,
} from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { formatDateTime, getLocalBranchId } from 'utils';
import { getAppType } from 'utils/localStorage';
import { CreateJournalEntryModal } from '../modals/CreateJournalEntryModal';
import { ViewJournalEntryModal } from '../modals/ViewJournalEntryModal';
import './style.scss';

interface GeneralJournalEntry {
	id: number;
	datetime: string;
	branch?: string;
	referenceNumber: string;
	debitAccount: string;
	creditAccount: string;
	amount: string;
	remarks: string;
}

export const BooksOfAccounts = () => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;
	const localBranchId = Number(getLocalBranchId());
	const { params, setQueryParams } = useQueryParams();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [
		selectedEntry,
		setSelectedEntry,
	] = useState<GeneralJournalEntry | null>(null);
	const { data: { branches } = { branches: [] } } = useBranches({
		params: {
			pageSize: MAX_PAGE_SIZE,
		},
	});

	useEffect(() => {
		if (isHeadOffice && !params.branchId) {
			setQueryParams({ branchId: 'all' }, { shouldResetPage: false });
		}
	}, [isHeadOffice, params.branchId, setQueryParams]);

	const selectedBranchId = useMemo(() => {
		if (!isHeadOffice) return localBranchId || undefined;
		if (params.branchId === 'all') return undefined;
		if (params.branchId) return Number(params.branchId);
		return undefined;
	}, [isHeadOffice, localBranchId, params.branchId]);

	const {
		data: { journalEntries, total },
		isFetching,
	} = useJournalEntries({
		params: {
			page: params.page,
			pageSize: params.pageSize,
			timeRange: params.timeRange,
			...(selectedBranchId && { branchId: selectedBranchId }),
		},
	});

	const {
		mutateAsync: createJournalEntry,
		isLoading: isCreatingJournalEntry,
	} = useJournalEntryCreate();

	const entries: GeneralJournalEntry[] = (journalEntries || []).map(
		(entry: any) => ({
			id: entry.id,
			datetime: formatDateTime(entry.datetime_created, false),
			branch: entry.branch_name,
			referenceNumber: entry.reference_number,
			debitAccount: entry.debit_account,
			creditAccount: entry.credit_account,
			amount: `₱ ${Number(entry.amount || 0).toFixed(2)}`,
			remarks: entry.remarks || EMPTY_CELL,
		}),
	);

	const columns = useMemo(() => {
		const baseColumns: ColumnsType<GeneralJournalEntry> = [
			{
				title: 'Datetime',
				dataIndex: 'datetime',
				key: 'datetime',
			},
			{
				title: 'Reference Number',
				dataIndex: 'referenceNumber',
				key: 'referenceNumber',
				render: (value: string, record: GeneralJournalEntry) => (
					<Button
						type="link"
						onClick={() => {
							setSelectedEntry(record);
							setIsViewOpen(true);
						}}
					>
						{value}
					</Button>
				),
			},
			{
				title: 'Debit Account',
				dataIndex: 'debitAccount',
				key: 'debitAccount',
			},
			{
				title: 'Credit Account',
				dataIndex: 'creditAccount',
				key: 'creditAccount',
			},
			{
				title: 'Amount',
				dataIndex: 'amount',
				key: 'amount',
			},
			{
				title: 'Remarks',
				dataIndex: 'remarks',
				key: 'remarks',
			},
		];

		if (isHeadOffice) {
			baseColumns.splice(2, 0, {
				title: 'Branch',
				dataIndex: 'branch',
				key: 'branch',
			});
		}

		return baseColumns;
	}, [isHeadOffice]);

	return (
		<Content rightTitle="General Journal" title="Books of Accounts">
			<Box padding>
				<Tabs
					className="BooksOfAccounts_tabs"
					defaultActiveKey="general-journal"
					type="card"
				>
					<Tabs.TabPane key="general-journal" tab="General Journal">
						<div className="BooksOfAccounts_header">
							<Row className="BooksOfAccounts_filters" gutter={[16, 16]}>
								<Col className="BooksOfAccounts_timeRangeFilter">
									<TimeRangeFilter
										dateRangeLabel="Select Date"
										useSingleDateForDateRange
									/>
								</Col>
								{isHeadOffice && (
									<Col className="BooksOfAccounts_timeRangeFilter" lg={4}>
										<Label label="Branch" spacing />
										<Select
											className="w-100"
											optionFilterProp="children"
											placeholder="Select Branch"
											value={(() => {
												if (params.branchId === 'all') return 'all';
												if (params.branchId) return Number(params.branchId);
												return undefined;
											})()}
											allowClear
											showSearch
											onChange={(value) => {
												setQueryParams(
													{ branchId: value },
													{ shouldResetPage: true },
												);
											}}
										>
											<Select.Option value="all">All</Select.Option>
											{branches.map(({ id, name }: any) => (
												<Select.Option key={id} value={id}>
													{name}
												</Select.Option>
											))}
										</Select>
									</Col>
								)}
							</Row>
							{!isHeadOffice && (
								<Button
									icon={<PlusOutlined />}
									type="primary"
									onClick={() => setIsCreateOpen(true)}
								>
									Create Journal Entry
								</Button>
							)}
						</div>
						<Table
							className="BooksOfAccounts_table"
							columns={columns}
							dataSource={entries}
							loading={isFetching}
							pagination={{
								current: Number(params.page) || DEFAULT_PAGE,
								total,
								pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
								onChange: (page, pageSize) => {
									setQueryParams({
										page,
										pageSize,
									});
								},
								disabled: !entries?.length,
								position: ['bottomCenter'],
								pageSizeOptions,
							}}
							rowKey="id"
							scroll={{ x: 900 }}
							bordered
						/>
					</Tabs.TabPane>
				</Tabs>
			</Box>
			{!isHeadOffice && (
				<CreateJournalEntryModal
					isSubmitting={isCreatingJournalEntry}
					open={isCreateOpen}
					onClose={() => setIsCreateOpen(false)}
					onSubmit={async ({
						debitAccount,
						creditAccount,
						amount,
						remarks,
					}) => {
						try {
							await createJournalEntry({
								branchId: localBranchId || undefined,
								debitAccount,
								creditAccount,
								amount,
								remarks,
							});

							message.success('Journal entry created successfully');
							setIsCreateOpen(false);
						} catch (error) {
							message.error('Failed to create journal entry');
						}
					}}
				/>
			)}
			<ViewJournalEntryModal
				entry={selectedEntry}
				isHeadOffice={isHeadOffice}
				open={isViewOpen}
				onClose={() => {
					setIsViewOpen(false);
					setSelectedEntry(null);
				}}
			/>
		</Content>
	);
};
