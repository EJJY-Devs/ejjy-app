import { useEffect } from 'react';

let ipcRenderer;
if (window.require) {
	const electron = window.require('electron');
	ipcRenderer = electron.ipcRenderer;
}

const SET_METHOD_NAME = 'setStoreValue';
const GET_METHOD_NAME = 'getStoreValue';
const APP_TYPE_KEY = 'appType';
const HEAD_OFFICE_TYPE_KEY = 'headOfficeType';
const START_NGROK_KEY = 'startNgrok';

const useAppType = () => {
	useEffect(() => {
		if (ipcRenderer) {
			const fetchData = async () => {
				const data = await Promise.all([
					ipcRenderer.invoke(GET_METHOD_NAME, APP_TYPE_KEY),
					ipcRenderer.invoke(GET_METHOD_NAME, HEAD_OFFICE_TYPE_KEY),
				]);

				console.log('data', data);
			};

			fetchData();
		}
	}, [ipcRenderer]);

	const setNewAppType = (newAppType, relaunch = false) => {
		if (ipcRenderer) {
			ipcRenderer.invoke(SET_METHOD_NAME, {
				key: APP_TYPE_KEY,
				value: newAppType,
				relaunch,
			});
		}
	};

	const setNewHeadOfficeType = (newHeadOfficeType, relaunch = false) => {
		if (ipcRenderer) {
			ipcRenderer.invoke(SET_METHOD_NAME, {
				key: HEAD_OFFICE_TYPE_KEY,
				value: newHeadOfficeType,
				relaunch,
			});
		}
	};

	const setNewStartNgrok = (value: boolean) => {
		if (ipcRenderer) {
			ipcRenderer.invoke(SET_METHOD_NAME, {
				key: START_NGROK_KEY,
				value,
			});
		}
	};

	return {
		setAppType: setNewAppType,
		setHeadOfficeType: setNewHeadOfficeType,
		setStartNgrok: setNewStartNgrok,
	};
};

export default useAppType;
