import { Spin } from 'antd';
import { Breadcrumb, Content } from 'components';
import { useRequisitionSlipById } from 'hooks/useRequisitionSlips';
import React, { useCallback } from 'react';
import { useUserStore } from 'stores';
import { OrderSlips } from './components/OrderSlips/OrderSlips';
import { RequestedProducts } from './components/RequestedProducts';
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
				link: '/office-manager/requisition-slips',
			},
			{ name: `#${requisitionSlip?.reference_number || requisitionSlipId}` },
		],
		[requisitionSlip?.reference_number, requisitionSlipId],
	);

	return (
		<Content
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			className="ViewRequisitionSlip"
			rightTitle={`#${requisitionSlip?.reference_number}`}
			title="View Requisition Slip"
		>
			<Spin spinning={isLoading} tip="Fetching requisition slip...">
				{requisitionSlip && (
					<>
						<RequestedProducts requisitionSlip={requisitionSlip} />
						<OrderSlips requisitionSlip={requisitionSlip} />
					</>
				)}
			</Spin>
		</Content>
	);
};
