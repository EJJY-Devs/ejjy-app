import { TableHeader } from 'components';
import { Box } from 'components/elements';
import { requisitionSlipDetailsType } from 'global';
import React from 'react';
import { RequisitionSlipDetails } from '../RequisitionSlipDetails';

interface Props {
	requisitionSlip: any;
}

export const RequisitionSlipHeader = ({ requisitionSlip }: Props) => (
	<Box className="RequisitionSlipHeader" padding>
		<TableHeader
			title={`Requisition Slip [${requisitionSlip?.slip_type?.toUpperCase()}]`}
		/>

		<RequisitionSlipDetails
			requisitionSlip={requisitionSlip}
			type={requisitionSlipDetailsType.SINGLE_VIEW}
		/>
	</Box>
);
