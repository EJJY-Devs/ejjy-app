import { Badge, Space, Tabs } from 'antd';
import { Content, NotificationsInfo } from 'components';
import { Box } from 'components/elements';
import { useQueryParams } from 'hooks';
import _ from 'lodash';
import React from 'react';
import shallow from 'zustand/shallow';
import { TabBranchConnectivityLogs } from './components/TabBranchConnectivityLogs';
import { TabDTR } from './components/TabDTR';
import { useNotificationStore } from './stores/useNotificationStore';

const tabs = {
	DTR: 'DTR',
	BRANCH_CONNECTIVITY: 'Branch Connectivity',
};

export const Notifications = () => {
	// CUSTOM HOOKS
	const {
		params: { tab },
		setQueryParams,
	} = useQueryParams();
	const { connectivityCount, dtrCount } = useNotificationStore(
		(state: any) => ({
			connectivityCount: state.connectivityCount,
			dtrCount: state.dtrCount,
		}),
		shallow,
	);

	// METHODS
	const handleTabClick = (selectedTab) => {
		setQueryParams(
			{ tab: selectedTab },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	return (
		<Content title="Notifications">
			<NotificationsInfo />

			<Box>
				<Tabs
					activeKey={tab ? _.toString(tab) : tabs.DTR}
					className="pa-6"
					defaultActiveKey={tabs.DTR}
					type="card"
					onTabClick={handleTabClick}
				>
					<Tabs.TabPane
						key={tabs.DTR}
						tab={
							<Space align="center">
								<span>{tabs.DTR}</span>
								{dtrCount > 0 && <Badge count={dtrCount} overflowCount={999} />}
							</Space>
						}
					>
						<TabDTR />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.BRANCH_CONNECTIVITY}
						tab={
							<Space align="center">
								<span>{tabs.BRANCH_CONNECTIVITY}</span>
								{connectivityCount > 0 && (
									<Badge count={connectivityCount} overflowCount={999} />
								)}
							</Space>
						}
					>
						<TabBranchConnectivityLogs />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};
