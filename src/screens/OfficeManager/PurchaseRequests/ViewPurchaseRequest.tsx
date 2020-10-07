/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Container } from '../../../components';
import { selectors } from '../../../ducks/purchase-requests';
import { request } from '../../../global/types';
import { usePurchaseRequests } from '../../../hooks/usePurchaseRequests';
import { OrderSlips } from './components/OrderSlips/OrderSlips';
import { RequestedProducts } from './components/RequestedProducts';
import './style.scss';

interface Props {
	match: any;
}

const ViewPurchaseRequest = ({ match }: Props) => {
	// Routing
	const purchaseRequestId = match?.params?.id;
	const history = useHistory();

	const {
		getPurchaseRequestsById,
		removePurchaseRequestByBranch,
		status: purchaseRequestStatus,
	} = usePurchaseRequests();
	const purchaseRequest = useSelector(selectors.selectPurchaseRequest());

	// Effect: Fetch purchase request
	useEffect(() => {
		removePurchaseRequestByBranch();
		getPurchaseRequestsById(purchaseRequestId, purchaseRequestDoesNotExistCallback);
	}, []);

	const purchaseRequestDoesNotExistCallback = ({ status }) => {
		if (status === request.ERROR) {
			history.replace('/404');
		}
	};

	const getBreadcrumbItems = useCallback(
		() => [
			{ name: 'Purchase Requests', link: '/purchase-requests' },
			{ name: `#${purchaseRequest?.id}` },
		],
		[purchaseRequest],
	);

	return (
		<Container
			title="[VIEW] F-RS01"
			rightTitle={`#${purchaseRequest?.id}`}
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			loading={purchaseRequestStatus === request.REQUESTING}
			loadingText="Fetching purchase request..."
		>
			<section className="ViewPurchaseRequest">
				<RequestedProducts
					purchaseRequest={purchaseRequest}
					purchaseRequestStatus={purchaseRequestStatus}
				/>

				<OrderSlips purchaseRequestId={purchaseRequestId} />
			</section>
		</Container>
	);
};

export default ViewPurchaseRequest;
