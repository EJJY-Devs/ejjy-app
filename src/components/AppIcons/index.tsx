import {
	PrinterOutlined,
	SettingOutlined,
	WifiOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import cn from 'classnames';
import {
	configurePrinter,
	getKeyDownCombination,
	printerStatuses,
} from 'ejjy-global';
import { appTypes } from 'global';
import { useConnectivity } from 'hooks';
import qz from 'qz-tray';
import React, { useEffect } from 'react';
import { useUserInterfaceStore, useUserStore } from 'stores';
import {
	getAppReceiptPrinterFontFamily,
	getAppReceiptPrinterFontSize,
	getAppType,
	getAppReceiptPrinterName,
} from 'utils';
import { AppSettingsModal } from '../modals/AppSettingsModal';
import './style.scss';

const Component = () => {
	// STATE
	const [isSettingsVisible, setIsSettingsVisible] = React.useState(false);
	const [showAppSettingsModal, setShowAppSettingsModal] = React.useState(false);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { isConnected } = useConnectivity();
	const { userInterface, setUserInterface } = useUserInterfaceStore();

	// METHODS
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const key = getKeyDownCombination(event);
			if (['meta+s', 'ctrl+s'].includes(key)) {
				event.preventDefault();
				setIsSettingsVisible((prev) => !prev);
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	useEffect(() => {
		window.addEventListener('focus', startPrinterConfiguration);
		startPrinterConfiguration();

		return () => {
			window.removeEventListener('focus', startPrinterConfiguration);
			qz.printers.stopListening();
		};
	}, []);

	const startPrinterConfiguration = () => {
		const printerName = getAppReceiptPrinterName();

		if (!printerName) {
			setUserInterface({
				...userInterface,
				isPrinterConnected: false,
			});
			return;
		}

		handlePrinterClick();

		// setup a callback
		setTimeout(() => {
			qz.printers.setPrinterCallbacks((event: any) => {
				const { statusText } = event;

				console.log(event);

				if (
					statusText === printerStatuses.NOT_AVAILABLE ||
					statusText === printerStatuses.OFFLINE
				) {
					setUserInterface({
						...userInterface,
						isPrinterConnected: false,
					});
				} else if (statusText === printerStatuses.OK) {
					setUserInterface({
						...userInterface,
						isPrinterConnected: true,
					});
				} else {
					setUserInterface({
						...userInterface,
						isPrinterConnected: null,
					});
				}
			});

			qz.printers
				.find(printerName)
				.then((printer: any) => {
					qz.printers.startListening(printer).then(() => {
						qz.printers.getStatus().then((status: any) => {
							if (status === printerStatuses.OK) {
								setUserInterface({
									...userInterface,
									isPrinterConnected: true,
								});
							}
						});
					});
				})
				.catch((e: Error) => {
					setUserInterface({
						...userInterface,
						isPrinterConnected: false,
					});
					console.error('Printer Listener', e);
				});
		}, 5000);
	};

	const handleConnectionClick = () => {
		window.location.reload();
	};

	const handlePrinterClick = () => {
		configurePrinter(
			getAppReceiptPrinterName(),
			getAppReceiptPrinterFontSize(),
			getAppReceiptPrinterFontFamily(),
		);
	};

	return (
		<div className="AppIcons">
			{user && getAppType() === appTypes.BACK_OFFICE && (
				<Tooltip title="Connectivity Status">
					<WifiOutlined
						className={cn('AppIcons_icon', {
							'AppIcons_icon--warning': isConnected === null,
							'AppIcons_icon--success': isConnected === true,
							'AppIcons_icon--error': isConnected === false,
						})}
						onClick={handleConnectionClick}
					/>
				</Tooltip>
			)}

			<Tooltip title={getAppReceiptPrinterName()}>
				<PrinterOutlined
					className={cn('AppIcons_icon', {
						'AppIcons_icon--warning': userInterface.isPrinterConnected === null,
						'AppIcons_icon--success': userInterface.isPrinterConnected === true,
						'AppIcons_icon--error': userInterface.isPrinterConnected === false,
					})}
					onClick={handlePrinterClick}
				/>
			</Tooltip>

			{isSettingsVisible && (
				<Tooltip title="App Settings">
					<SettingOutlined
						className="AppIcons_icon AppIcons_icon--info"
						onClick={() => setShowAppSettingsModal(true)}
					/>
				</Tooltip>
			)}

			{showAppSettingsModal && (
				<AppSettingsModal
					onClose={() => setShowAppSettingsModal(false)}
					onSuccess={() => {
						window.location.reload();
					}}
				/>
			)}
		</div>
	);
};

export const AppIcons = React.memo(Component);
