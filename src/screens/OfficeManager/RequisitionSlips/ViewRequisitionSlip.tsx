import { Spin } from 'antd';
import { Content } from 'components';
import { useRequisitionSlipById } from 'hooks/useRequisitionSlips';
import React from 'react';
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

	return (
		<Content
			className="ViewRequisitionSlip"
			rightTitle={`#${requisitionSlip?.reference_number}`}
			title="View Purchase Request"
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
