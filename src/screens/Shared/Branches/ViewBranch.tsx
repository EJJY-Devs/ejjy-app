import { Spin, Tabs } from 'antd';
import { Breadcrumb, ConnectionAlert, Content } from 'components';
import { Box } from 'components/elements';
import { ServiceType, useBranchRetrieve } from 'ejjy-global';
import { usePingOnlineServer, useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { viewBranchTabs } from 'screens/Shared/Branches/data';
import { useUserStore } from 'stores';
import { getLocalApiUrl, getUrlPrefix, isStandAlone } from 'utils';
import { TabBranchMachines } from './components/TabBranchMachines';
import { TabBranchProducts } from './components/TabBranchProducts';
import { TabDiscountedTransactions } from './components/TabDiscountedTransactions';
import { TabTransactions } from './components/TabTransactions';
import './style.scss';

interface Props {
	match: any;
}

export const ViewBranch = ({ match }: Props) => {
	// VARIABLES
	const branchIdParam = match?.params?.id;

	// CUSTOM HOOKS
	const { isConnected } = usePingOnlineServer();
	const {
		params: { tab = viewBranchTabs.BRANCH_PRODUCTS },
		setQueryParams,
	} = useQueryParams();
	const user = useUserStore((state) => state.user);
	const { data: branch, isFetching: isFetchingBranch } = useBranchRetrieve({
		id: Number(branchIdParam),
		options: { enabled: !!branchIdParam },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	// METHODS
	const getBreadcrumbItems = useCallback(
		() => [
			{ name: 'Branches', link: `${getUrlPrefix(user.user_type)}/branches` },
			{ name: branch?.name },
		],
		[branch, user],
	);

	const handleTabClick = (selectedTab) => {
		setQueryParams(
			{ tab: selectedTab },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	return (
		<Content
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			rightTitle={branch?.name}
			title="[VIEW] Branch"
		>
			<ConnectionAlert />

			<Spin spinning={isFetchingBranch}>
				{branch && (
					<Box className="ViewBranchMachine">
						<Tabs
							activeKey={_.toString(tab)}
							className="pa-6"
							type="card"
							destroyInactiveTabPane
							onTabClick={handleTabClick}
						>
							<Tabs.TabPane
								key={viewBranchTabs.BRANCH_PRODUCTS}
								tab={viewBranchTabs.BRANCH_PRODUCTS}
							>
								<TabBranchProducts
									branch={branch}
									disabled={isConnected === false}
								/>
							</Tabs.TabPane>

							<Tabs.TabPane
								key={viewBranchTabs.MACHINES}
								tab={viewBranchTabs.MACHINES}
							>
								<TabBranchMachines
									branch={branch}
									disabled={isConnected === false}
								/>
							</Tabs.TabPane>

							<Tabs.TabPane
								key={viewBranchTabs.TRANSACTIONS}
								tab={viewBranchTabs.TRANSACTIONS}
							>
								<TabTransactions branch={branch} />
							</Tabs.TabPane>

							<Tabs.TabPane
								key={viewBranchTabs.DISCOUNTED_TRANSACTIONS}
								tab={viewBranchTabs.DISCOUNTED_TRANSACTIONS}
							>
								<TabDiscountedTransactions branch={branch} />
							</Tabs.TabPane>
						</Tabs>
					</Box>
				)}
			</Spin>
		</Content>
	);
};
