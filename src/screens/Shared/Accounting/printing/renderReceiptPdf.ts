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
	// See renderA4SinglePagePdf.ts for why this renders inside an iframe
	// rather than a container appended straight into the live document: the
	// printed markup carries its own <style> block, and a <style> tag applies
	// document-wide no matter where it sits in the DOM, bleeding its generic
	// selectors (body, table, ...) into the real app's fonts.
	const iframe = document.createElement('iframe');
	iframe.style.position = 'fixed';
	iframe.style.top = '0';
	iframe.style.left = '-100000px';
	iframe.style.width = `${widthPx}px`;
	iframe.style.border = 'none';
	document.body.appendChild(iframe);

	try {
		const iframeDoc = iframe.contentDocument;
		if (!iframeDoc) {
			throw new Error(
				'Failed to create an isolated render context for the PDF',
			);
		}

		iframeDoc.open();
		iframeDoc.write(html);
		iframeDoc.close();
		iframeDoc.body.style.margin = '0';

		if (document.fonts?.ready) {
			await document.fonts.ready;
		}

		iframe.style.height = `${iframeDoc.documentElement.scrollHeight}px`;

		const canvas = await html2canvas(iframeDoc.body, {
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
		document.body.removeChild(iframe);
	}
};
