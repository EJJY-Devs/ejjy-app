import { Button, Modal, Tooltip, message } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import { RequestErrors } from 'components';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	appTypes,
	pageSizeOptions,
} from 'global';
import useAuditLogs, { useAuditLogMarkAdjusted } from 'hooks/useAuditLogs';
import React, { useEffect, useState } from 'react';
import { Cart } from 'screens/Shared/Cart';
import { convertIntoArray, getAppType, getLocalBranchId } from 'utils';

interface Props {
	serverUrl: string;
	branchId?: number;
	onClose: () => void;
}

export const PendingAuditModal = ({ serverUrl, branchId, onClose }: Props) => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	// STATES
	const [page, setPage] = useState(DEFAULT_PAGE);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
	const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);
	const [pendingAdjust, setPendingAdjust] = useState<{
		auditLogId: number;
		slipId: number;
	} | null>(null);

	// CUSTOM HOOKS
	const {
		data: { auditLogs, total },
		isFetching,
		error,
	} = useAuditLogs({
		params: {
			serverUrl,
			status: 'pending',
			page,
			pageSize,
		},
	});

	const { mutateAsync: markAdjusted } = useAuditLogMarkAdjusted(serverUrl);

	// After Cart unmounts (selectedAuditLog = null), fire markAdjusted.
	// This runs after Cart's message.destroy() cleanup, so our success message
	// won't be wiped.
	useEffect(() => {
		if (!pendingAdjust || selectedAuditLog) return;

		markAdjusted({
			id: pendingAdjust.auditLogId,
			adjustmentSlipId: pendingAdjust.slipId,
		})
			.then(() => {
				message.success('Audit log marked as adjusted.');
				onClose();
			})
			.catch(() => {
				message.error('Failed to mark audit log as adjusted.');
			})
			.finally(() => {
				setPendingAdjust(null);
			});
	}, [pendingAdjust, selectedAuditLog]);

	// METHODS
	const formatExcessShortage = (adjustedBalance: string | null) => {
		if (adjustedBalance == null) return EMPTY_CELL;
		const num = Number(adjustedBalance);
		if (num === 0) return EMPTY_CELL;
		const formatted = Math.abs(num).toFixed(3);
		return num < 0 ? `(${formatted})` : formatted;
	};

	const buildPrePopulatedProduct = (auditLog: any) => ({
		branch_product: {
			id: auditLog.branch_product_id,
			product: {
				id: auditLog.product_id,
				name: auditLog.name,
				barcode: auditLog.barcode,
			},
			branch_id: branchId || getLocalBranchId(),
		},
		value: auditLog.captured_qty,
	});

	const columns: ColumnsType = [
		{ title: 'Barcode', dataIndex: 'barcode', width: 160 },
		{ title: 'Name', dataIndex: 'name' },
		{
			title: 'Captured QTY',
			dataIndex: 'capturedQty',
			align: 'center',
			width: 130,
		},
		{
			title: 'Inputted QTY',
			dataIndex: 'inputtedQty',
			align: 'center',
			width: 130,
		},
		{
			title: 'Excess / Shortage',
			dataIndex: 'excessShortage',
			align: 'center',
			width: 140,
		},
		{
			title: 'Action',
			dataIndex: 'action',
			align: 'center',
			width: 100,
		},
	];

	const dataSource = auditLogs.map((auditLog) => ({
		key: auditLog.id,
		barcode: auditLog.barcode || EMPTY_CELL,
		name: auditLog.name,
		capturedQty:
			auditLog.captured_qty != null
				? Number(auditLog.captured_qty).toFixed(3)
				: EMPTY_CELL,
		inputtedQty:
			auditLog.inputted_qty != null
				? Number(auditLog.inputted_qty).toFixed(3)
				: EMPTY_CELL,
		excessShortage: formatExcessShortage(auditLog.adjusted_balance),
		action: (
			<Tooltip
				title={!isHeadOffice ? 'Only HO can adjust pending products' : ''}
			>
				<Button
					disabled={!isHeadOffice}
					type="link"
					onClick={() => setSelectedAuditLog(auditLog)}
				>
					Adjust
				</Button>
			</Tooltip>
		),
	}));

	return (
		<>
			<Modal
				className="Modal__large"
				footer={<Button onClick={onClose}>Close</Button>}
				title="Pending Products"
				centered
				closable
				visible
				onCancel={onClose}
			>
				<RequestErrors errors={convertIntoArray(error)} withSpaceBottom />

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={isFetching}
					pagination={{
						current: page,
						total,
						pageSize,
						onChange: (newPage, newPageSize) => {
							setPage(newPage);
							setPageSize(newPageSize);
						},
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					scroll={{ x: 800 }}
					bordered
				/>
			</Modal>

			{selectedAuditLog && (
				<Cart
					prePopulatedProduct={buildPrePopulatedProduct(selectedAuditLog)}
					type="Adjustment Slip"
					onAdjustmentSlipCreated={(slip) => {
						setPendingAdjust({
							auditLogId: selectedAuditLog.id,
							slipId: slip.id,
						});
					}}
					onClose={() => setSelectedAuditLog(null)}
				/>
			)}
		</>
	);
};
