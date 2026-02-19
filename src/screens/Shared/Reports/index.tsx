import React, { useState } from 'react';
import { Tabs } from 'antd';
import _ from 'lodash';
import { Content } from 'components';
import { Box } from 'components/elements';
import TabDailyItemSoldReport from './components/TabDailyItemSoldReport';
import TabBranchInventoryReport from './components/TabBranchInventoryReport';
import TabUnsoldItemReport from './components/TabUnsoldItemReport';

const tabs = {
	DAILY_ITEM_SOLD_REPORT: 'Daily Item Sold Report',
	UNSOLD_ITEM_REPORT: 'Unsold Item Report',
	BRANCH_INVENTORY_REPORT: 'Branch Inventory Report',
};

export const Reports = () => {
	// STATES
	const [tab, setTab] = useState(tabs.DAILY_ITEM_SOLD_REPORT);

	// METHODS
	const handleTabClick = (selectedTab: string) => {
		setTab(selectedTab);
	};

	return (
		<Content title="Reports">
			<Box>
				<Tabs
					activeKey={_.toString(tab)}
					className="pa-6"
					type="card"
					destroyInactiveTabPane
					onTabClick={handleTabClick}
				>
					<Tabs.TabPane
						key={tabs.DAILY_ITEM_SOLD_REPORT}
						tab={tabs.DAILY_ITEM_SOLD_REPORT}
					>
						<TabDailyItemSoldReport />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.UNSOLD_ITEM_REPORT}
						tab={tabs.UNSOLD_ITEM_REPORT}
					>
						<TabUnsoldItemReport />
					</Tabs.TabPane>

					<Tabs.TabPane
						key={tabs.BRANCH_INVENTORY_REPORT}
						tab={tabs.BRANCH_INVENTORY_REPORT}
					>
						<TabBranchInventoryReport />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};

export default Reports;
