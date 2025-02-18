import jsPDF, { jsPDFOptions } from 'jspdf';
import { useState } from 'react';

const TIMEOUT_MS = 2000;

const JSPDF_SETTINGS: jsPDFOptions = {
	orientation: 'p',
	unit: 'px',
	format: [400, 700],
	// hotfixes: ['px_scaling'],
};

const usePdf = ({ title = '', print, jsPdfSettings = {}, image = null }) => {
	const [htmlPdf, setHtmlPdf] = useState('');
	const [isLoadingPdf, setLoadingPdf] = useState(false);

	const previewPdf = (data = null) => {
		setLoadingPdf(true);

		const pdfTitle = data?.title || title;
		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({ ...JSPDF_SETTINGS, ...jsPdfSettings });
		pdf.setProperties({ title: pdfTitle });

		const dataHtml = print?.(data?.printData);

		const wrappedHtml = `<div style="width: 380px; padding: 24px;">${dataHtml}</div>`;

		if (image) {
			const img = new Image();
			img.src = image.src;
			pdf.addImage(img, 'png', image.x, image.y, image.w, image.h);
		}

		setTimeout(() => {
			pdf.html(wrappedHtml, {
				margin: 10,
				callback: (instance) => {
					window.open(instance.output('bloburl').toString());
					setLoadingPdf(false);
					setHtmlPdf('');
				},
			});
		}, TIMEOUT_MS);
	};

	const downloadPdf = (data = null) => {
		setLoadingPdf(true);

		const pdfTitle = data?.title || title;
		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({ ...JSPDF_SETTINGS, ...jsPdfSettings });
		pdf.setProperties({ title: pdfTitle });

		const dataHtml = print?.(data?.printData);

		const wrappedHtml = `<div style="width: 380px; padding: 24px;">${dataHtml}</div>`;

		if (image) {
			const img = new Image();
			img.src = image.src;
			pdf.addImage(img, 'png', image.x, image.y, image.w, image.h);
		}

		setTimeout(() => {
			pdf.html(wrappedHtml, {
				margin: 10,
				callback: (instance) => {
					instance.save(pdfTitle);
					setLoadingPdf(false);
					setHtmlPdf('');
				},
			});
		}, TIMEOUT_MS);
	};

	return {
		htmlPdf,
		isLoadingPdf,
		previewPdf,
		downloadPdf,
	};
};

export default usePdf;
