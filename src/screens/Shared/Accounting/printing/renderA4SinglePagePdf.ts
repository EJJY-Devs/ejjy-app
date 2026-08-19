import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// True A4 page size at 96dpi (210mm x 297mm).
export const PDF_PAGE_WIDTH_PX = 794;
export const PDF_PAGE_HEIGHT_PX = 1123;
export const PDF_WRAPPER_WIDTH_PX = 714;
export const PDF_WRAPPER_PADDING_PX = 32;

// True A4 page size, crosswise/landscape (297mm x 210mm), for reports whose
// content is too wide for a portrait page (e.g. many-column tables).
export const PDF_PAGE_WIDTH_CW_PX = PDF_PAGE_HEIGHT_PX;
export const PDF_PAGE_HEIGHT_CW_PX = PDF_PAGE_WIDTH_PX;
export const PDF_WRAPPER_WIDTH_CW_PX = PDF_PAGE_WIDTH_CW_PX - 80;

const PDF_MARGIN_PX = 20;
// Supersample the capture so scaled-down text/lines stay crisp.
const RENDER_SCALE = 2;

type Orientation = 'p' | 'l';

const renderA4Pdf = async ({
	html,
	title,
	orientation,
	pageWidthPx,
	pageHeightPx,
	wrapperWidthPx,
}: {
	html: string;
	title: string;
	orientation: Orientation;
	pageWidthPx: number;
	pageHeightPx: number;
	wrapperWidthPx: number;
}): Promise<jsPDF> => {
	const container = document.createElement('div');
	container.style.position = 'fixed';
	container.style.top = '0';
	container.style.left = '-100000px';
	container.style.width = `${wrapperWidthPx}px`;
	container.style.background = '#ffffff';
	container.innerHTML = html;
	document.body.appendChild(container);

	try {
		if (document.fonts?.ready) {
			await document.fonts.ready;
		}

		const canvas = await html2canvas(container, {
			scale: RENDER_SCALE,
			backgroundColor: '#ffffff',
			useCORS: true,
		});

		const contentWidthPx = canvas.width / RENDER_SCALE;
		const contentHeightPx = canvas.height / RENDER_SCALE;

		const maxWidth = pageWidthPx - PDF_MARGIN_PX * 2;
		const maxHeight = pageHeightPx - PDF_MARGIN_PX * 2;

		const fitScale = Math.min(
			maxWidth / contentWidthPx,
			maxHeight / contentHeightPx,
			1,
		);

		const renderWidth = contentWidthPx * fitScale;
		const renderHeight = contentHeightPx * fitScale;
		const x = Math.max(0, (pageWidthPx - renderWidth) / 2);
		const y = PDF_MARGIN_PX;

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({
			orientation,
			unit: 'px',
			format: [pageWidthPx, pageHeightPx],
			putOnlyUsedFonts: true,
		});
		pdf.setProperties({ title });
		pdf.addImage(canvas, 'PNG', x, y, renderWidth, renderHeight);

		return pdf;
	} finally {
		document.body.removeChild(container);
	}
};

/**
 * Rasterizes the given HTML and places it on a single A4 page, shrinking
 * (never enlarging) it as needed so it always fits within one page instead
 * of being cut off or split across pages.
 */
export const renderA4SinglePagePdf = ({
	html,
	title,
}: {
	html: string;
	title: string;
}): Promise<jsPDF> =>
	renderA4Pdf({
		html,
		title,
		orientation: 'p',
		pageWidthPx: PDF_PAGE_WIDTH_PX,
		pageHeightPx: PDF_PAGE_HEIGHT_PX,
		wrapperWidthPx: PDF_WRAPPER_WIDTH_PX,
	});

/**
 * Same as renderA4SinglePagePdf but on a crosswise (landscape) A4 page, for
 * reports whose content is too wide to fit a portrait page (e.g. wide,
 * many-column tables).
 */
export const renderA4LandscapePdf = ({
	html,
	title,
}: {
	html: string;
	title: string;
}): Promise<jsPDF> =>
	renderA4Pdf({
		html,
		title,
		orientation: 'l',
		pageWidthPx: PDF_PAGE_WIDTH_CW_PX,
		pageHeightPx: PDF_PAGE_HEIGHT_CW_PX,
		wrapperWidthPx: PDF_WRAPPER_WIDTH_CW_PX,
	});
