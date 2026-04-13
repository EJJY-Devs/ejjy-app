import { Tag } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TimeRangeFilter } from 'components';
import { Box } from 'components/elements';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	appTypes,
	pageSizeOptions,
} from 'global';
import { useAuditLogCounts, useAuditLogs, useQueryParams } from 'hooks';
import React, { useEffect, useState } from 'react';
import { getAppType } from 'utils';
import { convertIntoArray } from 'utils';
import { ViewAdjustmentSlipModal } from 'components/modals/ViewAdjustmentSlipModal';
import { AuditModal } from './AuditModal';
import { PendingAuditModal } from './PendingAuditModal';

const columns: ColumnsType = [
	{ title: 'Reference Number', dataIndex: 'id' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Captured QTY', dataIndex: 'capturedQty', align: 'center' },
	{ title: 'Inputted QTY', dataIndex: 'inputtedQty', align: 'center' },
	{ title: 'Adjusted Balance', dataIndex: 'adjustedBalance', align: 'center' },
	{ title: 'Status', dataIndex: 'status', align: 'center' },
];

interface Props {
	serverUrl: string;
	branchId?: number;
}

export const BranchCheckings = ({ serverUrl, branchId }: Props) => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [auditModalType, setAuditModalType] = useState<string | null>(null);
	const [pendingModalOpen, setPendingModalOpen] = useState(false);
	const [viewAdjustmentSlipId, setViewAdjustmentSlipId] = useState<
		number | null
	>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();

	const {
		data: { auditLogs, total },
		isFetching: isFetchingAuditLogs,
		error: auditLogsError,
	} = useAuditLogs({
		params: {
			type: 'all',
			page: params.page,
			pageSize: params.pageSize,
			timeRange: params.timeRange,
			serverUrl,
		},
	});

	const {
		data: { daily: dailyCount, random: randomCount, pending: pendingCount },
	} = useAuditLogCounts({
		params: { serverUrl },
	});

	// METHODS
	useEffect(() => {
		const data = auditLogs.map((auditLog) => {
			const {
				id,
				name,
				captured_qty,
				inputted_qty,
				adjusted_balance,
				status,
				adjustment_slip_id,
			} = auditLog;

			let statusTag = <Tag color="yellow">Pending</Tag>;
			if (status === 'balance') {
				statusTag = <Tag color="green">Balance</Tag>;
			} else if (status === 'adjusted') {
				statusTag = (
					<Tag
						color="blue"
						style={{ cursor: 'pointer' }}
						onClick={() => setViewAdjustmentSlipId(adjustment_slip_id)}
					>
						Adjusted
					</Tag>
				);
			}

			return {
				key: id,
				id,
				name,
				capturedQty:
					captured_qty != null ? Number(captured_qty).toFixed(3) : EMPTY_CELL,
				inputtedQty:
					inputted_qty != null ? Number(inputted_qty).toFixed(3) : EMPTY_CELL,
				adjustedBalance:
					adjusted_balance != null
						? Number(adjusted_balance).toFixed(3)
						: EMPTY_CELL,
				status: statusTag,
			};
		});

		setDataSource(data);
	}, [auditLogs]);

	return (
		<div className="InventoryAudit">
			<div className="InventoryAudit__cards">
				<button
					className="InventoryAudit__card"
					type="button"
					onClick={() => setAuditModalType('daily')}
				>
					<span className="InventoryAudit__card-number">{dailyCount}</span>
					<span className="InventoryAudit__card-label">DAILY AUDIT</span>
				</button>

				<button
					className="InventoryAudit__card"
					type="button"
					onClick={() => setAuditModalType('random')}
				>
					<span className="InventoryAudit__card-number">{randomCount}</span>
					<span className="InventoryAudit__card-label">RANDOM AUDIT</span>
				</button>

				{isHeadOffice && (
					<button
						className="InventoryAudit__card"
						type="button"
						onClick={() => setPendingModalOpen(true)}
					>
						<span className="InventoryAudit__card-number">{pendingCount}</span>
						<span className="InventoryAudit__card-label">PENDING PRODUCT</span>
					</button>
				)}
			</div>

			<p className="InventoryAudit__section-title">Audit Logs</p>

			<div className="px-6 pb-4">
				<TimeRangeFilter />
			</div>

			<RequestErrors
				className="px-6"
				errors={convertIntoArray(auditLogsError)}
				withSpaceBottom
			/>

			<Box padding>
				<Table
					columns={columns}
					dataSource={dataSource}
					loading={isFetchingAuditLogs}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total,
						pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
						onChange: (page, newPageSize) => {
							setQueryParams({ page, pageSize: newPageSize });
						},
						disabled: !dataSource,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					scroll={{ x: 650 }}
					bordered
				/>
			</Box>

			{auditModalType && (
				<AuditModal
					serverUrl={serverUrl}
					type={auditModalType}
					onClose={() => setAuditModalType(null)}
				/>
			)}

			{pendingModalOpen && (
				<PendingAuditModal
					branchId={branchId}
					serverUrl={serverUrl}
					onClose={() => setPendingModalOpen(false)}
				/>
			)}

			{viewAdjustmentSlipId && (
				<ViewAdjustmentSlipModal
					adjustmentSlipId={viewAdjustmentSlipId}
					onClose={() => setViewAdjustmentSlipId(null)}
				/>
			)}
		</div>
	);
};
