import { Descriptions, Modal } from 'antd';
import { PdfButtons } from 'components/Printing';
import { EMPTY_CELL } from 'global';
import { usePdfPreviewModal } from 'hooks';
import type jsPDF from 'jspdf';
import React, { useState } from 'react';
import {
	formatInPeso,
	getBranchProductStatus,
	getProductType,
	savePdf,
} from 'utils';

import {
	PDF_WRAPPER_PADDING_PX,
	PDF_WRAPPER_WIDTH_PX,
	renderA4SinglePagePdf,
} from 'screens/Shared/Accounting/printing/renderA4SinglePagePdf';

import { printBranchInventoryReport } from './printBranchInventoryReport';

type Props = {
	balance: any;
	onClose: () => void;
};

export const ViewBranchInventoryReportModal = ({ balance, onClose }: Props) => {
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const branchProduct = balance?.branch_product;
	const product = branchProduct?.product;

	const barcode = product?.barcode || balance?.barcode || EMPTY_CELL;
	const productName = product?.name || balance?.name || EMPTY_CELL;
	const isWeighing =
		product?.unit_of_measurement === 'weighing' || !!balance?.is_weighing;

	const numericBalanceValue = Number(balance?.value);
	let productBalanceDisplay = EMPTY_CELL;
	if (Number.isFinite(numericBalanceValue)) {
		productBalanceDisplay = isWeighing
			? numericBalanceValue.toFixed(3)
			: numericBalanceValue.toFixed(0);
	}

	const cost =
		product?.cost_per_piece ??
		branchProduct?.cost_per_piece ??
		branchProduct?.cost ??
		null;
	const regularPrice =
		branchProduct?.price_per_piece ?? product?.price_per_piece ?? null;

	const totalCostValue =
		Number.isFinite(Number(cost)) && Number.isFinite(numericBalanceValue)
			? Number(cost) * numericBalanceValue
			: null;
	const totalSalesValue =
		Number.isFinite(Number(regularPrice)) &&
		Number.isFinite(numericBalanceValue)
			? Number(regularPrice) * numericBalanceValue
			: null;

	const productType = product?.type ? getProductType(product.type) : EMPTY_CELL;
	const productCategory =
		product?.product_category?.name || product?.product_category || EMPTY_CELL;

	const buildPdfHtml = () => {
		const dataHtml = printBranchInventoryReport(balance);
		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const renderPdf = async (): Promise<jsPDF | null> => {
		setIsLoadingPdf(true);

		const pdfTitle = `BranchInventory_${barcode}.pdf`;
		const wrappedHtml = buildPdfHtml();

		try {
			return await renderA4SinglePagePdf({
				html: wrappedHtml,
				title: pdfTitle,
			});
		} catch (error) {
			console.error('Failed to generate PDF', error);
			return null;
		} finally {
			setIsLoadingPdf(false);
		}
	};

	const downloadPdf = async () => {
		const pdf = await renderPdf();
		if (pdf) {
			await savePdf(pdf, `BranchInventory_${barcode}.pdf`);
		}
	};

	// Show the generated PDF in an in-app dialog instead of a new tab/window.
	const { showPreview, pdfPreviewModal } = usePdfPreviewModal({
		title: `${barcode} - ${productName}`,
		onDownload: downloadPdf,
	});

	const previewPdf = async () => {
		const pdf = await renderPdf();
		if (!pdf) {
			return;
		}
		showPreview(pdf.output('bloburl').toString());
	};

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={[
				<PdfButtons
					key="pdf"
					downloadPdf={downloadPdf}
					isDisabled={isLoadingPdf}
					isLoading={isLoadingPdf}
					previewPdf={previewPdf}
				/>,
			]}
			title={`${barcode} - ${productName}`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			{pdfPreviewModal}
			<Descriptions
				className="px-6 pb-6"
				column={2}
				labelStyle={{ width: 180, fontWeight: 600 }}
				size="small"
				bordered
			>
				<Descriptions.Item label="Product Name">
					{productName}
				</Descriptions.Item>
				<Descriptions.Item label="Barcode">{barcode}</Descriptions.Item>
				<Descriptions.Item label="Brand Name">
					{product?.brand_name || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Description">
					{product?.description || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Product Type">
					{productType}
				</Descriptions.Item>
				<Descriptions.Item label="Product Category">
					{productCategory}
				</Descriptions.Item>
				<Descriptions.Item label="Storage Type">
					{product?.storage_type || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Location">
					{branchProduct?.location || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Cost">
					{cost === null || cost === undefined
						? EMPTY_CELL
						: formatInPeso(cost)}
				</Descriptions.Item>
				<Descriptions.Item label="Regular Price">
					{regularPrice === null || regularPrice === undefined
						? EMPTY_CELL
						: formatInPeso(regularPrice)}
				</Descriptions.Item>
				<Descriptions.Item label="Product Balance">
					{productBalanceDisplay}
				</Descriptions.Item>
				<Descriptions.Item label="Reorder Point">
					{branchProduct?.reorder_point ?? product?.reorder_point ?? EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Max Balance">
					{branchProduct?.max_balance ?? product?.max_balance ?? EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Status">
					{getBranchProductStatus(balance?.branch_product?.product_status) ||
						EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Nearest Expiry Date">
					{balance?.nearest_expiry_date || EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Total Cost Value">
					{totalCostValue === null || totalCostValue === undefined
						? EMPTY_CELL
						: formatInPeso(totalCostValue)}
				</Descriptions.Item>
				<Descriptions.Item label="Total Sales Value">
					{totalSalesValue === null || totalSalesValue === undefined
						? EMPTY_CELL
						: formatInPeso(totalSalesValue)}
				</Descriptions.Item>
				<Descriptions.Item label="Preferred Supplier" span={2}>
					{product?.preferred_supplier?.name ||
						product?.supplier?.name ||
						EMPTY_CELL}
				</Descriptions.Item>
			</Descriptions>
		</Modal>
	);
};
