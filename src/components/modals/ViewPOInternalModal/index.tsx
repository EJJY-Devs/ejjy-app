import { PrinterOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal, Table, Space, Typography } from 'antd';
import { PdfButtons, ReceiptHeaderV2 } from 'components/Printing';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/lib/table';
import { EMPTY_CELL, getFullName } from 'ejjy-global';
import { usePdf, useSiteSettings } from 'hooks';
import React from 'react';
import { formatDateTime, formatQuantity } from 'utils';
import { printPOInternal } from 'utils/printPOInternal';

const columns: ColumnsType = [
	{ title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
	{
		title: 'Quantity',
		dataIndex: 'quantity',
		key: 'quantity',
		align: 'center',
	},
	{ title: 'Unit', dataIndex: 'unit', key: 'unit', align: 'center' },
];

interface Props {
	requisitionSlip: any;
	poReferenceNumber?: string;
	onClose: () => void;
}

export const ViewPOInternalModal = ({
	requisitionSlip,
	poReferenceNumber,
	onClose,
}: Props) => {
	const { Text } = Typography;
	const { data: siteSettings } = useSiteSettings();

	const slipWithPo = {
		...requisitionSlip,
		po_reference_number: poReferenceNumber,
	};

	const generateHtmlContent = () =>
		printPOInternal({ requisitionSlip: slipWithPo, siteSettings, isPdf: true });

	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `PurchaseOrder_${requisitionSlip?.id}.pdf`,
		print: generateHtmlContent,
	});

	const handlePrint = () => {
		printPOInternal({ requisitionSlip: slipWithPo, siteSettings });
	};

	const dataSource = (requisitionSlip.products || []).map(
		({ quantity, product, unit }: any) => ({
			key: product.id,
			product_name: product.name,
			quantity: formatQuantity({
				unitOfMeasurement: product.unit_of_measurement,
				quantity,
			}),
			unit: unit || EMPTY_CELL,
		}),
	);

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
				branchHeader={requisitionSlip.branch}
				title="PURCHASE ORDER"
			/>

			<Descriptions
				className="mt-6 w-100"
				column={1}
				contentStyle={{ textAlign: 'right', display: 'block' }}
				labelStyle={{ width: 200 }}
				size="small"
			>
				<Descriptions.Item label="Reference #">
					{poReferenceNumber || requisitionSlip?.reference_number}
				</Descriptions.Item>
				<Descriptions.Item label="Supplier">
					{requisitionSlip?.vendor?.name || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Customer">
					{requisitionSlip?.branch?.name || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Authorizer">
					{getFullName(requisitionSlip?.authorizer)}
				</Descriptions.Item>
				<Descriptions.Item label="Date">
					{formatDateTime(requisitionSlip?.datetime_created)}
				</Descriptions.Item>
				{requisitionSlip?.overall_remarks && (
					<Descriptions.Item label="Remarks">
						{requisitionSlip.overall_remarks}
					</Descriptions.Item>
				)}
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
					Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}
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
