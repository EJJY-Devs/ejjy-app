import { PdfPreviewModal } from 'components/Printing/PdfPreviewModal';
import React, { useState } from 'react';

type UsePdfPreviewModalArgs = {
	title?: string;
	onDownload?: () => void;
};

// Companion to the modal preview built into `usePdf`, for the PDF flows that
// render their own jsPDF instance instead of going through that hook. Call
// `showPreview(blobUrl)` in place of `window.open(blobUrl)` and drop
// `pdfPreviewModal` into the component's JSX.
export const usePdfPreviewModal = ({
	title = 'PDF Preview',
	onDownload,
}: UsePdfPreviewModalArgs = {}) => {
	const [previewSrc, setPreviewSrc] = useState<string | null>(null);

	const closePreview = () => {
		setPreviewSrc((current) => {
			if (current) {
				URL.revokeObjectURL(current);
			}
			return null;
		});
	};

	const showPreview = (blobUrl: string) => {
		closePreview();
		setPreviewSrc(blobUrl);
	};

	const pdfPreviewModal = (
		<PdfPreviewModal
			isOpen={!!previewSrc}
			src={previewSrc}
			title={title}
			onClose={closePreview}
			onDownload={onDownload}
		/>
	);

	return { showPreview, closePreview, pdfPreviewModal };
};
