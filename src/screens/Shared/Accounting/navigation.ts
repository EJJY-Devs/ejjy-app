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

export const getAccountingSidebarItems = (
	basePath: string,
	options?: {
		includeBranches?: boolean;
	},
): SidebarItem[] => {
	const includeBranches = options?.includeBranches ?? false;

	const sidebarItems: SidebarItem[] = [
		{
			key: 'chart-of-accounts',
			name: 'Chart of Accounts',
			activeIcon: require('../../../assets/images/icon-report-active.svg'),
			defaultIcon: require('../../../assets/images/icon-report.svg'),
			link: `${basePath}/accounting/chart-of-accounts`,
		},
		{
			key: 'tags',
			name: 'Tags',
			activeIcon: require('../../../assets/images/icon-product-active.svg'),
			defaultIcon: require('../../../assets/images/icon-product.svg'),
			link: `${basePath}/accounting/tags`,
		},
		{
			key: 'sales',
			name: 'Sales',
			activeIcon: require('../../../assets/images/icon-sales-active.svg'),
			defaultIcon: require('../../../assets/images/icon-sales.svg'),
			link: `${basePath}/accounting/sales`,
		},
		{
			key: 'accounts',
			name: 'Accounts',
			activeIcon: require('../../../assets/images/icon-users-active.svg'),
			defaultIcon: require('../../../assets/images/icon-users.svg'),
			link: `${basePath}/accounting/accounts`,
		},
		{
			key: 'discount-options',
			name: 'Discount Options',
			activeIcon: require('../../../assets/images/icon-product-active.svg'),
			defaultIcon: require('../../../assets/images/icon-product.svg'),
			link: `${basePath}/accounting/discount-options`,
		},
	];

	if (includeBranches) {
		sidebarItems.splice(4, 0, {
			key: 'branches',
			name: 'Branches',
			activeIcon: require('../../../assets/images/icon-branches-active.svg'),
			defaultIcon: require('../../../assets/images/icon-branches.svg'),
			link: `${basePath}/accounting/branches`,
		});
	}

	return sidebarItems;
};
