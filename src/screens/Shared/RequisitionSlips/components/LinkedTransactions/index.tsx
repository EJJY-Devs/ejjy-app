import { DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Empty, List, Tag } from 'antd';
import { TableHeader } from 'components';
import { ViewPurchaseOrderModal, ViewPurchaseModal } from 'components/modals';
import { Box } from 'components/elements';
import { usePurchaseOrderById } from 'hooks';
import React, { useMemo, useState } from 'react';
import { formatDateTime } from 'utils';
import './style.scss';

interface Props {
	requisitionSlip: any;
}

export const LinkedTransactions = ({ requisitionSlip }: Props) => {
	const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<any>(null);
	const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

	const po = requisitionSlip?.linked_purchase_order;

	const { data: fullPurchaseOrder } = usePurchaseOrderById(po?.id || 0);

	const transactions = useMemo(() => {
		const items: any[] = [];

		if (!po) return items;

		items.push({
			key: `po-${po.id}`,
			icon: <ShoppingCartOutlined />,
			type: 'Purchase Order',
			reference: po.reference_number,
			onView: () => setSelectedPurchaseOrder(po),
		});

		const purchases = fullPurchaseOrder?.purchases || [];
		purchases.forEach((purchase: any) => {
			items.push({
				key: `purchase-${purchase.id}`,
				icon: <DollarOutlined />,
				type: 'Purchase',
				reference: purchase.reference_number,
				datetime: purchase.datetime_created,
				onView: () => setSelectedPurchase(purchase),
			});
		});

		return items;
	}, [po, fullPurchaseOrder]);

	return (
		<Box className="LinkedTransactions" padding>
			<TableHeader title="Linked Transactions" />

			<List
				className="LinkedTransactions_list"
				dataSource={transactions}
				locale={{
					emptyText: <Empty description="No linked transactions yet" />,
				}}
				renderItem={(item: any) => (
					<List.Item
						actions={[
							<Button key="view" type="link" onClick={item.onView}>
								View
							</Button>,
						]}
					>
						<List.Item.Meta
							avatar={
								<span className="LinkedTransactions_icon">{item.icon}</span>
							}
							description={`Reference #: ${item.reference}${
								item.datetime ? ` · ${formatDateTime(item.datetime)}` : ''
							}`}
							title={
								<Tag color={item.type === 'Purchase Order' ? 'green' : 'blue'}>
									{item.type}
								</Tag>
							}
						/>
					</List.Item>
				)}
				bordered
			/>

			{selectedPurchaseOrder && (
				<ViewPurchaseOrderModal
					purchaseOrder={selectedPurchaseOrder}
					onClose={() => setSelectedPurchaseOrder(null)}
				/>
			)}

			{selectedPurchase && (
				<ViewPurchaseModal
					purchase={selectedPurchase}
					onClose={() => setSelectedPurchase(null)}
				/>
			)}
		</Box>
	);
};
