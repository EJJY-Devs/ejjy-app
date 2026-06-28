import { Tag } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TimeRangeFilter } from 'components';
import { Box } from 'components/elements';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	productStatus,
} from 'global';
import {
	useAuditLogCounts,
	useAuditLogs,
	useBranchProductsForAudit,
	useQueryParams,
} from 'hooks';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { convertIntoArray } from 'utils';
import { ViewAdjustmentSlipModal } from 'components/modals/ViewAdjustmentSlipModal';
import { AuditModal } from './AuditModal';
import { PendingAuditModal } from './PendingAuditModal';

const columns: ColumnsType = [
	{ title: 'Reference Number', dataIndex: 'referenceNumber' },
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
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [auditModalType, setAuditModalType] = useState<string | null>(null);
	const [pendingModalOpen, setPendingModalOpen] = useState(false);
	const [viewAdjustmentSlipId, setViewAdjustmentSlipId] = useState<
		number | null
	>(null);

	// CUSTOM HOOKS
	const queryClient = useQueryClient();
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
			branchId,
		},
	});

	const {
		data: { daily: dailyCount, pending: pendingCount },
	} = useAuditLogCounts({
		params: { serverUrl, branchId },
	});

	const {
		data: { branchProducts: randomProducts },
	} = useBranchProductsForAudit({
		params: {
			serverUrl,
			branchId,
			isRandomlyChecked: true,
			page: DEFAULT_PAGE,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const randomCount = randomProducts.filter(
		(bp) => bp.product_status !== productStatus.AVAILABLE,
	).length;

	// METHODS
	useEffect(() => {
		const data = auditLogs.map((auditLog) => {
			const {
				id,
				reference_number,
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
				referenceNumber: reference_number || id,
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

	const handleOpenAuditModal = (type: string) => {
		queryClient.invalidateQueries('useBranchProductsForAudit');
		setAuditModalType(type);
	};

	return (
		<div className="InventoryAudit">
			<div className="InventoryAudit__cards">
				<button
					className="InventoryAudit__card"
					type="button"
					onClick={() => handleOpenAuditModal('daily')}
				>
					<span className="InventoryAudit__card-number">{dailyCount}</span>
					<span className="InventoryAudit__card-label">DAILY AUDIT</span>
				</button>

				<button
					className="InventoryAudit__card"
					type="button"
					onClick={() => handleOpenAuditModal('random')}
				>
					<span className="InventoryAudit__card-number">{randomCount}</span>
					<span className="InventoryAudit__card-label">RANDOM AUDIT</span>
				</button>

				<button
					className="InventoryAudit__card"
					type="button"
					onClick={() => setPendingModalOpen(true)}
				>
					<span className="InventoryAudit__card-number">{pendingCount}</span>
					<span className="InventoryAudit__card-label">PENDING PRODUCT</span>
				</button>
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
					branchId={branchId}
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
					serverUrl={serverUrl}
					onClose={() => setViewAdjustmentSlipId(null)}
				/>
			)}
		</div>
	);
};
