/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Badge, Layout } from 'antd';
import iconAccount from 'assets/images/icon-account.svg';
import iconDashboard from 'assets/images/icon-dashboard.svg';
import iconLogout from 'assets/images/icon-logout.svg';
import iconReport from 'assets/images/icon-report.svg';
import sampleAvatar from 'assets/images/sample-avatar.png';
import cn from 'classnames';
import { getFullName } from 'ejjy-global';
import { appTypes, userTypes } from 'global';
import { useAuthLogout, useSiteSettings } from 'hooks';
import { useUI } from 'hooks/useUI';
import React, { useState } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { useUserStore } from 'stores';
import { getAppType, getUserTypeName } from 'utils';
import './style.scss';

interface Props {
	items?: any;
}

export const Sidebar = ({ items }: Props) => {
	// STATES
	const [popupVisible, setPopupVisible] = useState(false);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { pathname } = useLocation();
	const isBackOffice = getAppType() === appTypes.BACK_OFFICE;
	let displayName = getFullName(user);
	if (user?.user_type === userTypes.ADMIN) {
		displayName = 'Emman Fineza';
	}
	const displayRole = getUserTypeName(user?.user_type);
	const {
		accountingLink,
		wetMarketLink,
		isInAccounting,
	} = React.useMemo(() => {
		const officeManagerBase = pathname.startsWith('/office-manager/')
			? '/office-manager'
			: null;
		const branchManagerBase = pathname.startsWith('/branch-manager/')
			? '/branch-manager'
			: null;

		const basePath = officeManagerBase || branchManagerBase;
		const inAccounting = pathname.includes('/accounting');
		const accounting = basePath ? `${basePath}/accounting` : null;
		let wetMarket: string | null = null;
		if (officeManagerBase) {
			wetMarket = '/office-manager/products';
		} else if (branchManagerBase) {
			wetMarket = '/branch-manager/branch-machines';
		}

		return {
			accountingLink: accounting,
			wetMarketLink: wetMarket,
			isInAccounting: inAccounting,
		};
	}, [pathname]);
	const hasAppSwitchLinks = !!(accountingLink || wetMarketLink);
	const { mutateAsync: logout } = useAuthLogout();
	const { data: siteSettings } = useSiteSettings();
	// TODO: Create a reducer for this which will be updated everytime network check is done
	// const { hasInternetConnection } = useNetwork();
	const { isSidebarCollapsed, onCollapseSidebar } = useUI();

	return (
		<Layout.Sider
			breakpoint="lg"
			className={cn('Sidebar', { Sidebar__collapsed: isSidebarCollapsed })}
			collapsedWidth="0"
			theme="light"
			width={280}
			onCollapse={(collapsed) => onCollapseSidebar(collapsed)}
		>
			<img
				alt="logo"
				className="Sidebar_logo"
				src={siteSettings?.logo_base64}
			/>
			<div className="Sidebar_sidebarList">
				{items.map((item) => (
					<Link key={item.key} tabIndex={-1} to={item.link}>
						<div
							className={cn('Sidebar_sidebarList_item', {
								Sidebar_sidebarList_item__active: pathname.startsWith(
									item.link,
								),
							})}
						>
							<img
								alt={item.name}
								className="Sidebar_sidebarList_item_icon"
								src={item.defaultIcon?.default}
							/>
							<img
								alt={item.name}
								className="Sidebar_sidebarList_item_icon Sidebar_sidebarList_item_icon__active"
								src={item.activeIcon?.default}
							/>
							<span className="Sidebar_sidebarList_item_name">{item.name}</span>

							{item?.count > 0 && (
								<Badge
									className="Sidebar_sidebarList_item_itemCount"
									count={item?.count}
								/>
							)}

							{/* {ONLINE_ROUTES.includes(item.link) && !hasInternetConnection && (
								<Tooltip title="Locked if no internet">
									<img
										alt={item.name}
										className="Sidebar_sidebarList_item_iconLock"
										src={require('../../../assets/images/icon-lock.svg')}
									/>
								</Tooltip>
							)} */}
						</div>
					</Link>
				))}
			</div>

			<div
				className={cn('bottom', { active: popupVisible })}
				onClick={() => {
					if (isBackOffice && !hasAppSwitchLinks) {
						return;
					}
					setPopupVisible((value) => !value);
				}}
			>
				<div className="menu">
					{accountingLink && !isInAccounting && (
						<Link className="item" tabIndex={-1} to={accountingLink}>
							<img alt="icon" className="icon" src={iconReport} />
							<span className="name">Accounting</span>
						</Link>
					)}
					{wetMarketLink && isInAccounting && (
						<Link className="item" tabIndex={-1} to={wetMarketLink}>
							<img alt="icon" className="icon" src={iconDashboard} />
							<span className="name">Wet Market</span>
						</Link>
					)}

					{!isBackOffice && (
						<>
							<div className="item">
								<img alt="icon" className="icon" src={iconAccount} />
								<span className="name">Account</span>
							</div>

							<div className="item" onClick={() => logout(user.id)}>
								<img alt="icon" className="icon" src={iconLogout} />
								<span className="name">Logout</span>
							</div>
						</>
					)}
				</div>

				<div className="user-details">
					<img alt="user avatar" className="avatar" src={sampleAvatar} />
					<div className="user-text-info">
						{isBackOffice && (
							<>
								<span className="name">Menu</span>
								<span className="role">Switch App</span>
							</>
						)}
						{!isBackOffice && (
							<>
								<span className="name">{displayName}</span>
								<span className="role">{displayRole}</span>
							</>
						)}
					</div>
				</div>
			</div>
		</Layout.Sider>
	);
};
