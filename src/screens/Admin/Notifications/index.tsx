import { Content, NotificationItem } from 'components';
import { useBranches } from 'hooks';
import React, { useEffect, useRef, useState } from 'react';
import { formatDateTime } from 'utils';
import { useFailedTransfers } from '../hooks/useFailedTransfers';
import './style.scss';

export const Notifications = () => {
	// STATES
	const [notifications, setNotifications] = useState([]);

	// REFS
	const intervalRef = useRef(null);

	// CUSTOM HOOKS
	const { failedTransfers, getFailedTansferCount } = useFailedTransfers();
	const {
		data: { branches },
	} = useBranches();

	// EFFECTS
	useEffect(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		fetchFailedTransferNotifications();

		intervalRef.current = setInterval(() => {
			fetchFailedTransferNotifications();
		}, 5000);

		return () => {
			clearInterval(intervalRef.current);
		};
	}, [branches]);

	// Effect: Format noificaions to be rendered in Table
	useEffect(() => {
		const failedTransferNotifications = Object.keys(failedTransfers)
			.filter((key) => failedTransfers?.[key]?.count > 0)
			.map((key) => ({
				message: (
					<b>
						{`${failedTransfers?.[key]?.branchName} has ${failedTransfers?.[key]?.count} failed transfers.`}
					</b>
				),
				datetime: formatDateTime(failedTransfers?.[key]?.datetime),
			}));

		setNotifications(failedTransferNotifications);
	}, [failedTransfers]);

	const fetchFailedTransferNotifications = () => {
		branches.forEach(({ id, name }) => {
			getFailedTansferCount({ branchId: id, branchName: name });
		});
	};

	return (
		<Content className="Notifications" title="Notifications">
			{notifications.map(({ message, datetime }) => (
				<NotificationItem key="message" datetime={datetime} message={message} />
			))}
		</Content>
	);
};
