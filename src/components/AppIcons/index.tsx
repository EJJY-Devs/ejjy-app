import { PrinterOutlined, WifiOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import cn from 'classnames';
import { configurePrinter } from 'ejjy-global';
import { printerStatuses } from 'global';
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

		if (printerName) {
			handlePrinterClick();

			// setup a callback
			setTimeout(() => {
				qz.printers.setPrinterCallbacks((event) => {
					const { statusText } = event;
					console.log('app icon', event);

					if (statusText === printerStatuses.NOT_AVAILABLE) {
						setUserInterface({ isPrinterConnected: false });
					} else if (statusText === printerStatuses.OK) {
						setUserInterface({ isPrinterConnected: true });
					}
				});

				qz.printers
					.find(printerName)
					.then((printer) => {
						qz.printers.startListening(printer).then(() => {
							setUserInterface({ isPrinterConnected: true });
							return qz.printers.getStatus();
						});
					})
					.catch((e) => {
						setUserInterface({ isPrinterConnected: false });
						console.error('Printer Listener', e);
					});
			}, 5000);
		}
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
