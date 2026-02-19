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
		key: 'products',
		name: 'Products',
		activeIcon: require('../../../assets/images/icon-product-active.svg'),
		defaultIcon: require('../../../assets/images/icon-product.svg'),
		link: `${basePath}/accounting/products`,
	},
];
