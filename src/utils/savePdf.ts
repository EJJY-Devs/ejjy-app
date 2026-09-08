import type jsPDF from 'jspdf';

const ensurePdfExtension = (fileName: string) =>
	fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;

// The desktop build (nodeIntegration: true) exposes `window.require`. In
// Electron, `<a download>` clicks are intercepted in the main process
// (public/electron.js `will-download`), which already shows a native "Save
// As" dialog letting the user pick any folder (including Desktop) and
// reports the real outcome back over IPC (see useDownloadStatusListener).
// That path is reliable; Electron's implementation of the browser File
// System Access API (`showSaveFilePicker`, used below) is not — it can
// resolve without actually finishing the write, leaving a broken/empty file
// at the chosen location ("file not found" when opened), while the code
// still falls through to the classic download, saving a second copy to
// Downloads. So skip the picker entirely in Electron and let the native
// dialog handle it, same as before this file existed.
const isElectron = typeof (window as any).require === 'function';

// Downloads a Blob, letting the user pick the destination folder when the
// browser supports the File System Access API. Falls back to a normal
// (default-folder) download otherwise, or when the user cancels the picker
// we simply stop.
const saveBlobWithPicker = async (blob: Blob, fileName: string) => {
	const showSaveFilePicker = (window as any).showSaveFilePicker as
		| ((options?: any) => Promise<any>)
		| undefined;

	if (!isElectron && typeof showSaveFilePicker === 'function') {
		try {
			const handle = await showSaveFilePicker({
				suggestedName: fileName,
				types: [
					{
						description: 'PDF file',
						accept: { 'application/pdf': ['.pdf'] },
					},
				],
			});
			const writable = await handle.createWritable();
			await writable.write(blob);
			await writable.close();
			return;
		} catch (error) {
			// The user dismissed the dialog — nothing to download, so stop here.
			if ((error as DOMException)?.name === 'AbortError') {
				return;
			}
			// Any other failure: fall through to the classic download below.
			console.error(
				'Save dialog failed, falling back to direct download',
				error,
			);
		}
	}

	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
};

// Save a generated jsPDF document, prompting the user for the destination
// folder when possible. Use this instead of `pdf.save(fileName)`.
export const savePdf = async (pdf: jsPDF, fileName: string) => {
	const normalized = ensurePdfExtension(fileName);
	const blob = pdf.output('blob');
	await saveBlobWithPicker(blob, normalized);
};
