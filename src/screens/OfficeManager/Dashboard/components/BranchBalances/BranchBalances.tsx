/* eslint-disable react-hooks/exhaustive-deps */
import { Spin, Tabs } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '../../../../../components/elements';
import { request } from '../../../../../global/types';
import { useBranchesDays } from '../../../../../hooks/useBranchesDays';
import { useBranches } from '../../../hooks/useBranches';
import { BranchBalanceItem } from './BranchBalanceItem';

const { TabPane } = Tabs;

export const BranchBalances = () => {
	// STATES
	const [data, setData] = useState([]);
	const [currentActiveKey, setCurrentActiveKey] = useState([]);

	// CUSTOM HOOKS
	const { branches } = useBranches();
	const { getBranchDay, status: branchesDaysStatus } = useBranchesDays();

	// METHODS
	useEffect(() => {
		if (branches) {
			onTabClick(branches?.[0]?.id);
		}
	}, [branches]);

	const onTabClick = (branchId) => {
		setCurrentActiveKey(branchId);

		// if (!currentActiveKey.includes(branchId) && branchId) {
		// 	setCurrentActiveKey((value) => [...value, branchId.toString()]);
		// 	getBranchProductsByBranch(branchId);
		// }

		getBranchDay(branchId);
	};

	const getStatus = useCallback(() => branchesDaysStatus === request.REQUESTING, [
		branchesDaysStatus,
	]);

	return (
		<Spin size="large" spinning={getStatus()}>
			<Box>
				<Tabs
					defaultActiveKey={branches?.[0]?.id}
					style={{ padding: '20px 25px' }}
					type="card"
					onTabClick={onTabClick}
				>
					{branches.map(({ name, id, online_url }) => (
						<TabPane key={id} tab={name} disabled={!online_url}>
							<BranchBalanceItem
								isActive={id === currentActiveKey}
								branchId={id}
								dataSource={[]}
								disabled={!online_url}
							/>
						</TabPane>
					))}
				</Tabs>
			</Box>
		</Spin>
	);
};
