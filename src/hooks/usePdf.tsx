import { PdfPreviewModal } from 'components/Printing/PdfPreviewModal';
import jsPDF, { jsPDFOptions } from 'jspdf';
import React, { useState } from 'react';
import { savePdf } from 'utils/savePdf';

type Orientation = 'p' | 'l';

type PaperPreset = {
	format: number[];
	orientation: Orientation;
	wrapperWidth: number;
	wrapperPadding: number;
};

// Page sizes in px @ 96dpi, derived from true A4 (794 x 1123 px = 210 x 297 mm).
// - "whole" = a full A4 sheet
// - "half lengthwise" (1/2LW) = A4 cut along its long edge -> tall, narrow strip
//   (105 x 297 mm), used for receipt-style slips/invoices
// - "half crosswise" (1/2CW) = A4 cut along its short edge -> short, wide strip
//   (210 x 148.5 mm)
// wrapperWidth/wrapperPadding size the content block so it sits inside the page.
export const PDF_PAPER: Record<string, PaperPreset> = {
	a4Whole: {
		format: [794, 1123],
		orientation: 'p',
		wrapperWidth: 774,
		wrapperPadding: 32,
	},
	a4WholeCrosswise: {
		format: [1123, 794],
		orientation: 'l',
		wrapperWidth: 1103,
		wrapperPadding: 32,
	},
	// ejjy-global's receipt templates (via appendHtmlElement) force their
	// content to a fixed 380px column, so the content area here must stay >=
	// 380px or the receipt clips on the right. Page is ~110mm wide (close to a
	// true 105mm half-A4-lengthwise) leaving comfortable left/right margins.
	a4HalfLengthwise: {
		format: [415, 1123],
		orientation: 'p',
		wrapperWidth: 405,
		wrapperPadding: 10,
	},
	a4HalfCrosswise: {
		format: [794, 561],
		orientation: 'l',
		wrapperWidth: 774,
		wrapperPadding: 32,
	},
	// Legacy default: preserves the exact page/wrapper sizing used before paper
	// presets existed, so every consumer that doesn't pass `paper` is unchanged.
	receipt: {
		format: [460, 920],
		orientation: 'p',
		wrapperWidth: 450,
		wrapperPadding: 35,
	},
};

type UsePdfArgs = {
	title?: string;
	print?: (printData?: any) => string | Promise<string>;
	jsPdfSettings?: Partial<jsPDFOptions>;
	image?: {
		src: string;
		x: number;
		y: number;
		w: number;
		h: number;
	} | null;
	paper?: keyof typeof PDF_PAPER;
	// When true, `previewPdf` shows the PDF in an in-app dialog (returned as
	// `pdfPreviewModal`) instead of opening a new browser tab / Electron window.
	previewInModal?: boolean;
};

const usePdf = ({
	title = '',
	print,
	jsPdfSettings = {},
	image = null,
	paper = 'receipt',
	previewInModal = false,
}: UsePdfArgs) => {
	const [htmlPdf, setHtmlPdf] = useState('');
	const [isLoadingPdf, setLoadingPdf] = useState(false);
	const [previewSrc, setPreviewSrc] = useState<string | null>(null);

	const closePreview = () => {
		setPreviewSrc((current) => {
			if (current) {
				URL.revokeObjectURL(current);
			}
			return null;
		});
	};

	const preset = PDF_PAPER[paper] || PDF_PAPER.receipt;

	// Preset provides the base page geometry; jsPdfSettings still wins so
	// individual consumers can fine-tune when they need to.
	const baseSettings: jsPDFOptions = {
		orientation: preset.orientation,
		unit: 'px',
		format: preset.format,
	};

	const wrapHtml = (dataHtml: string | undefined) =>
		`<div style="width: ${preset.wrapperWidth}px; padding: ${preset.wrapperPadding}px; box-sizing: border-box;">${dataHtml}</div>`;

	const addImage = (pdf: jsPDF) => {
		if (image) {
			const img = new Image();
			img.src = image.src;
			pdf.addImage(img, 'png', image.x, image.y, image.w, image.h);
		}
	};

	const previewPdf = async (data = null) => {
		setLoadingPdf(true);

		// In tab mode, open the tab synchronously while we are still inside the
		// click's user-gesture window. Pop-up blockers reject window.open() once
		// it runs after an `await`, so we grab the tab now and only navigate it
		// to the blob URL once the PDF has finished rendering. In modal mode we
		// don't open a window at all.
		const previewWindow = previewInModal ? null : window.open('', '_blank');

		try {
			const pdfTitle = data?.title || title;
			// eslint-disable-next-line new-cap
			const pdf = new jsPDF({ ...baseSettings, ...jsPdfSettings });
			pdf.setProperties({ title: pdfTitle });

			const dataHtml = await print?.();
			const wrappedHtml = wrapHtml(dataHtml);

			addImage(pdf);

			if (document.fonts?.ready) {
				await document.fonts.ready;
			}

			await pdf.html(wrappedHtml, { margin: 5 });

			const blobUrl = pdf.output('bloburl').toString();
			if (previewInModal) {
				closePreview();
				setPreviewSrc(blobUrl);
			} else if (previewWindow) {
				previewWindow.location.href = blobUrl;
			} else {
				// Blocker still refused the pre-opened tab; try a direct open as
				// a last resort so the preview isn't lost silently.
				window.open(blobUrl);
			}
		} catch (error) {
			console.error('Failed to generate PDF preview', error);
			previewWindow?.close();
		} finally {
			setLoadingPdf(false);
			setHtmlPdf('');
		}
	};

	const downloadPdf = async (data = null) => {
		setLoadingPdf(true);

		try {
			const pdfTitle = data?.title || title;
			// eslint-disable-next-line new-cap
			const pdf = new jsPDF({ ...baseSettings, ...jsPdfSettings });
			pdf.setProperties({ title: pdfTitle });

			const dataHtml = await print?.(data?.printData);
			const wrappedHtml = wrapHtml(dataHtml);

			addImage(pdf);

			if (document.fonts?.ready) {
				await document.fonts.ready;
			}

			await pdf.html(wrappedHtml, { margin: 5 });
			await savePdf(pdf, pdfTitle);
		} catch (error) {
			console.error('Failed to generate PDF download', error);
		} finally {
			setLoadingPdf(false);
			setHtmlPdf('');
		}
	};

	// Rendered only when modal mode is enabled; consumers drop this node into
	// their JSX and it stays inert (nothing shown) until `previewPdf` runs.
	const pdfPreviewModal = previewInModal ? (
		<PdfPreviewModal
			isOpen={!!previewSrc}
			src={previewSrc}
			title={title}
			onClose={closePreview}
			onDownload={() => downloadPdf()}
		/>
	) : null;

	return {
		htmlPdf,
		isLoadingPdf,
		previewPdf,
		downloadPdf,
		pdfPreviewModal,
	};
};

export default usePdf;
