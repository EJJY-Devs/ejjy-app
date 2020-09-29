import { Layout } from 'antd';
import cn from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { selectors as authSelectors } from '../../../ducks/auth';
import { actions as uiActions, selectors as uiSelectors } from '../../../ducks/ui';
import { actions as authActions } from '../../../ducks/auth';
import { userTypes } from '../../../global/types';
import { useActionDispatch } from '../../../hooks/useActionDispatch';
import { getUserTypeName } from '../../../utils/function';
import './style.scss';

const SidebarItems = [
	{
		key: 'dashboard',
		name: 'Dashboard',
		activeIcon: require(`../../../assets/images/icon-dashboard-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-dashboard.svg`),
		link: '/dashboard',
		userTypes: [userTypes.OFFICE_MANAGER, userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL],
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
		key: 'purchase-requests',
		name: 'Purchase Requests',
		activeIcon: require(`../../../assets/images/icon-transaction-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-transaction.svg`),
		link: '/purchase-requests',
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
		key: 'notifications',
		name: 'Notifications',
		activeIcon: require(`../../../assets/images/icon-notifications-active.svg`),
		defaultIcon: require(`../../../assets/images/icon-notifications.svg`),
		link: '/notifications',
		userTypes: [userTypes.OFFICE_MANAGER, userTypes.BRANCH_MANAGER, userTypes.BRANCH_PERSONNEL],
	},
];

export const Sidebar = () => {
	const { pathname } = useLocation();
	const user = useSelector(authSelectors.selectUser());
	const isSidebarCollapsed = useSelector(uiSelectors.selectIsSidebarCollapsed());
	const onCollapseSidebar = useActionDispatch(uiActions.onCollapseSidebar);
	const logout = useActionDispatch(authActions.logout);

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
					<Link to={item.link} key={item.key}>
						<div className={cn('item', { active: pathname.startsWith(item.link) })}>
							<img src={item.defaultIcon} alt={item.name} className="icon" />
							<img src={item.activeIcon} alt={item.name} className="icon icon-active" />
							<span className="name">{item.name}</span>
						</div>
					</Link>
				))}
			</div>

			<div className="user-details" onClick={logout}>
				<img
					src={require('../../../assets/images/sample-avatar.png')}
					alt="user avatar"
					className="avatar"
				/>
				<div className="user-text-info">
					<span className="name">{`${user.first_name} ${user.last_name}`}</span>
					<span className="role">{getUserTypeName(user.user_type)}</span>
				</div>
			</div>
		</Layout.Sider>
	);
};
