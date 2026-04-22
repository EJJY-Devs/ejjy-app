import { Tabs } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { appTypes } from 'global';
import { useBranches, useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { getAppType, getLocalApiUrl, getLocalBranchId } from 'utils';
import { BranchCheckings } from './components/BranchCheckings';
import './style.scss';

export const InventoryAudit = () => {
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	// CUSTOM HOOKS
	const {
		data: { branches },
	} = useBranches({
		options: { enabled: isHeadOffice },
	});

	const {
		params: { branchId: currentBranchId },
		setQueryParams,
	} = useQueryParams();

	// METHODS
	useEffect(() => {
		if (isHeadOffice && branches.length > 0 && !currentBranchId) {
			handleTabClick(branches[0].id);
		}
	}, [branches, currentBranchId, isHeadOffice]);

	const handleTabClick = (branchId) => {
		setQueryParams({ branchId, page: 1, pageSize: 10 });
	};

	if (isHeadOffice) {
		return (
			<Content className="InventoryAuditTabs" title="Inventory Audit">
				<Box padding>
					<Tabs
						activeKey={_.toString(currentBranchId)}
						type="card"
						destroyInactiveTabPane
						onTabClick={handleTabClick}
					>
						{branches.map(({ id, name, online_url }) => (
							<Tabs.TabPane key={id} tab={name}>
								<BranchCheckings
									branchId={id}
									serverUrl={online_url || getLocalApiUrl()}
								/>
							</Tabs.TabPane>
						))}
					</Tabs>
				</Box>
			</Content>
		);
	}

	return (
		<Content title="Inventory Audit">
			<Box>
				<BranchCheckings
					branchId={Number(getLocalBranchId()) || undefined}
					serverUrl={getLocalApiUrl()}
				/>
			</Box>
		</Content>
	);
};
