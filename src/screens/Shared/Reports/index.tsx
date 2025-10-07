import React, { useState } from 'react';
import { Tabs } from 'antd';
import _ from 'lodash';
import { Content } from 'components';
import { Box } from 'components/elements';
import TabDailyItemSoldReport from './components/TabDailyItemSoldReport';
import TabProductBalances from './components/TabProductBalances';

const tabs = {
	DAILY_ITEM_SOLD_REPORT: 'Daily Item Sold Report',
	PRODUCT_BALANCES: 'Product Balances',
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

					<Tabs.TabPane key={tabs.PRODUCT_BALANCES} tab={tabs.PRODUCT_BALANCES}>
						<TabProductBalances />
					</Tabs.TabPane>
				</Tabs>
			</Box>
		</Content>
	);
};

export default Reports;
