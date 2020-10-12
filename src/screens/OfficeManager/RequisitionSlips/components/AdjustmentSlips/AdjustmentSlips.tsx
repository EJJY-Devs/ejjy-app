/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { TableHeader } from '../../../../../components';
import { Box } from '../../../../../components/elements';
import { request } from '../../../../../global/types';
import { useAdjustmentSlips } from '../../../hooks/useAdjustmentSlips';
import { AdjustmentSlipsTable } from './AdjustmentSlipsTable';
import { CreateAdjustmentSlipModal } from './CreateAdjustmentSlipModal';
import { ViewAdjustmentSlipModal } from './ViewAdjustmentSlipModal';

interface Props {
	deliveryReceipt: any;
}

export const AdjustmentSlips = ({ deliveryReceipt }: Props) => {
	// State: Selection
	const [selectedAdjustmentSlip, setSelectedAdjustmentSlip] = useState(null);

	// State: Modal
	const [viewAdjustmentSlipVisible, setViewAdjustmentSlipVisible] = useState(false);
	const [createAdjustmentSlipVisible, setCreateAdjustmentSlipVisible] = useState(false);

	const {
		adjustmentSlips,
		getAdjustmentSlipsByDeliveryReceiptId,
		status: adjustmentSlipStatus,
	} = useAdjustmentSlips();

	// Effect: Fetch adjustment slips
	useEffect(() => {
		if (deliveryReceipt?.id) {
			getAdjustmentSlipsByDeliveryReceiptId(deliveryReceipt?.id);
		}
	}, [deliveryReceipt]);

	const onCreateAdjustmentSlip = () => {
		setSelectedAdjustmentSlip(null);
		setCreateAdjustmentSlipVisible(true);
	};

	const onViewAdjustmentSlip = (orderSlip) => {
		setSelectedAdjustmentSlip(orderSlip);
		setViewAdjustmentSlipVisible(true);
	};

	return (
		<Box>
			<TableHeader
				title="Adjustment Slips"
				buttonName="Create Adjustment Slip"
				onCreate={onCreateAdjustmentSlip}
			/>

			<AdjustmentSlipsTable
				adjustmentSlips={adjustmentSlips}
				onViewAdjustmentSlip={onViewAdjustmentSlip}
				loading={adjustmentSlipStatus === request.REQUESTING}
			/>

			<ViewAdjustmentSlipModal
				visible={viewAdjustmentSlipVisible}
				adjustmentSlip={selectedAdjustmentSlip}
				onClose={() => setViewAdjustmentSlipVisible(false)}
			/>

			<CreateAdjustmentSlipModal
				deliveryReceipt={deliveryReceipt}
				visible={createAdjustmentSlipVisible}
				onClose={() => setCreateAdjustmentSlipVisible(false)}
			/>
		</Box>
	);
};