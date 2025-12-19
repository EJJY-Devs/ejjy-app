import { Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { appTypes } from 'global';
import { useQueryParams } from 'hooks';
import _ from 'lodash';
import React from 'react';
import { getAppType } from 'utils';
import { TabDTR } from './components/TabDTR';
import { TabDTRPrinting } from './components/TabDTRPrinting';

const tabs = {
	DTR: 'List',
	DTR_PRINTING: 'DTR Printing',
};

export const DTR = () => {
	// CUSTOM HOOKS
	const {
		params: { tab = tabs.DTR },
		setQueryParams,
	} = useQueryParams();
	// METHODS
	const handleTabClick = (selectedTab) => {
		setQueryParams(
			{ tab: selectedTab },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	return (
		<Content title="Daily Time Record">
			<Box>
				<Tabs
					activeKey={_.toString(tab)}
					className="pa-6"
					type="card"
					destroyInactiveTabPane
					onTabClick={handleTabClick}
				>
					<Tabs.TabPane key={tabs.DTR} tab={tabs.DTR}>
						<TabDTR />
					</Tabs.TabPane>

					{getAppType() !== appTypes.BACK_OFFICE && (
						<Tabs.TabPane key={tabs.DTR_PRINTING} tab={tabs.DTR_PRINTING}>
							<TabDTRPrinting />
						</Tabs.TabPane>
					)}
				</Tabs>
			</Box>
		</Content>
	);
};
