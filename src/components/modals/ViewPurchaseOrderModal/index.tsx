import { PrinterOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal, Table, Space, Typography } from 'antd';
import { PdfButtons, ReceiptHeaderV2 } from 'components/Printing';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/lib/table';
import { EMPTY_CELL, getFullName } from 'ejjy-global';
import { usePdf, usePurchaseOrderById } from 'hooks';
import React, { useEffect, useState } from 'react';
import { formatDateTime, formatQuantity } from 'utils';
import { printPurchaseOrder } from 'utils/printPurchaseOrder';

const columns: ColumnsType = [
	{ title: 'Product', dataIndex: 'product_name', key: 'product_name' },
	{ title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center' },
];

interface Props {
	purchaseOrder: any;
	onClose: () => void;
}

export const ViewPurchaseOrderModal = ({ purchaseOrder, onClose }: Props) => {
	const [dataSource, setDataSource] = useState([]);

	const { Text } = Typography;

	const { data: fullPurchaseOrder } = usePurchaseOrderById(purchaseOrder?.id);
	const data = fullPurchaseOrder || purchaseOrder;

	const generateHtmlContent = () =>
		printPurchaseOrder({ purchaseOrder: data, isPdf: true });

	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `PurchaseOrder_${data?.id}.pdf`,
		print: generateHtmlContent,
	});

	useEffect(() => {
		const products = data?.purchase_order_products || [];
		const formatted = products.map((item: any) => ({
			key: item.id,
			product_name: item.product?.name,
			quantity: formatQuantity({
				unitOfMeasurement: item.product?.unit_of_measurement,
				quantity: item.quantity,
			}),
		}));
		setDataSource(formatted);
	}, [data]);

	const handlePrint = () => {
		printPurchaseOrder({ purchaseOrder: data });
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
			title="[View] Purchase Order"
			width={425}
			centered
			closable
			open
			onCancel={onClose}
		>
			<ReceiptHeaderV2
				branchHeader={data?.branch}
				branchName={data?.branch?.name}
				title="PURCHASE ORDER"
			/>

			<Space
				align="center"
				className="w-100 text-center"
				direction="vertical"
				size={0}
			>
				<br />
				<Text style={{ whiteSpace: 'pre-line' }}>Datetime Requested:</Text>
				<Text style={{ whiteSpace: 'pre-line' }}>
					{formatDateTime(data?.datetime_created)}
				</Text>
			</Space>

			<Descriptions
				className="mt-6 w-100"
				column={1}
				contentStyle={{ textAlign: 'right', display: 'block' }}
				labelStyle={{ width: 200 }}
				size="small"
			>
				<Descriptions.Item label="Reference #:">
					{data?.reference_number || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Supplier:">
					{data?.supplier_name || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Customer">
					{data?.branch?.name || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Authorizer:">
					{getFullName(data?.authorizer)}
				</Descriptions.Item>
			</Descriptions>

			<Table
				className="mt-6"
				columns={columns}
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
					Remarks: {data?.overall_remarks || 'N/A'}
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
