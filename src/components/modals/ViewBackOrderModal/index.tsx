import { Modal, Space, Table, Typography, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons, ReceiptHeader } from 'components/Printing';
import dayjs from 'dayjs';
import { getFullName, printStockOutForm, formatInPeso } from 'ejjy-global';
import { EMPTY_CELL, backOrderTypes, VIEW_PRINTING_MODAL_WIDTH } from 'global';
import { useBackOrderRetrieve, usePdf, useSiteSettings } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import { formatDateTime, formatQuantity, getBackOrderStatus } from 'utils';

const { Text } = Typography;

const columnsDamage: ColumnsType = [
	{ title: 'Description', dataIndex: 'description' },
	{ title: 'Qty Returned', dataIndex: 'quantityReturned', align: 'center' },
	{ title: 'Qty Received', dataIndex: 'quantityReceived', align: 'center' },
	{ title: 'Status', dataIndex: 'status', align: 'center' },
];

const columnsForReturn: ColumnsType = [
	{ title: 'Description', dataIndex: 'description' },
	{ title: 'Quantity', dataIndex: 'quantity', align: 'center' },
	{ title: 'Price', dataIndex: 'price', align: 'center' },
	{ title: 'Amount', dataIndex: 'amount', align: 'center' },
];

interface Props {
	backOrder: any | number;
	onClose: any;
}

export const ViewBackOrderModal = ({ backOrder, onClose }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [backOrderData, setBackOrderData] = useState(null);
	const [title, setTitle] = useState('');
	const [columns, setColumns] = useState([]);

	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettings();
	const { data: backOrderRetrieved } = useBackOrderRetrieve({
		id: backOrder,
		options: {
			enabled: _.isNumber(backOrder),
		},
	});
	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		print: () => printStockOutForm(backOrder, siteSettings),
	});

	// METHODS
	useEffect(() => {
		const data = _.isNumber(backOrder) ? backOrderRetrieved : backOrder;

		setBackOrderData(data);
		setColumns(
			data?.type === backOrderTypes.DAMAGED ? columnsDamage : columnsForReturn,
		);
		setTitle(
			`[View] ${
				data?.type === backOrderTypes.DAMAGED ? 'Back Order' : 'Stock Out'
			}`,
		);
	}, [backOrderRetrieved, backOrder]);

	useEffect(() => {
		const products = backOrderData?.products || [];

		const formattedProducts = products.map((item) => ({
			key: item.id,
			description: item.product.name,
			quantityReturned: formatQuantity({
				unitOfMeasurement: item.product.unit_of_measurement,
				quantity: item.quantity_returned,
			}),
			quantityReceived: item?.quantity_received
				? formatQuantity({
						unitOfMeasurement: item.product.unit_of_measurement,
						quantity: item.quantity_received,
				  })
				: EMPTY_CELL,
			status: getBackOrderStatus(item.status),
			quantity: formatQuantity({
				unitOfMeasurement: item.product.unit_of_measurement,
				quantity: item.quantity_returned,
			}),
			price: formatInPeso(item.current_price_per_piece),
			amount: formatInPeso(
				item.current_price_per_piece * item.quantity_returned,
			),
		}));
		setDataSource(formattedProducts);
	}, [backOrderData]);

	const handlePrint = () => {
		printStockOutForm(backOrder, siteSettings);
	};

	return (
		<Modal
			className="Modal__hasFooter"
			footer={[
				<Button
					key="print"
					disabled={isLoadingPdf}
					icon={<PrinterOutlined />}
					type="primary"
					onClick={handlePrint}
				>
					Print
				</Button>,
				<PdfButtons
					key="pdf"
					downloadPdf={downloadPdf}
					isDisabled={isLoadingPdf}
					isLoading={isLoadingPdf}
					previewPdf={previewPdf}
				/>,
			]}
			title="[View] Delivery Receipt"
			width={VIEW_PRINTING_MODAL_WIDTH}
			centered
			closable
			open
			onCancel={onClose}
		>
			<ReceiptHeader title="DELIVERY RECEIPT" />

			<Table
				className="mt-6"
				columns={columns}
				dataSource={dataSource}
				pagination={false}
				size="small"
				bordered
			/>

			<Space className="w-100 mt-2 justify-space-between ">
				<Text strong>TOTAL AMOUNT: </Text>
				<Text strong>{formatInPeso(backOrderData?.amount)}</Text>
			</Space>

			<Space className="mt-4 w-100 mr-6" direction="vertical">
				<Space className="w-100 justify-space-between">
					<Text>Customer: {backOrderData?.customer_name}</Text>
					<Text>Encoder: {getFullName(backOrderData?.encoded_by)}</Text>
				</Space>

				<Space className="w-100">
					<Text>Remarks: {backOrderData?.overall_remarks}</Text>
				</Space>

				<Text>GDT: {formatDateTime(backOrderData?.datetime_created)}</Text>
				<Text>PDT: {formatDateTime(dayjs(), false)}</Text>
			</Space>

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{ display: 'none' }}
			/>
		</Modal>
	);
};
