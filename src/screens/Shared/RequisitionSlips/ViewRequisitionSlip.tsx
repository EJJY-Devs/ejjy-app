import { Spin } from 'antd';
import { Breadcrumb, Content } from 'components';
import { useRequisitionSlipById } from 'hooks/useRequisitionSlips';
import React, { useCallback } from 'react';
import { useUserStore } from 'stores';
import { getUrlPrefix } from 'utils';
import { LinkedTransactions } from './components/LinkedTransactions';
import { RequisitionSlipHeader } from './components/RequisitionSlipHeader';
import './style.scss';

interface Props {
	match: any;
}

export const ViewRequisitionSlip = ({ match }: Props) => {
	// VARIABLES
	const requisitionSlipId = match?.params?.id;

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);

	const { data: requisitionSlip, isLoading } = useRequisitionSlipById({
		id: requisitionSlipId,
		requestingUserType: user.user_type,
	});

	// METHODS
	const getBreadcrumbItems = useCallback(
		() => [
			{
				name: 'Requisition Slips',
				link: `${getUrlPrefix(user.user_type)}/requisition-slips`,
			},
			{ name: `#${requisitionSlip?.reference_number || requisitionSlipId}` },
		],
		[requisitionSlip?.reference_number, requisitionSlipId, user.user_type],
	);

	return (
		<Content
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			className="ViewRequisitionSlip"
			rightTitle={
				requisitionSlip?.reference_number
					? `#${requisitionSlip.reference_number}`
					: undefined
			}
			title="View Requisition Slip"
		>
			<Spin spinning={isLoading} tip="Fetching requisition slip...">
				{requisitionSlip && (
					<>
						<RequisitionSlipHeader requisitionSlip={requisitionSlip} />
						<LinkedTransactions requisitionSlip={requisitionSlip} />
					</>
				)}
			</Spin>
		</Content>
	);
};
