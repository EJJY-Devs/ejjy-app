import { PrinterOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal, Table, Space, Typography } from 'antd';
import { PdfButtons, ReceiptHeaderV2 } from 'components/Printing';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/lib/table';
import { getFullName, printRequisitionSlip } from 'ejjy-global';
import { useSiteSettings, usePdf } from 'hooks';
import React from 'react';
import { useUserStore } from 'stores';
import { formatDateTime, formatQuantity } from 'utils';

interface Props {
	requisitionSlip: any;
	onClose: any;
}

export const ViewRequisitionSlipModal = ({
	requisitionSlip,
	onClose,
}: Props) => {
	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { data: siteSettings } = useSiteSettings();

	const { Text } = Typography;

	const generateHtmlContent = () =>
		printRequisitionSlip({
			requisitionSlip,
			siteSettings,
			user,
			isPdf: true,
		});

	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `RequisitionSlip_${requisitionSlip.id}.pdf`,
		print: generateHtmlContent,
	});

	// METHODS
	const handlePrint = () => {
		printRequisitionSlip({ requisitionSlip, siteSettings, user });
	};

	// Define table columns
	const columns: ColumnsType = [
		{
			title: 'Product Name',
			dataIndex: 'product_name',
			key: 'product_name',
		},
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			key: 'quantity',
			align: 'center',
		},
	];

	// Map products to table data
	const dataSource = requisitionSlip.products.map(({ quantity, product }) => ({
		key: product.id,
		product_name: product.name,
		quantity: formatQuantity({
			unitOfMeasurement: product.unit_of_measurement,
			quantity,
		}),
	}));

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
			title="Requisition Slip"
			width={425}
			centered
			closable
			open
			onCancel={onClose}
		>
			<ReceiptHeaderV2
				branchHeader={requisitionSlip.branch}
				title="REQUISITION SLIP"
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
					{formatDateTime(requisitionSlip?.datetime_created)}
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
					{requisitionSlip?.reference_number}
				</Descriptions.Item>
				<Descriptions.Item label="Vendor:">
					{requisitionSlip?.vendor?.name}
				</Descriptions.Item>
				<Descriptions.Item label="Customer">
					{requisitionSlip.branch?.name}
				</Descriptions.Item>
				<Descriptions.Item label="Encoder:">
					{getFullName(requisitionSlip?.prepared_by)}
				</Descriptions.Item>
			</Descriptions>

			{/* Products Table */}
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
					Remarks: {requisitionSlip?.overall_remarks || 'N/A'}
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
