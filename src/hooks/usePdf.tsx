import jsPDF, { jsPDFOptions } from 'jspdf';
import { useState } from 'react';

const JSPDF_SETTINGS: jsPDFOptions = {
	orientation: 'p',
	unit: 'px',
	format: [460, 920],
	// hotfixes: ['px_scaling'],
};

const WRAPPER_WIDTH = 450;
const WRAPPER_PADDING = 35;

const usePdf = ({ title = '', print, jsPdfSettings = {}, image = null }) => {
	const [htmlPdf, setHtmlPdf] = useState('');
	const [isLoadingPdf, setLoadingPdf] = useState(false);

	const previewPdf = async (data = null) => {
		setLoadingPdf(true);

		try {
			const pdfTitle = data?.title || title;
			// eslint-disable-next-line new-cap
			const pdf = new jsPDF({ ...JSPDF_SETTINGS, ...jsPdfSettings });
			pdf.setProperties({ title: pdfTitle });

			const dataHtml = print?.();

			const wrappedHtml = `<div style="width: ${WRAPPER_WIDTH}px; padding: ${WRAPPER_PADDING}px; box-sizing: border-box;">${dataHtml}</div>`;

			if (image) {
				const img = new Image();
				img.src = image.src;
				pdf.addImage(img, 'png', image.x, image.y, image.w, image.h);
			}

			if (document.fonts?.ready) {
				await document.fonts.ready;
			}

			await pdf.html(wrappedHtml, { margin: 5 });
			window.open(pdf.output('bloburl').toString());
		} catch (error) {
			console.error('Failed to generate PDF preview', error);
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
			const pdf = new jsPDF({ ...JSPDF_SETTINGS, ...jsPdfSettings });
			pdf.setProperties({ title: pdfTitle });

			const dataHtml = print?.(data?.printData);

			const wrappedHtml = `<div style="width: ${WRAPPER_WIDTH}px; padding: ${WRAPPER_PADDING}px; box-sizing: border-box;">${dataHtml}</div>`;

			if (image) {
				const img = new Image();
				img.src = image.src;
				pdf.addImage(img, 'png', image.x, image.y, image.w, image.h);
			}

			if (document.fonts?.ready) {
				await document.fonts.ready;
			}

			await pdf.html(wrappedHtml, { margin: 5 });
			pdf.save(pdfTitle);
		} catch (error) {
			console.error('Failed to generate PDF download', error);
		} finally {
			setLoadingPdf(false);
			setHtmlPdf('');
		}
	};

	return {
		htmlPdf,
		isLoadingPdf,
		previewPdf,
		downloadPdf,
	};
};

export default usePdf;
