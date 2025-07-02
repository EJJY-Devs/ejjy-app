import { Modal, Space, Table, Typography, Button, Descriptions } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons, ReceiptHeaderV2 } from 'components/Printing';
import dayjs from 'dayjs';
import { getFullName, printDeliveryReceipt } from 'ejjy-global';
import { VIEW_PRINTING_MODAL_WIDTH } from 'global';
import { useBackOrderRetrieve, usePdf, useSiteSettings } from 'hooks';
import React, { useEffect, useState } from 'react';
import { formatDateTime, formatQuantity } from 'utils';

const { Text } = Typography;

const columnsForDeliveryReceipt: ColumnsType = [
	{ title: 'Product Name', dataIndex: 'description' },
	{ title: 'Quantity', dataIndex: 'quantity', align: 'center' },
];

interface Props {
	backOrder: any | number;
	onClose: any;
}

export const ViewBackOrderModal = ({ backOrder, onClose }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [backOrderData, setBackOrderData] = useState(null);

	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettings();
	const { data: backOrderRetrieved } = useBackOrderRetrieve({
		id: backOrder,
		options: {
			enabled: typeof backOrder === 'number',
		},
	});

	const generateHtmlContent = () =>
		printDeliveryReceipt({
			deliveryReceipt: backOrder,
			siteSettings,
			user: null,
			isPdf: true,
		});

	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `DeliveryReceipt_${backOrder?.id}.pdf`,
		print: generateHtmlContent,
	});

	// METHODS
	useEffect(() => {
		const data = typeof backOrder === 'number' ? backOrderRetrieved : backOrder;

		setBackOrderData(data);
	}, [backOrderRetrieved, backOrder]);

	useEffect(() => {
		const products = backOrderData?.products || [];

		const formattedProducts = products.map((item) => ({
			key: item.id,
			description: item.product.name,
			quantity: formatQuantity({
				unitOfMeasurement: item.product.unit_of_measurement,
				quantity: item.quantity_returned,
			}),
		}));

		setDataSource(formattedProducts);
	}, [backOrderData]);

	const handlePrint = () => {
		printDeliveryReceipt({
			deliveryReceipt: backOrder,
			siteSettings,
		});
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
			<ReceiptHeaderV2
				branchHeader={backOrder.branch}
				title="DELIVERY RECEIPT"
			/>

			<Space
				align="center"
				className="w-100 text-center"
				direction="vertical"
				size={0}
			>
				<br />
				<Text style={{ whiteSpace: 'pre-line' }}>Datetime Generated:</Text>
				<Text style={{ whiteSpace: 'pre-line' }}>
					{formatDateTime(backOrderData?.datetime_created)}
				</Text>
			</Space>

			<Descriptions
				className="mt-6 w-100"
				column={1}
				contentStyle={{
					textAlign: 'right',
					display: 'block',
				}}
				labelStyle={{
					width: 200,
				}}
				size="small"
			>
				<Descriptions.Item label="Reference #:">
					{backOrderData?.reference_number}
				</Descriptions.Item>
				<Descriptions.Item label="Vendor:">
					{backOrderData?.branch?.name}
				</Descriptions.Item>
				<Descriptions.Item label="Customer">
					{backOrderData?.customer_name}
				</Descriptions.Item>
				<Descriptions.Item label="Encoder:">
					{getFullName(backOrderData?.encoded_by)}
				</Descriptions.Item>
			</Descriptions>

			{/* Products Table */}
			<Table
				className="mt-6"
				columns={columnsForDeliveryReceipt}
				dataSource={dataSource}
				pagination={false}
				size="small"
				bordered
			/>

			<Space
				align="center"
				className="w-100 text-center"
				direction="vertical"
				size={0}
			>
				<br />
				<Text style={{ whiteSpace: 'pre-line' }}>
					Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}{' '}
				</Text>
			</Space>

			<Space
				align="center"
				className="w-100 text-center"
				direction="vertical"
				size={0}
			>
				<Text style={{ whiteSpace: 'pre-line' }}>
					Remarks: {backOrderData?.overall_remarks || 'N/A'}
				</Text>
			</Space>

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{ display: 'none' }}
			/>
		</Modal>
	);
};
