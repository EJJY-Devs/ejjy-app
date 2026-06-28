import { PrinterOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal, Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons, ReceiptHeaderV2 } from 'components/Printing';
import dayjs from 'dayjs';
import {
	EMPTY_CELL,
	VIEW_PRINTING_MODAL_WIDTH,
	getFullName,
} from 'ejjy-global';
import { usePdf, usePurchaseById, useSiteSettings } from 'hooks';
import React, { useEffect, useState } from 'react';
import { formatDateTime, formatInPeso } from 'utils';
import { printPurchase } from 'utils/printPurchase';

const { Text } = Typography;

const columns: ColumnsType = [
	{ title: 'Product Name', dataIndex: 'name' },
	{ title: 'Qty', dataIndex: 'quantity', align: 'center' },
	{ title: 'Cost/Piece', dataIndex: 'costPerPiece', align: 'right' },
	{ title: 'Amount', dataIndex: 'amount', align: 'right' },
];

interface Props {
	purchase: any;
	onClose: any;
}

export const ViewPurchaseModal = ({ purchase, onClose }: Props) => {
	const [dataSource, setDataSource] = useState([]);

	const { data: fullPurchase } = usePurchaseById(purchase?.id);
	const data = fullPurchase || purchase;

	const { data: siteSettings } = useSiteSettings();
	const { isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `Purchase_${data.reference_number}.pdf`,
		print: () => printPurchase({ purchase: data, siteSettings, isPdf: true }),
	});

	useEffect(() => {
		const products = data?.purchase_products || [];
		const formatted = products.map((item: any) => ({
			key: item.id,
			name: item.product?.name,
			quantity: item.quantity,
			costPerPiece: formatInPeso(item.cost_per_piece),
			amount: formatInPeso(Number(item.quantity) * Number(item.cost_per_piece)),
		}));
		setDataSource(formatted);
	}, [data]);

	const handlePrint = () => {
		printPurchase({ purchase: data, siteSettings });
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
			title="[View] Purchases"
			width={VIEW_PRINTING_MODAL_WIDTH}
			centered
			closable
			open
			onCancel={onClose}
		>
			<ReceiptHeaderV2
				branchHeader={data?.branch}
				branchName={data?.branch?.name}
				title="PURCHASES"
			/>

			<Descriptions
				className="mt-6 w-100"
				column={1}
				contentStyle={{ textAlign: 'right', display: 'block' }}
				labelStyle={{ width: 200 }}
				size="small"
			>
				<Descriptions.Item label="Reference #">
					{data?.reference_number || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Supplier">
					{data?.supplier_name || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Authorizer">
					{getFullName(data?.authorizer)}
				</Descriptions.Item>
				<Descriptions.Item label="Date">
					{formatDateTime(data?.datetime_created)}
				</Descriptions.Item>
				<Descriptions.Item label="PO #">
					{data?.purchase_order?.reference_number || EMPTY_CELL}
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
					Total Amount: {formatInPeso(data?.total_amount)}
				</Text>
			</Space>

			<Space
				align="center"
				className="w-100 text-center"
				direction="vertical"
				size={0}
			>
				<br />
				<Text style={{ whiteSpace: 'pre-line' }}>
					Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}
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
		</Modal>
	);
};
