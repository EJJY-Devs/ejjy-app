import { PrinterOutlined, WifiOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import cn from 'classnames';
import { configurePrinter, printerStatuses } from 'ejjy-global';
import { useConnectivity } from 'hooks';
import qz from 'qz-tray';
import React, { useEffect } from 'react';
import { useUserInterfaceStore, useUserStore } from 'stores';
import {
	getAppReceiptPrinterFontFamily,
	getAppReceiptPrinterFontSize,
	getAppReceiptPrinterName,
	isUserFromBranch,
} from 'utils';
import './style.scss';

const Component = () => {
	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { isConnected } = useConnectivity();
	const { userInterface, setUserInterface } = useUserInterfaceStore();

	// METHODS
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
			{user && isUserFromBranch(user.user_type) && (
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
		</div>
	);
};

export const AppIcons = React.memo(Component);
