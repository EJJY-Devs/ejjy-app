import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Input,
	message,
	Modal,
	Row,
	Select,
	Table,
	Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader } from 'components';
import { Label } from 'components/elements';
import { EMPTY_CELL, filterOption, getFullName } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	SEARCH_DEBOUNCE_TIME,
} from 'global';
import {
	useBranches,
	useQueryParams,
	useVoidedTransactionCreateAdjustmentSlip,
	useVoidedTransactions,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray, formatDateTimeExtended, formatInPeso } from 'utils';
import { ViewVoidedTransactionModal } from './ViewVoidedTransactionModal';

interface Props {
	branchId?: number;
	showBranchColumn: boolean;
	showCreateAction: boolean;
	onAdjustmentSlipCreated?: (transactionId: number, slip: any) => void;
}

export const VoidedTransactionsTable = ({
	branchId,
	showBranchColumn,
	showCreateAction,
	onAdjustmentSlipCreated,
}: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [selectedTransaction, setSelectedTransaction] = useState(null);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { params } = useQueryParams();

	const {
		data: { voidedTransactions },
		isFetching: isFetchingTransactions,
		error: transactionsError,
	} = useVoidedTransactions({
		params: {
			branchId: branchId ?? params.branchId,
			orNumber: params.orNumber,
			page: DEFAULT_PAGE,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const {
		mutateAsync: createAdjustmentSlip,
		isLoading: isCreatingSlip,
	} = useVoidedTransactionCreateAdjustmentSlip();

	// METHODS
	const renderAdjustmentSlipCell = (transaction: any) => {
		if (showCreateAction) {
			return (
				<Tooltip title="Create Adjustment Slip">
					<Button
						loading={isCreatingSlip}
						size="small"
						type="primary"
						ghost
						onClick={() =>
							handleCreateAdjustmentSlip(
								transaction,
								transaction.invoice?.or_number,
							)
						}
					>
						Create
					</Button>
				</Tooltip>
			);
		}

		return EMPTY_CELL;
	};

	useEffect(() => {
		setCurrentPage(DEFAULT_PAGE);
	}, [params.orNumber, params.branchId]);

	useEffect(() => {
		const data = voidedTransactions
			.filter((transaction: any) => !transaction.void_adjustment_slip)
			.map((transaction: any) => {
				const voidDt =
					transaction.void_datetime ?? transaction.invoice?.datetime_created;

				return {
					key: transaction.id,
					orNumber: (
						<Button
							className="pa-0"
							type="link"
							onClick={() => setSelectedTransaction(transaction)}
						>
							{transaction.invoice?.or_number ?? EMPTY_CELL}
						</Button>
					),
					branch: transaction.branch_machine?.branch?.name ?? EMPTY_CELL,
					voidDatetime: voidDt ? formatDateTimeExtended(voidDt) : EMPTY_CELL,
					cashier: transaction.teller
						? getFullName(transaction.teller)
						: EMPTY_CELL,
					voidAuthorizer: transaction.void_authorizer
						? getFullName(transaction.void_authorizer)
						: EMPTY_CELL,
					itemCount: (transaction.products ?? []).length,
					totalAmount: formatInPeso(transaction.total_amount ?? 0),
					adjustmentSlip: renderAdjustmentSlipCell(transaction),
				};
			});

		setDataSource(data);
	}, [voidedTransactions, isCreatingSlip]);

	const handleCreateAdjustmentSlip = (transaction: any, orNumber: string) => {
		const branchName =
			transaction.branch_machine?.branch?.name ?? 'this branch';
		const itemCount = (transaction.products ?? []).length;

		Modal.confirm({
			title: 'Create Adjustment Slip',
			icon: <ExclamationCircleOutlined />,
			content: (
				<>
					Create an Adjustment Slip for voided transaction OR#{' '}
					<strong>{orNumber}</strong>?
					<br />
					This will record the return of <strong>{itemCount}</strong> item
					{itemCount !== 1 ? 's' : ''} to branch <strong>{branchName}</strong>.
				</>
			),
			okText: 'Confirm',
			cancelText: 'Cancel',
			onOk: async () => {
				try {
					const response = await createAdjustmentSlip({
						transactionId: transaction.id,
						encodedById: user.id,
					});
					const slip = response?.data;
					message.success(
						`Adjustment Slip ${slip?.reference_number ?? ''} created.`,
					);
					onAdjustmentSlipCreated?.(transaction.id, slip);
				} catch (err: any) {
					const errMsg =
						err?.[0] ?? err?.message ?? 'Failed to create adjustment slip.';
					message.error(errMsg);
				}
			},
		});
	};

	const columns: ColumnsType = [
		{
			title: 'OR #',
			dataIndex: 'orNumber',
		},
		...(showBranchColumn ? [{ title: 'Branch', dataIndex: 'branch' }] : []),
		{
			title: 'Date & Time Voided',
			dataIndex: 'voidDatetime',
		},
		{
			title: 'Cashier',
			dataIndex: 'cashier',
		},
		{
			title: 'Void Authorizer',
			dataIndex: 'voidAuthorizer',
		},
		{
			title: 'No. of Items',
			dataIndex: 'itemCount',
			align: 'right' as const,
		},
		{
			title: 'Total Amount',
			dataIndex: 'totalAmount',
			align: 'right' as const,
		},
		{
			title: 'Adjustment Slip',
			dataIndex: 'adjustmentSlip',
		},
	];

	return (
		<>
			<TableHeader title="Voided Transactions" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={convertIntoArray(transactionsError, 'Voided Transactions')}
				withSpaceBottom
			/>

			<Filter
				branchId={branchId}
				isLoading={isFetchingTransactions}
				showBranchFilter={showBranchColumn}
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingTransactions}
				pagination={{
					current: currentPage,
					total: dataSource.length,
					pageSize,
					onChange: (page, newPageSize) => {
						setCurrentPage(page);
						setPageSize(newPageSize);
					},
					disabled: !dataSource.length,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				scroll={{ x: 1000 }}
				bordered
			/>

			{selectedTransaction && (
				<ViewVoidedTransactionModal
					transaction={selectedTransaction}
					onClose={() => setSelectedTransaction(null)}
				/>
			)}
		</>
	);
};

interface FilterProps {
	branchId?: number;
	isLoading: boolean;
	showBranchFilter: boolean;
}

const Filter = ({ branchId, isLoading, showBranchFilter }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();

	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: showBranchFilter && !branchId },
	});

	const handleSearchDebounced = useCallback(
		_.debounce((search: string) => {
			setQueryParams({ orNumber: search }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<div className="mb-4">
			<RequestErrors
				errors={convertIntoArray(branchesError, 'Branches')}
				withSpaceBottom
			/>

			<Row gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="Search (OR #)" spacing />
					<Input
						defaultValue={params.orNumber}
						prefix={<SearchOutlined />}
						allowClear
						onChange={(e) => handleSearchDebounced(e.target.value.trim())}
					/>
				</Col>

				{showBranchFilter && !branchId && (
					<Col lg={12} span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							disabled={isLoading}
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
							{branches.map((branch) => (
								<Select.Option key={branch.id} value={branch.id}>
									{branch.name}
								</Select.Option>
							))}
						</Select>
					</Col>
				)}
			</Row>
		</div>
	);
};
