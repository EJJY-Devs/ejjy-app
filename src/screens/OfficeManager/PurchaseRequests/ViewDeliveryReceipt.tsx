/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Container } from '../../../components';
import { request } from '../../../global/types';
import { useDeliveryReceipt } from '../hooks/useDeliveryReceipt';
import { AdjustmentSlips } from './components/AdjustmentSlips/AdjustmentSlips';
import { DeliveryReceipt } from './components/DeliveryReceipt/DeliveryReceipt';
import './style.scss';

interface Props {
	match: any;
}

const ViewPurchaseRequest = ({ match }: Props) => {
	// Routing
	const deliveryReceiptId = match?.params?.id;
	const history = useHistory();

	const {
		deliveryReceipt,
		getDeliveryReceiptById,
		status: deliveryReceiptStatus,
	} = useDeliveryReceipt();

	// Effect: Fetch delivery receipt of order slip
	useEffect(() => {
		if (deliveryReceiptId) {
			getDeliveryReceiptById(deliveryReceiptId, ({ status }) => {
				if (status === request.ERROR) {
					history.replace('/404');
				}
			});
		}
	}, [deliveryReceiptId]);

	const getBreadcrumbItems = useCallback(
		() => [
			{ name: 'Purchase Requests', link: '/purchase-requests' },
			{
				name: `#${deliveryReceipt?.order_slip?.purchase_request?.id}`,
				link: `/purchase-requests/${deliveryReceipt?.order_slip?.purchase_request?.id}`,
			},
			{ name: `#${deliveryReceipt?.id}` },
		],
		[deliveryReceipt],
	);

	return (
		<Container
			title="[VIEW] F-DS1"
			rightTitle={`#${deliveryReceipt?.id}`}
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			loading={deliveryReceiptStatus === request.REQUESTING}
			loadingText="Fetching delivery receipt..."
		>
			<section className="ViewDeliveryReceipt">
				<DeliveryReceipt deliveryReceipt={deliveryReceipt} />
				<AdjustmentSlips deliveryReceipt={deliveryReceipt} />
			</section>
		</Container>
	);
};

export default ViewPurchaseRequest;