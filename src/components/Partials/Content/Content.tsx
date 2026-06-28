import { Layout, Tag, Tooltip } from 'antd';
import cn from 'classnames';
import { appTypes, headOfficeTypes } from 'global';
import { useBranchRetrieve } from 'hooks';
import { useUI } from 'hooks/useUI';
import React, { ReactNode } from 'react';
import { getAppType, getHeadOfficeType, getOnlineBranchId } from 'utils';
import { InfoIcon } from '../../Icons/Icons';
import './style.scss';

interface Props {
	title: string;
	description?: string;
	rightTitle?: string;
	breadcrumb?: ReactNode;
	className?: string;
	children?: ReactNode;
}

const hoTypeLabels = {
	[headOfficeTypes.MAIN]: { label: 'Main HO', color: 'green' },
	[headOfficeTypes.NOT_MAIN]: { label: 'Not Main HO', color: 'blue' },
	[headOfficeTypes.TEST]: { label: 'Standalone HO', color: 'orange' },
};

const AppContextTag = () => {
	const isBackOffice = getAppType() === appTypes.BACK_OFFICE;
	const branchId = getOnlineBranchId();
	const { data: branch } = useBranchRetrieve({
		id: Number(branchId),
		options: { enabled: isBackOffice && !!branchId },
	});

	if (isBackOffice) {
		if (!branch?.name) return null;
		return (
			<Tag color="green" className="ContentLayout_header_contextTag">
				{branch.name}
			</Tag>
		);
	}

	const hoType = getHeadOfficeType();
	const hoInfo = hoTypeLabels[hoType];
	if (!hoInfo) return null;
	return (
		<Tag color={hoInfo.color} className="ContentLayout_header_contextTag">
			{hoInfo.label}
		</Tag>
	);
};

export const Content = ({
	title,
	description,
	rightTitle,
	breadcrumb,
	className,
	children,
}: Props) => {
	//! Temporarily disabled checking if has internet connection.
	// Restore this functionality once it is revisited and if still needed
	const { isSidebarCollapsed } = useUI();
	// const { hasInternetConnection, testConnection } = useNetwork();
	// const { pathname: pathName } = useLocation();

	// useEffect(() => {
	// 	testConnection();
	// }, []);

	// const isDisabled = useCallback(() => {
	// 	if (!hasInternetConnection) {
	// 		const path = pathName.split('/')?.[1];
	// 		return ONLINE_ROUTES.includes(`/${path}`);
	// 	}

	// 	return false;
	// }, [hasInternetConnection]);

	return (
		<Layout
			className={cn('ContentLayout', className, {
				ContentLayout__sidebarCollapsed: isSidebarCollapsed,
				// ContentLayout__disabled: isDisabled(),
			})}
		>
			<Layout.Header className="ContentLayout_header">
				<div>
					<h3 className="ContentLayout_header_title">
						{title}
						{description && (
							<Tooltip placement="right" title={description}>
								<InfoIcon classNames="ContentLayout_header_title_iconInfo" />
								<span />
							</Tooltip>
						)}
					</h3>

					{breadcrumb}
				</div>
				<div className="ContentLayout_header_right">
					<AppContextTag />
					{rightTitle && (
						<h3 className="ContentLayout_header_title">{rightTitle}</h3>
					)}
				</div>
			</Layout.Header>
			<Layout.Content className="ContentLayout_mainContent">
				{children}
			</Layout.Content>
		</Layout>
	);
};
