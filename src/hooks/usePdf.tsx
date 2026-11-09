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
	// Grow the page to fit the content instead of splitting it into pages,
	// so a long document comes out as one continuous page (like the printed
	// roll) that ends right after its last line. Shorter content keeps the
	// paper's normal size.
	continuousPage?: boolean;
};

const PDF_MARGIN_PX = 5;

// Height the HTML lays out at. jsPDF sanitizes away <head> (and its styles)
// before rendering, so only the body is measured, the same way.
const measureHtmlHeight = (html: string) => {
	const element = document.createElement('div');
	element.style.cssText =
		'position: absolute; top: 0; left: -10000px; visibility: hidden;';
	element.innerHTML = new DOMParser().parseFromString(
		html,
		'text/html',
	).body.innerHTML;

	document.body.appendChild(element);
	const height = Math.ceil(element.getBoundingClientRect().height);
	document.body.removeChild(element);

	return height;
};

// html2canvas finds each font's baseline with a hidden 1x1 GIF <img> on the
// live page. Tailwind's preflight (`img { display: block }`, from
// ejjy-global's styles.css) pushes that probe onto its own line, so all text
// was drawn ~10px below where it is laid out — enough to push the last line
// of a continuous page onto a new page. This keeps only that probe inline.
const HTML2CANVAS_PROBE_FIX_ID = 'html2canvas-probe-fix';

const fixHtml2CanvasFontMetrics = () => {
	if (document.getElementById(HTML2CANVAS_PROBE_FIX_ID)) {
		return;
	}

	const style = document.createElement('style');
	style.id = HTML2CANVAS_PROBE_FIX_ID;
	style.textContent =
		'img[src^="data:image/gif;base64,R0lGODlhAQABA"] { display: inline !important; }';
	document.head.appendChild(style);
};

const usePdf = ({
	title = '',
	print,
	jsPdfSettings = {},
	image = null,
	paper = 'receipt',
	previewInModal = false,
	continuousPage = false,
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

	const createPdf = (wrappedHtml: string) => {
		const settings: jsPDFOptions = { ...baseSettings, ...jsPdfSettings };
		if (continuousPage) {
			const [width, height] = settings.format as number[];
			// +1: jsPDF starts a new (empty) page for content that ends exactly
			// at the bottom margin.
			const pageHeight = Math.max(
				height,
				measureHtmlHeight(wrappedHtml) + PDF_MARGIN_PX * 2 + 1,
			);
			settings.format = [width, pageHeight];
			settings.orientation = width > pageHeight ? 'l' : 'p';
		}

		// eslint-disable-next-line new-cap
		return new jsPDF(settings);
	};

	const addImage = (pdf: jsPDF) => {
		if (image) {
			const img = new Image();
			img.src = image.src;
			pdf.addImage(img, 'png', image.x, image.y, image.w, image.h);
		}
	};

	const renderHtml = (pdf: jsPDF, wrappedHtml: string) => {
		fixHtml2CanvasFontMetrics();
		return pdf.html(wrappedHtml, { margin: PDF_MARGIN_PX });
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
			const dataHtml = await print?.();
			const wrappedHtml = wrapHtml(dataHtml);

			const pdf = createPdf(wrappedHtml);
			pdf.setProperties({ title: pdfTitle });

			addImage(pdf);

			if (document.fonts?.ready) {
				await document.fonts.ready;
			}

			await renderHtml(pdf, wrappedHtml);

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
			const dataHtml = await print?.(data?.printData);
			const wrappedHtml = wrapHtml(dataHtml);

			const pdf = createPdf(wrappedHtml);
			pdf.setProperties({ title: pdfTitle });

			addImage(pdf);

			if (document.fonts?.ready) {
				await document.fonts.ready;
			}

			await renderHtml(pdf, wrappedHtml);
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
