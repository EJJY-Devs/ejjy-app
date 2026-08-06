import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const RECEIPT_MARGIN_PX = 24;
// Supersample the capture so scaled-down text/lines stay crisp.
const RENDER_SCALE = 2;

/**
 * Rasterizes the given HTML and sizes a single PDF page to exactly fit it,
 * for narrow receipt-style printouts (unlike renderA4SinglePagePdf, which
 * fits content into a fixed A4 page).
 */
export const renderReceiptPdf = async ({
	html,
	title,
	widthPx,
}: {
	html: string;
	title: string;
	widthPx: number;
}): Promise<jsPDF> => {
	const container = document.createElement('div');
	container.style.position = 'fixed';
	container.style.top = '0';
	container.style.left = '-100000px';
	container.style.width = `${widthPx}px`;
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

		const pageWidth = contentWidthPx + RECEIPT_MARGIN_PX * 2;
		const pageHeight = contentHeightPx + RECEIPT_MARGIN_PX * 2;

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({
			orientation: 'p',
			unit: 'px',
			format: [pageWidth, pageHeight],
			putOnlyUsedFonts: true,
		});
		pdf.setProperties({ title });
		pdf.addImage(
			canvas,
			'PNG',
			RECEIPT_MARGIN_PX,
			RECEIPT_MARGIN_PX,
			contentWidthPx,
			contentHeightPx,
		);

		return pdf;
	} finally {
		document.body.removeChild(container);
	}
};
