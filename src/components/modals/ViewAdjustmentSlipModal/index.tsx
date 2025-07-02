import React from 'react';
import { Modal, Descriptions, Space, Button, Typography, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { PdfButtons, ReceiptHeaderV2 } from 'components/Printing';
import { formatDateTime, formatQuantity } from 'utils';
import { useAdjustmentSlipRetrieve } from 'hooks/useAdjustmentSlips';
import { getFullName, VIEW_PRINTING_MODAL_WIDTH } from 'ejjy-global';
import dayjs from 'dayjs';

const { Text } = Typography;

interface Props {
	adjustmentSlipId: number | null;
	onClose: () => void;
}

export const ViewAdjustmentSlipModal = ({
	adjustmentSlipId,
	onClose,
}: Props) => {
	const { data: adjustmentSlip, isLoading } = useAdjustmentSlipRetrieve(
		adjustmentSlipId,
	);

	if (!adjustmentSlip) return null;

	// Prepare products data for display
	const productsData = adjustmentSlip?.products?.map((product) => ({
		key: product.id,
		productName: `${product.product.product.name}${
			product.product.product.is_vat_exempted ? ' - VE' : ' - V'
		}`,
		adjustedQuantity: formatQuantity({
			unitOfMeasurement: product.product.product.unit_of_measurement,
			quantity: product.adjusted_value,
		}),
		adjustedValue: product.adjusted_value,
		remarks: product.remarks || 'N/A',
		errorRemarks: product.error_remarks || 'N/A',
	}));

	const handlePrint = () => {
		window.print();
	};

	const handleDownloadPdf = () => {
		// TODO: Implement PDF download functionality
		console.log('Download PDF for adjustment slip:', adjustmentSlip?.id);
	};

	const handlePreviewPdf = () => {
		// TODO: Implement PDF preview functionality
		console.log('Preview PDF for adjustment slip:', adjustmentSlip?.id);
	};

	return (
		<Modal
			className="Modal__hasFooter"
			footer={[
				<Button
					key="print"
					disabled={isLoading}
					icon={<PrinterOutlined />}
					type="primary"
					onClick={handlePrint}
				>
					Print
				</Button>,
				<PdfButtons
					key="pdf"
					downloadPdf={handleDownloadPdf}
					isDisabled={isLoading}
					isLoading={isLoading}
					previewPdf={handlePreviewPdf}
				/>,
			]}
			title="View Adjustment Slip"
			width={VIEW_PRINTING_MODAL_WIDTH}
			centered
			closable
			open
			onCancel={onClose}
		>
			<ReceiptHeaderV2
				branchHeader={adjustmentSlip.branch}
				title="ADJUSTMENT SLIP"
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
					{formatDateTime(adjustmentSlip.datetime_created)}
				</Text>
			</Space>

			{/* Details Section */}
			<Descriptions
				className="mt-6 w-100"
				column={1}
				contentStyle={{
					textAlign: 'right',
					display: 'block',
				}}
				// labelStyle={{
				// 	width: 200,
				// }}
				size="small"
			>
				<Descriptions.Item label="Adjustment Slip ID">
					{adjustmentSlip.id}
				</Descriptions.Item>
				<Descriptions.Item label="Branch">
					{adjustmentSlip.branch?.name || 'N/A'}
				</Descriptions.Item>
				<Descriptions.Item label="Encoded By">
					{getFullName(adjustmentSlip.encoded_by)}
				</Descriptions.Item>
				<Descriptions.Item label="Date & Time Created">
					{formatDateTime(adjustmentSlip.datetime_created)}
				</Descriptions.Item>
			</Descriptions>

			<Divider />

			{/* Products List */}
			<div className="mt-6">
				{productsData?.map((product, index) => (
					<div key={product.key} className="mb-4">
						<Text strong>{product.productName}</Text>
						<br />
						<Text style={{ marginLeft: '20px' }}>
							{product.adjustedValue >= 0 ? '+' : ''} {product.adjustedQuantity}
							{product.errorRemarks !== 'N/A' ? (
								<span> Error - {product.errorRemarks}</span>
							) : (
								<span className="ml-4">
									{product.remarks !== 'N/A' ? product.remarks : 'Spoilage'}
								</span>
							)}
						</Text>
						{index < productsData.length - 1 && <br />}
					</div>
				))}
			</div>

			{/* Footer Information */}
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

			{adjustmentSlip.remarks && (
				<Space
					align="center"
					className="w-100 text-center"
					direction="vertical"
					size={0}
				>
					<Text style={{ whiteSpace: 'pre-line' }}>
						Overall Remarks: {adjustmentSlip.remarks}
					</Text>
				</Space>
			)}
		</Modal>
	);
};
