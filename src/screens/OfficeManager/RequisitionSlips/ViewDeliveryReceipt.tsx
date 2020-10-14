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

const ViewDeliveryReceipt = ({ match }: Props) => {
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
			fetchDeliveryReceipt();
		}
	}, [deliveryReceiptId]);

	const getBreadcrumbItems = useCallback(
		() => [
			{ name: 'Requisition Slips', link: '/requisition-slips' },
			{
				name: `#${deliveryReceipt?.order_slip?.requisition_slip?.id}`,
				link: `/requisition-slips/${deliveryReceipt?.order_slip?.requisition_slip?.id}`,
			},
			{ name: `#${deliveryReceipt?.id}` },
		],
		[deliveryReceipt],
	);

	const fetchDeliveryReceipt = () => {
		getDeliveryReceiptById(deliveryReceiptId, ({ status }) => {
			if (status === request.ERROR) {
				history.replace('/404');
			}
		});
	};

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
				<AdjustmentSlips
					deliveryReceipt={deliveryReceipt}
					fetchDeliveryReceipt={fetchDeliveryReceipt}
				/>
			</section>
		</Container>
	);
};

export default ViewDeliveryReceipt;
