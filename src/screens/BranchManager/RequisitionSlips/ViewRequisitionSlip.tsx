/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Container } from '../../../components';
import { selectors } from '../../../ducks/requisition-slips';
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
		getRequisitionSlipsById,
		removeRequisitionSlipByBranch,
		status: requisitionSlipStatus,
	} = useRequisitionSlips();
	const requisitionSlip = useSelector(selectors.selectRequisitionSlip());

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
				<RequestedProducts
					requisitionSlip={requisitionSlip}
					requisitionSlipStatus={requisitionSlipStatus}
				/>

				<OrderSlips requisitionSlipId={requisitionSlipId} />
			</section>
		</Container>
	);
};

export default ViewRequisitionSlip;
