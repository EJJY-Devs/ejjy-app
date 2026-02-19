import { Descriptions, Modal } from 'antd';
import { PdfButtons } from 'components/Printing';
import { EMPTY_CELL } from 'global';
import jsPDF from 'jspdf';
import React, { useState } from 'react';
import { formatInPeso, getProductType } from 'utils';

import robotoRegularTtf from 'assets/fonts/Roboto-Regular.ttf';

import { printBranchInventoryReport } from './printBranchInventoryReport';

const TIMEOUT_MS = 2000;
const PDF_WRAPPER_WIDTH_PX = 1120;
const PDF_WRAPPER_PADDING_PX = 24;
const PDF_PAGE_WIDTH_PX = 1225;
const PDF_PAGE_HEIGHT_PX = 420;
const PDF_RENDER_X_PX = Math.max(
	0,
	Math.floor((PDF_PAGE_WIDTH_PX - PDF_WRAPPER_WIDTH_PX) / 2),
);

let robotoRegularBase64: string | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const chunkSize = 0x8000;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const end = Math.min(i + chunkSize, bytes.length);
		let chunk = '';
		for (let j = i; j < end; j += 1) {
			chunk += String.fromCharCode(bytes[j]);
		}
		binary += chunk;
	}
	return window.btoa(binary);
};

const ensureRobotoFont = async (pdf: jsPDF) => {
	try {
		if (!robotoRegularBase64) {
			const response = await fetch(robotoRegularTtf);
			const buffer = await response.arrayBuffer();
			robotoRegularBase64 = arrayBufferToBase64(buffer);
		}

		if (robotoRegularBase64) {
			pdf.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
			pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
			pdf.setFont('Roboto', 'normal');
		}
	} catch (error) {
		// If font loading fails, fall back to default jsPDF font.
	}
};

type Props = {
	balance: any;
	onClose: () => void;
};

export const ViewBranchInventoryReportModal = ({ balance, onClose }: Props) => {
	const [htmlPdf, setHtmlPdf] = useState('');
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

	const previewPdf = () => {
		setIsLoadingPdf(true);

		const pdfTitle = `BranchInventory_${barcode}.pdf`;
		const wrappedHtml = buildPdfHtml();
		setHtmlPdf(wrappedHtml);

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({
			orientation: 'l',
			unit: 'px',
			format: [PDF_PAGE_WIDTH_PX, PDF_PAGE_HEIGHT_PX],
			putOnlyUsedFonts: true,
		});
		pdf.setProperties({ title: pdfTitle });

		setTimeout(() => {
			(async () => {
				await ensureRobotoFont(pdf);

				pdf.html(wrappedHtml, {
					x: PDF_RENDER_X_PX,
					y: 10,
					margin: 0,
					callback: (instance) => {
						window.open(instance.output('bloburl').toString());
						setIsLoadingPdf(false);
						setHtmlPdf('');
					},
				});
			})().catch(() => {
				setIsLoadingPdf(false);
				setHtmlPdf('');
			});
		}, TIMEOUT_MS);
	};

	const downloadPdf = () => {
		setIsLoadingPdf(true);

		const pdfTitle = `BranchInventory_${barcode}.pdf`;
		const wrappedHtml = buildPdfHtml();
		setHtmlPdf(wrappedHtml);

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({
			orientation: 'l',
			unit: 'px',
			format: [PDF_PAGE_WIDTH_PX, PDF_PAGE_HEIGHT_PX],
			putOnlyUsedFonts: true,
		});
		pdf.setProperties({ title: pdfTitle });

		setTimeout(() => {
			(async () => {
				await ensureRobotoFont(pdf);

				pdf.html(wrappedHtml, {
					x: PDF_RENDER_X_PX,
					y: 10,
					margin: 0,
					callback: (instance) => {
						instance.save(pdfTitle);
						setIsLoadingPdf(false);
						setHtmlPdf('');
					},
				});
			})().catch(() => {
				setIsLoadingPdf(false);
				setHtmlPdf('');
			});
		}, TIMEOUT_MS);
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
				<Descriptions.Item label="Status">
					{product?.status || EMPTY_CELL}
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

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{ display: 'none' }}
			/>
		</Modal>
	);
};
