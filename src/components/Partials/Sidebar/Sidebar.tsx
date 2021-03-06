import { Layout, Tooltip } from 'antd';
import cn from 'classnames';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { actions as uiActions, selectors as uiSelectors } from '../../../ducks/ui';
import { ONLINE_ROUTES } from '../../../global/constants';
import { userTypes } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { useAuth } from '../../../hooks/useAuth';
import { useNetwork } from '../../../hooks/useNetwork';
import { getUserTypeName } from '../../../utils/function';
import './style.scss';

const SidebarItems = [
	{
		key: 'dashboard',
		name: 'Dashboard',
		activeIcon: require(`../../../assets/images/icon-dashboard-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-dashboard.svg`),
		link: '/dashboard',
		userTypes: [
			userTypes.ADMIN,
			userTypes.OFFICE_MANAGER,
			userTypes.BRANCH_MANAGER,
			userTypes.BRANCH_PERSONNEL,
		],
	},
	{
		key: 'pending-transactions',
		name: 'Pending Transactions',
		activeIcon: require(`../../../assets/images/icon-notifications-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-notifications.svg`),
		link: '/pending-transactions',
		userTypes: [userTypes.ADMIN],
	},
	{
		key: 'products',
		name: 'Products',
		activeIcon: require(`../../../assets/images/icon-product-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-product.svg`),
		link: '/products',
		userTypes: [userTypes.OFFICE_MANAGER, userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL],
	},
	{
		key: 'branches',
		name: 'Branches',
		activeIcon: require(`../../../assets/images/icon-branches-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-branches.svg`),
		link: '/branches',
		userTypes: [userTypes.OFFICE_MANAGER],
	},
	{
		key: 'requisition-slips',
		name: 'Requisition Slips',
		activeIcon: require(`../../../assets/images/icon-requisition-slip-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-requisition-slip.svg`),
		link: '/requisition-slips',
		userTypes: [userTypes.OFFICE_MANAGER, userTypes.BRANCH_MANAGER],
	},
	{
		key: 'users',
		name: 'Users',
		activeIcon: require(`../../../assets/images/icon-users-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-users.svg`),
		link: '/users',
		userTypes: [userTypes.OFFICE_MANAGER],
	},
	{
		key: 'order-slips',
		name: 'Order Slips',
		activeIcon: require(`../../../assets/images/icon-order-slips-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-order-slips.svg`),
		link: '/order-slips',
		userTypes: [userTypes.BRANCH_MANAGER],
	},
	{
		key: 'preparation-slips',
		name: 'Preparation Slips',
		activeIcon: require(`../../../assets/images/icon-order-slips-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-order-slips.svg`),
		link: '/preparation-slips',
		userTypes: [userTypes.BRANCH_PERSONNEL],
	},
	{
		key: 'checking',
		name: 'Checking',
		activeIcon: require(`../../../assets/images/icon-checking-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-checking.svg`),
		link: '/checking',
		userTypes: [userTypes.BRANCH_MANAGER],
	},
	{
		key: 'notifications',
		name: 'Notifications',
		activeIcon: require(`../../../assets/images/icon-notifications-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-notifications.svg`),
		link: '/notifications',
		userTypes: [userTypes.OFFICE_MANAGER, userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL],
	},
];

export const Sidebar = () => {
	// STATES
	const [popupVisible, setPopupVisible] = useState(false);

	// CUSTOM HOOKS
	const { pathname } = useLocation();
	const isSidebarCollapsed = useSelector(uiSelectors.selectIsSidebarCollapsed());
	const { user, logout } = useAuth();
	const { hasInternetConnection } = useNetwork();
	const onCollapseSidebar = useActionDispatch(uiActions.onCollapseSidebar);

	// METHODS
	const getName = useCallback(() => {
		const firstName = user.user_type === userTypes.ADMIN ? 'Emman' : user.first_name;
		const lastName = user.user_type === userTypes.ADMIN ? 'Fineza' : user.last_name;

		return `${firstName} ${lastName}`;
	}, [user]);

	return (
		<Layout.Sider
			className={cn('Sidebar', { collapsed: isSidebarCollapsed })}
			theme="light"
			width={280}
			breakpoint="md"
			collapsedWidth="0"
			onCollapse={(collapsed) => onCollapseSidebar(collapsed)}
		>
			<img src={require('../../../assets/images/logo.jpg')} alt="logo" className="logo" />
			<div className="sidebar-items">
				{SidebarItems.filter((item) => item.userTypes.includes(user.user_type)).map((item) => (
					<Link tabIndex={-1} to={item.link} key={item.key}>
						<div className={cn('item', { active: pathname.startsWith(item.link) })}>
							<img src={item.defaultIcon} alt={item.name} className="icon" />
							<img src={item.activeIcon} alt={item.name} className="icon icon-active" />
							<span className="name">{item.name}</span>

							{ONLINE_ROUTES.includes(item.link) && !hasInternetConnection && (
								<Tooltip title="Locked if no internet">
									<img
										src={require('../../../assets/images/icon-lock.svg')}
										alt={item.name}
										className="icon-lock"
									/>
								</Tooltip>
							)}
						</div>
					</Link>
				))}
			</div>

			<div
				className={cn('bottom', { active: popupVisible })}
				onClick={() => setPopupVisible((value) => !value)}
			>
				<div className="menu">
					<div className="item">
						<img
							src={require(`../../../assets/images/icon-account.svg`)}
							alt="icon"
							className="icon"
						/>
						<span className="name">Account</span>
					</div>

					<div className="item" onClick={() => logout(user.id)}>
						<img
							src={require(`../../../assets/images/icon-logout.svg`)}
							alt="icon"
							className="icon"
						/>
						<span className="name">Logout</span>
					</div>
				</div>

				<div className="user-details">
					<img
						src={require('../../../assets/images/sample-avatar.png')}
						alt="user avatar"
						className="avatar"
					/>
					<div className="user-text-info">
						<span className="name">{getName()}</span>
						<span className="role">{getUserTypeName(user.user_type)}</span>
					</div>
				</div>
			</div>
		</Layout.Sider>
	);
};
