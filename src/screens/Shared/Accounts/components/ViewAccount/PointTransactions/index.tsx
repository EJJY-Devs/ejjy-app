import { Button, Col, Row, Spin, Statistic, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import {
	RedeemPointsModal,
	TableHeader,
	ViewTransactionModal,
} from 'components';
import { Box } from 'components/elements';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	pageSizeOptions,
} from 'global';
import { usePointTransactions, useQueryParams } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { formatDateTime, formatInPeso, getFullName } from 'utils';
import './style.scss';

const columns: ColumnsType = [
	{ title: 'Date & Time', dataIndex: 'datetime' },
	{
		title: 'Invoice',
		children: [
			{ title: 'Invoice #', dataIndex: 'invoiceNumber' },
			{ title: 'Amount', dataIndex: 'amount' },
			{ title: 'Cashier', dataIndex: 'cashier' },
		],
	},
	{
		title: 'Points',
		children: [
			{ title: 'Earned', dataIndex: 'pointsEarned' },
			{ title: 'Redeemed', dataIndex: 'pointsRedeemed' },
			{ title: 'Balance', dataIndex: 'pointsBalance' },
		],
	},
	{ title: 'Authorizer', dataIndex: 'authorizer' },
];
interface PointTransactionsProps {
	account: any;
}
export const PointTransactions = ({ account }: PointTransactionsProps) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedTransactionId, setSelectedTransactionId] = useState(null);
	const [isRedeemModalVisible, setIsRedeemModalVisible] = useState(false);

	// CUSTOM HOOKS
	const queryClient = useQueryClient();
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { pointTransactions, total },
		isFetching: isFetchingPointTransactions,
	} = usePointTransactions({
		params: { accountId: account.id },
	});

	// METHODS
	useEffect(() => {
		const data = pointTransactions.map((pointTransaction) => ({
			datetime: formatDateTime(pointTransaction.datetime_created),
			invoiceNumber: pointTransaction.transaction ? (
				<Button
					type="link"
					onClick={() =>
						setSelectedTransactionId(pointTransaction.transaction.id)
					}
				>
					{pointTransaction.transaction.invoice.or_number}
				</Button>
			) : (
				EMPTY_CELL
			),
			amount: pointTransaction.amount
				? formatInPeso(pointTransaction.amount)
				: EMPTY_CELL,
			cashier: pointTransaction.teller
				? getFullName(pointTransaction.teller)
				: EMPTY_CELL,

			pointsEarned: pointTransaction.earned_points
				? pointTransaction.earned_points
				: EMPTY_CELL,
			pointsRedeemed: pointTransaction.redeemed_points
				? pointTransaction.redeemed_points
				: EMPTY_CELL,
			pointsBalance: pointTransaction.current_points_balance,

			authorizer: pointTransaction.redeem_authorizer
				? getFullName(pointTransaction.redeem_authorizer)
				: EMPTY_CELL,
		}));
		setDataSource(data);
	}, [pointTransactions]);

	return (
		<Box>
			<Spin spinning={isFetchingPointTransactions}>
				<TableHeader
					buttonName="Redeem Points"
					title="Points Transactions"
					onCreate={() => setIsRedeemModalVisible(true)}
					onCreateDisabled={!account}
				/>

				{account && (
					<div className="AccountTotalPoints mb-4 px-6">
						<Row gutter={[16, 16]}>
							<Col span={8}>
								<Statistic
									title="Total Points Earned"
									value={account.total_points_earned}
								/>
							</Col>
							<Col span={8}>
								<Statistic
									title="Total Points Redeemed"
									value={account.total_points_redeemed}
								/>
							</Col>
							<Col span={8}>
								<Statistic
									title="Total Points Balance"
									value={account.total_points_balance}
								/>
							</Col>
						</Row>
					</div>
				)}

				<Table
					columns={columns}
					dataSource={dataSource}
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
						disabled: !dataSource,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					scroll={{ x: 1000 }}
					size="small"
					bordered
				/>

				{selectedTransactionId && (
					<ViewTransactionModal
						transaction={selectedTransactionId}
						onClose={() => setSelectedTransactionId(null)}
					/>
				)}

				{isRedeemModalVisible && (
					<RedeemPointsModal
						account={account}
						onClose={() => setIsRedeemModalVisible(false)}
						onSuccess={() => {
							queryClient.invalidateQueries('usePointTransactions');
							queryClient.invalidateQueries('useAccountRetrieve');
						}}
					/>
				)}
			</Spin>
		</Box>
	);
};
