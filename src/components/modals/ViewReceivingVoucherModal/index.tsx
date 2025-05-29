import { PrinterOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons, ReceiptHeader } from 'components/Printing';
import { printReceivingReport, getFullName } from 'ejjy-global';
import dayjs from 'dayjs';
import { VIEW_PRINTING_MODAL_WIDTH } from 'global';
import { usePdf, useSiteSettings } from 'hooks';
import React, { useEffect, useState } from 'react';
import { formatDateTime, formatQuantity } from 'utils';

const { Text } = Typography;

const columns: ColumnsType = [
	{ title: 'Product Name', dataIndex: 'description' },
	{ title: 'Quantity', dataIndex: 'qty', align: 'center' },
];

interface Props {
	receivingVoucher: any;
	onClose: any;
}

export const ViewReceivingVoucherModal = ({
	receivingVoucher,
	onClose,
}: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	const generateHtmlContent = () =>
		printReceivingReport({
			receivingReport: receivingVoucher,
			siteSettings,
			user: undefined,
			isPdf: true,
		});

	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettings();
	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `ReceivingVoucher_${receivingVoucher.id}.pdf`,
		print: generateHtmlContent,
	});

	// METHODS
	useEffect(() => {
		const products = receivingVoucher?.receiving_voucher_products || [];

		const formattedProducts = products.map((item) => ({
			key: item.id,
			description: item.product.name,
			qty: formatQuantity({
				unitOfMeasurement: item.product.unit_of_measurement,
				quantity: item.quantity,
			}),
		}));

		setDataSource(formattedProducts);
	}, [receivingVoucher]);

	const handlePrint = () => {
		printReceivingReport({ receivingReport: receivingVoucher, siteSettings });
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
			title="[View] Receiving Voucher"
			width={VIEW_PRINTING_MODAL_WIDTH}
			centered
			closable
			open
			onCancel={onClose}
		>
			<ReceiptHeader
				branchHeader={receivingVoucher.branch}
				title="RECEIVING REPORT"
			/>

			<Table
				className="mt-6"
				columns={columns}
				dataSource={dataSource}
				pagination={false}
				size="small"
				bordered
			/>

			<Space className="mt-4 w-100" direction="vertical">
				<Space className="w-100 justify-space-between">
					<Text>Encoder: {getFullName(receivingVoucher.encoded_by)}</Text>
					<Text>Inspector: {getFullName(receivingVoucher.checked_by)}</Text>
				</Space>
				<Space className="mt-2 w-100">
					<Text>Vendor: {receivingVoucher.supplier_name}</Text>
				</Space>

				<Text>GDT: {formatDateTime(receivingVoucher.datetime_created)}</Text>
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
