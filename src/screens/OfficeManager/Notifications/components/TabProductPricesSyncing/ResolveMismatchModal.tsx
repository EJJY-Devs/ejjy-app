import { Button, Modal, Space, Tag, message } from 'antd';
import { RequestErrors } from 'components';
import { useProductSyncStatusResolve } from 'hooks';
import React from 'react';
import { convertIntoArray, formatInPeso } from 'utils';

const PRICE_FIELD_LABELS = {
	price_per_piece: 'Price Per Piece',
	wholesale_price: 'Wholesale Price',
	special_price: 'Special Price',
	credit_price: 'Credit Price',
};

interface Props {
	syncStatus: any;
	onClose: () => void;
}

export const ResolveMismatchModal = ({ syncStatus, onClose }: Props) => {
	// CUSTOM HOOKS
	const {
		mutateAsync: resolveMismatch,
		isLoading,
		error: resolveError,
	} = useProductSyncStatusResolve();

	// VARIABLES
	const mismatches = syncStatus?.sync_details?.mismatches || [];
	const isNotFoundOnHeadOffice =
		syncStatus?.status === 'not_found_on_head_office';

	// METHODS
	const handleResolve = async (
		field: string,
		source: 'head_office' | 'branch',
	) => {
		try {
			await resolveMismatch({ id: syncStatus.id, field, source });
			message.success(`${PRICE_FIELD_LABELS[field] || field} resolved.`);
		} catch (error) {
			// Error is already surfaced via RequestErrors below.
		}
	};

	return (
		<Modal
			footer={null}
			title={`Resolve Mismatches - ${syncStatus?.product_name}`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors errors={convertIntoArray(resolveError)} withSpaceBottom />

			{isNotFoundOnHeadOffice ? (
				<div>
					<Tag color="orange">Not Found on Head Office</Tag>
					<p className="mt-2">
						Head Office has no matching active product record for this branch
						(it may have been deleted or marked as not sold in this branch).
						This isn&apos;t a price mismatch, so there is nothing to resolve
						here - it needs to be addressed on the product/branch catalog
						itself.
					</p>
				</div>
			) : (
				<Space className="w-100" direction="vertical" size={16}>
					{mismatches.map((mismatch) => (
						<div key={mismatch.field} className="w-100">
							<strong>
								{PRICE_FIELD_LABELS[mismatch.field] || mismatch.field}
							</strong>
							<div className="d-flex align-items-center justify-content-between mt-1">
								<span>
									Head Office: {formatInPeso(mismatch.head_office_value)}
								</span>
								<Button
									disabled={isLoading}
									loading={isLoading}
									size="small"
									onClick={() => handleResolve(mismatch.field, 'head_office')}
								>
									Use Head Office value
								</Button>
							</div>
							<div className="d-flex align-items-center justify-content-between mt-1">
								<span>Branch: {formatInPeso(mismatch.branch_value)}</span>
								<Button
									disabled={isLoading}
									loading={isLoading}
									size="small"
									onClick={() => handleResolve(mismatch.field, 'branch')}
								>
									Use Branch value
								</Button>
							</div>
						</div>
					))}
				</Space>
			)}
		</Modal>
	);
};
