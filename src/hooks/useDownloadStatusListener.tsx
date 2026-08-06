import { message } from 'antd';
import { useEffect } from 'react';

let ipcRenderer;
if (window.require) {
	const electron = window.require('electron');
	ipcRenderer = electron.ipcRenderer;
}

type DownloadStatus = 'completed' | 'failed' | 'cancelled';

interface DownloadStatusPayload {
	status: DownloadStatus;
	fileName: string;
}

// Shows a toast reflecting the *actual* outcome of file exports (PDF, TXT,
// etc.), reported by the Electron main process once the native Save As
// dialog is resolved and the file is actually written - instead of the
// renderer assuming success the moment it asks for a download (which used to
// fire before the user had even chosen where to save, or even if they
// cancelled the dialog).
//
// No-ops outside Electron (e.g. running via `npm run start:bm` in a plain
// browser) since there's no main-process download hook to report back from;
// the browser's own download UI covers that case instead.
export const useDownloadStatusListener = () => {
	useEffect(() => {
		if (!ipcRenderer) {
			return undefined;
		}

		const handleDownloadStatus = (
			_event: unknown,
			{ status, fileName }: DownloadStatusPayload,
		) => {
			if (status === 'completed') {
				message.success(`${fileName} downloaded successfully.`);
			} else if (status === 'failed') {
				message.error(`Failed to download ${fileName}.`);
			}
			// 'cancelled' (user closed the Save dialog without picking a
			// location): no toast, nothing went wrong.
		};

		ipcRenderer.on('download-status', handleDownloadStatus);

		return () => {
			ipcRenderer.removeListener('download-status', handleDownloadStatus);
		};
	}, []);
};
