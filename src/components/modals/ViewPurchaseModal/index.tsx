import { PrinterOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, Typography } from 'antd';
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
import { computeVatBreakdown, formatDateTime, formatInPeso } from 'utils';
import { printPurchase } from 'utils/printPurchase';

const { Text } = Typography;

const columns: ColumnsType = [
	{ title: 'Qty', dataIndex: 'quantity', align: 'center' },
	{ title: 'Particulars', dataIndex: 'name' },
	{ title: 'Type', dataIndex: 'type', align: 'center' },
	{ title: 'Unit Cost', dataIndex: 'costPerPiece', align: 'right' },
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
	const { isLoadingPdf, previewPdf, downloadPdf, pdfPreviewModal } = usePdf({
		title: `Purchase_${data.reference_number}.pdf`,
		paper: 'a4HalfLengthwise',
		previewInModal: true,
		print: () => printPurchase({ purchase: data, siteSettings, isPdf: true }),
	});

	useEffect(() => {
		const products = data?.purchase_products || [];
		const formatted = products.map((item: any) => ({
			key: item.id,
			name: item.product?.name,
			quantity: item.quantity,
			type: item.product?.is_vat_exempted ? 'VE' : 'V',
			costPerPiece: formatInPeso(item.cost_per_piece),
			amount: formatInPeso(Number(item.quantity) * Number(item.cost_per_piece)),
		}));
		setDataSource(formatted);
	}, [data]);

	const { vatExempt, vatableSales, vatAmount } = computeVatBreakdown(
		(data?.purchase_products || []).map((item: any) => ({
			amount: Number(item.quantity) * Number(item.cost_per_piece),
			isVatExempt: !!item.product?.is_vat_exempted,
		})),
	);

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
			title="[View] Purchase Voucher"
			width={VIEW_PRINTING_MODAL_WIDTH}
			centered
			closable
			open
			onCancel={onClose}
		>
			<ReceiptHeaderV2
				branchHeader={data?.branch}
				branchName={data?.branch?.name}
				title="PURCHASE VOUCHER"
			/>

			<table
				className="mt-6 w-100"
				style={{ borderCollapse: 'collapse', fontSize: 14 }}
			>
				<tbody>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Voucher No.:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data?.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Date:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{formatDateTime(data?.datetime_created)}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							To:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data?.supplier_name || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Authorizer:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{getFullName(data?.authorizer)}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							PO #:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data?.purchase_order?.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Type:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data?.payment_type === 'on_account' ? 'On Account' : 'Pay'}
						</td>
					</tr>
					<tr>
						<td style={{ padding: '2px 0', verticalAlign: 'top', width: 200 }}>
							Remarks:
						</td>
						<td style={{ padding: '2px 0', textAlign: 'right' }}>
							{data?.overall_remarks || 'N/A'}
						</td>
					</tr>
				</tbody>
			</table>

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
				<Text style={{ whiteSpace: 'pre-line' }} strong>
					Total Amount: {formatInPeso(data?.total_amount)}
				</Text>
				<Text style={{ whiteSpace: 'pre-line' }}>
					VAT Exempt: {formatInPeso(vatExempt)}
				</Text>
				<Text style={{ whiteSpace: 'pre-line' }}>
					VATable Sales: {formatInPeso(vatableSales)}
				</Text>
				<Text style={{ whiteSpace: 'pre-line' }}>
					VAT Amount: {formatInPeso(vatAmount)}
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

			{pdfPreviewModal}
		</Modal>
	);
};
