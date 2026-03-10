import { message, Modal } from 'antd';

import {
	APP_APP_TYPE_KEY,
	APP_HEAD_OFFICE_TYPE,
	APP_LOCAL_API_URL_KEY,
	APP_ONLINE_API_URL_KEY,
	APP_ONLINE_BRANCH_ID_KEY,
	APP_RECEIPT_PRINTER_FONT_FAMILY,
	APP_RECEIPT_PRINTER_FONT_SIZE,
	APP_RECEIPT_PRINTER_NAME,
	APP_TAG_PRINTER_FONT_FAMILY,
	APP_TAG_PRINTER_FONT_SIZE,
	APP_TAG_PRINTER_PAPER_HEIGHT,
	APP_TAG_PRINTER_PAPER_WIDTH,
} from 'global';
import { useAppType } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import {
	getAppReceiptPrinterFontFamily,
	getAppReceiptPrinterFontSize,
	getAppReceiptPrinterName,
	getAppTagPrinterFontFamily,
	getAppTagPrinterFontSize,
	getAppTagPrinterPaperHeight,
	getAppTagPrinterPaperWidth,
	getAppType,
	getHeadOfficeType,
	getLocalApiUrl,
	getOnlineApiUrl,
	getOnlineBranchId,
} from 'utils';
import { APP_PRINTING_TYPE, getAppReceiptPrintingType } from 'ejjy-global';
import { AppSettingsForm } from './AppSettingsForm';

interface Props {
	onSuccess: any;
	onClose: any;
}

let ipcRenderer;
if (window.require) {
	const electron = window.require('electron');
	ipcRenderer = electron.ipcRenderer;
}

export const AppSettingsModal = ({ onSuccess, onClose }: Props) => {
	// CUSTOM HOOKS
	const { setAppType, setHeadOfficeType } = useAppType();
	const [localApiUrl] = useState(getLocalApiUrl() || '');
	const [onlineApiUrl, setOnlineApiUrl] = useState(getOnlineApiUrl() || '');

	useEffect(() => {
		let isMounted = true;

		const fetchBackendConfig = async () => {
			if (!ipcRenderer) return;

			try {
				const config = await ipcRenderer.invoke(
					'getBackendConfig',
					getAppType(),
				);
				if (!isMounted || !config) return;

				const backendOnlineApiUrl = config.ONLINE_API_URL || '';

				if (backendOnlineApiUrl) {
					setOnlineApiUrl(backendOnlineApiUrl);
					localStorage.setItem(APP_ONLINE_API_URL_KEY, backendOnlineApiUrl);
				}
			} catch (e) {
				// no-op: fallback remains localStorage values
			}
		};

		fetchBackendConfig();

		return () => {
			isMounted = false;
		};
	}, []);

	// METHODS
	const handleSubmit = async (formData) => {
		const currentAppType = getAppType();

		// Only trigger relaunch if app type actually changed
		const shouldRelaunch = formData.appType !== currentAppType;

		localStorage.setItem(APP_APP_TYPE_KEY, formData.appType);
		localStorage.setItem(
			APP_HEAD_OFFICE_TYPE,
			_.toString(formData.headOfficeType),
		);
		localStorage.setItem(APP_ONLINE_BRANCH_ID_KEY, formData.branchId);
		localStorage.setItem(APP_LOCAL_API_URL_KEY, formData.localApiUrl);
		localStorage.setItem(APP_ONLINE_API_URL_KEY, formData.onlineApiUrl);
		localStorage.setItem(
			APP_RECEIPT_PRINTER_FONT_FAMILY,
			formData.printerFontFamily,
		);
		localStorage.setItem(
			APP_RECEIPT_PRINTER_FONT_SIZE,
			formData.printerFontSize,
		);
		localStorage.setItem(APP_RECEIPT_PRINTER_NAME, formData.printerName);
		localStorage.setItem(APP_PRINTING_TYPE, formData.printingType);

		localStorage.setItem(
			APP_TAG_PRINTER_FONT_FAMILY,
			formData.tagPrinterFontFamily,
		);
		localStorage.setItem(
			APP_TAG_PRINTER_FONT_SIZE,
			formData.tagPrinterFontSize,
		);
		localStorage.setItem(
			APP_TAG_PRINTER_PAPER_HEIGHT,
			formData.tagPrinterPaperHeight,
		);
		localStorage.setItem(
			APP_TAG_PRINTER_PAPER_WIDTH,
			formData.tagPrinterPaperWidth,
		);

		if (ipcRenderer) {
			try {
				await ipcRenderer.invoke('setBackendConfig', {
					appType: formData.appType,
					config: {
						ONLINE_API_URL: formData.onlineApiUrl,
					},
				});
			} catch (e) {
				message.error('Failed to save backend settings');
				return;
			}
		}

		setHeadOfficeType(formData.headOfficeType);
		if (shouldRelaunch) {
			setAppType(formData.appType, true);
		} else {
			setAppType(formData.appType, false);
		}

		message.success('App settings were updated successfully');
		onSuccess?.();
		onClose();
	};

	return (
		<Modal
			className="Modal"
			footer={null}
			title="App Settings"
			centered
			closable
			open
			onCancel={onClose}
		>
			<AppSettingsForm
				appType={getAppType()}
				branchId={getOnlineBranchId()}
				headOfficeType={getHeadOfficeType()}
				localApiUrl={localApiUrl}
				onlineApiUrl={onlineApiUrl}
				printerFontFamily={getAppReceiptPrinterFontFamily()}
				printerFontSize={getAppReceiptPrinterFontSize()}
				printerName={getAppReceiptPrinterName()}
				printingType={getAppReceiptPrintingType()}
				tagPrinterFontFamily={getAppTagPrinterFontFamily()}
				tagPrinterFontSize={getAppTagPrinterFontSize()}
				tagPrinterPaperHeight={getAppTagPrinterPaperHeight()}
				tagPrinterPaperWidth={getAppTagPrinterPaperWidth()}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};
