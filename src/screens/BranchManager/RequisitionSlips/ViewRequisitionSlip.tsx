/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Container } from '../../../components';
import { request } from '../../../global/types';
import { useRequisitionSlips } from '../../../hooks/useRequisitionSlips';
import { OrderSlips } from './components/OrderSlips/OrderSlips';
import { RequestedProducts } from './components/RequestedProducts';
import './style.scss';

interface Props {
	match: any;
}

const ViewRequisitionSlip = ({ match }: Props) => {
	// Routing
	const requisitionSlipId = match?.params?.id;
	const history = useHistory();

	const {
		requisitionSlip,
		getRequisitionSlipsById,
		removeRequisitionSlipByBranch,
		status,
	} = useRequisitionSlips();

	// Effect: Fetch requisition slip
	useEffect(() => {
		removeRequisitionSlipByBranch();
		getRequisitionSlipsById(requisitionSlipId, requisitionSlipDoesNotExistCallback);
	}, []);

	const requisitionSlipDoesNotExistCallback = ({ status }) => {
		if (status === request.ERROR) {
			history.replace('/404');
		}
	};

	const getBreadcrumbItems = useCallback(
		() => [
			{ name: 'Requisition Slips', link: '/requisition-slips' },
			{ name: `#${requisitionSlip?.id}` },
		],
		[requisitionSlip],
	);

	return (
		<Container
			title="[VIEW] F-RS01"
			rightTitle={`#${requisitionSlip?.id}`}
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
		>
			<section className="ViewRequisitionSlip">
				<RequestedProducts requisitionSlip={requisitionSlip} requisitionSlipStatus={status} />

				<OrderSlips requisitionSlipId={requisitionSlipId} />
			</section>
		</Container>
	);
};

export default ViewRequisitionSlip;
