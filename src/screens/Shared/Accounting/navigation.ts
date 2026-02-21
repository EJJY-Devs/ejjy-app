export interface SidebarItem {
	key: string;
	name: string;
	activeIcon: any;
	defaultIcon: any;
	link: string;
	count?: number;
}

export const getAccountingRootSidebarItem = (
	basePath: string,
): SidebarItem => ({
	key: 'accounting',
	name: 'Accounting',
	activeIcon: require('../../../assets/images/icon-report-active.svg'),
	defaultIcon: require('../../../assets/images/icon-report.svg'),
	link: `${basePath}/accounting`,
});

export const getAccountingSidebarItems = (basePath: string): SidebarItem[] => [
	{
		key: 'chart-of-accounts',
		name: 'Chart of Accounts',
		activeIcon: require('../../../assets/images/icon-report-active.svg'),
		defaultIcon: require('../../../assets/images/icon-report.svg'),
		link: `${basePath}/accounting/chart-of-accounts`,
	},
];
