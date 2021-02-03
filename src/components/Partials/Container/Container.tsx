/* eslint-disable react-hooks/exhaustive-deps */
import { Layout, Spin, Tooltip } from 'antd';
import cn from 'classnames';
import React, { ReactNode, useCallback, useEffect } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useSelector } from 'react-redux';
import { selectors as uiSelectors } from '../../../ducks/ui';
import { useAuth } from '../../../hooks/useAuth';
import { InfoIcon } from '../../Icons/Icons';
import { Sidebar } from '../Sidebar/Sidebar';
import './style.scss';
import { useNetwork } from '../../../hooks/useNetwork';
import { useLocation } from 'react-router';
import { ONLINE_ROUTES } from '../../../global/constants';

const { Header, Content } = Layout;

interface Props {
	title: string;
	description?: string;
	rightTitle?: string;
	breadcrumb?: ReactNode;
	children?: ReactNode;
	loadingText?: string;
	loading?: boolean;
}

export const Container = ({
	title,
	description,
	rightTitle,
	breadcrumb,
	loading,
	loadingText,
	children,
}: Props) => {
	const isSidebarCollapsed = useSelector(uiSelectors.selectIsSidebarCollapsed());
	const { user, logout, retrieveUser } = useAuth();
	const { hasInternetConnection, testConnection } = useNetwork();
	const { pathname: pathName } = useLocation();

	// useBeforeunload(() => {
	// 	logout(user.id);
	// });

	useEffect(() => {
		testConnection();
		retrieveUser(user.id, user.login_count || user.online_login_count);
	}, []);

	const isDisabled = useCallback(() => {
		if (!hasInternetConnection) {
			const path = pathName.split('/')?.[1];
			return ONLINE_ROUTES.includes(`/${path}`);
		}

		return false;
	}, [hasInternetConnection]);

	return (
		<Layout className={cn('Main', { 'sidebar-collapsed': isSidebarCollapsed })}>
			<Spin size="large" spinning={loading} tip={loadingText} className="container-spinner">
				<Sidebar />
				<Layout className={cn('site-layout', { disabled: isDisabled() })}>
					<Header className="site-layout-background">
						<section className="page-header">
							<div>
								<h3 className="page-title">
									{title}
									{description && (
										<Tooltip title={description} placement="right">
											<InfoIcon classNames="icon-info" />
											<span></span>
										</Tooltip>
									)}
								</h3>

								{breadcrumb}
							</div>
							<h3 className="page-title">{rightTitle || ''}</h3>
						</section>
					</Header>
					<Content className="page-content">{children}</Content>
				</Layout>
			</Spin>
		</Layout>
	);
};

Container.defaultProps = {
	loading: false,
	loadingText: 'Fetching data...',
};
