/* eslint-disable react-hooks/exhaustive-deps */

interface Props {
	visible: boolean;
	orderSlip: any;
	onClose: any;
}

export const ViewDeliveryReceiptModal = ({ orderSlip, visible, onClose }: Props) => {
	// const [requestedProducts, setRequestedProducts] = useState([]);

	// const {
	// 	deliveryReceipt,
	// 	getDeliveryReceiptById,
	// 	status: deliveryReceiptStatus,
	// 	recentRequest: deliveryReceiptRecentRequest,
	// } = useDeliveryReceipt();

	// useEffect(() => {
	// 	if (orderSlip) {
	// 		getDeliveryReceiptById(orderSlip.delivery_receipt_id);
	// 	}
	// }, [orderSlip]);

	return null;

	// return (
	// 	<Modal
	// 		title="View FDS-1"
	// 		visible={visible}
	// 		footer={[<Button key="close" text="Close" onClick={onClose} />]}
	// 		onCancel={onClose}
	// 		centered
	// 		closable
	// 	>
	// 		<DetailsRow>
	// 			<DetailsHalf label="Recipient" value={orderSlip?.requesting_user?.branch?.name} />
	// 			<DetailsHalf label="F-OS1" value={orderSlip?.id} />

	// 			<DetailsHalf
	// 				label="Date & Time Received"
	// 				value={formatDateTime(orderSlip?.datetime_created)}
	// 			/>

	// 			<DetailsHalf label="F-DS1" value={orderSlip?.requisition_slip?.id} />
	// 		</DetailsRow>

	// 		<Divider dashed />

	// 		<Row gutter={[15, 15]} align="middle" justify="space-between">
	// 			<Col xs={24} sm={12} lg={18}>
	// 				<Label label="Requested Products" />
	// 			</Col>
	// 			<Col xs={24} sm={12} lg={6}>
	// 				<Input placeholder={orderSlip?.assigned_store?.name} onChange={null} disabled />
	// 			</Col>
	// 		</Row>

	// 		{/* <TableNormal columns={getColumns()} data={requestedProducts} /> */}
	// 	</Modal>
	// );
};
