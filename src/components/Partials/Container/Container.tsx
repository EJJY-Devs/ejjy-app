/* eslint-disable react/no-unused-prop-types */
import { Layout, notification, Spin } from 'antd';
import { appTypes } from 'global';
import { useAuthLoginCountChecker } from 'hooks';
import React, { ReactNode, useEffect } from 'react';
import { useUserStore } from 'stores';
import { getAppType } from 'utils';
import { Sidebar } from '../Sidebar/Sidebar';
import './style.scss';

interface Props {
	title?: string;
	children?: ReactNode;
	loadingText?: string;
	loading?: boolean;
	description?: string;
	rightTitle?: string;
	breadcrumb?: ReactNode;
	sidebarItems?: any;
}

const SINGLE_SIGN_IN_WARNINGS_KEY = 'SINGLE_SIGN_IN_WARNINGS_KEY';

export const Container = ({
	loading,
	loadingText,
	sidebarItems,
	children,
}: Props) => {
	const { user, setUser } = useUserStore((state) => ({
		user: state.user,
		setUser: state.setUser,
	}));

	const isBackOffice = getAppType() === appTypes.BACK_OFFICE;

	useAuthLoginCountChecker({
		id: user?.id,
		params: { loginCount: user?.login_count },
		options: { enabled: !isBackOffice && !!user?.id },
	});

	useEffect(() => {
		if (!isBackOffice && user?.active_sessions_count > 1) {
			notification.warning({
				key: SINGLE_SIGN_IN_WARNINGS_KEY,
				duration: null,
				message: 'Account Notification',
				description: 'Someone else was using this account.',
			});

			setUser({
				...user,
				active_sessions_count: 1,
			});
		}
	}, [user]);

	return (
		<Layout className="Container">
			<Spin
				spinning={loading}
				tip={loadingText}
				wrapperClassName="Container_spinner"
			>
				<Sidebar items={sidebarItems} />
				{children}
			</Spin>
		</Layout>
	);
};

Container.defaultProps = {
	loading: false,
	loadingText: 'Fetching data...',
};
