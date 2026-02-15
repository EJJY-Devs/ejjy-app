import { blue, green, grey, red } from '@ant-design/colors';
import { LockOutlined, UnlockOutlined, WifiOutlined } from '@ant-design/icons';
import { Divider, Spin, Tabs, Tooltip } from 'antd';
import { Content, RequestErrors } from 'components';
import { Box } from 'components/elements';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	NOTIFICATION_INTERVAL_MS,
	serviceTypes,
} from 'global';
import { useBranches, useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { ReportsPerMachine } from 'screens/Shared/Dashboard/components/ReportsPerMachine';
import { FastMovingProductsTile } from 'screens/Shared/Dashboard/components/FastMovingProductsTile';
import { convertIntoArray, getId } from 'utils';

const LIST_QUERY_KEY = 'HeadOfficeDashboardBranch';

const authorizationStatuses = {
	UNOPENED: 'unopened',
	OPENED: 'opened',
	CLOSED: 'ended',
};

export const Dashboard = () => {
	// STATES
	const [branchesStatus, setBranchesStatus] = useState({});
	const [
		isBranchesStatusInitialized,
		setIsBranchesStatusInitialized,
	] = useState(false);

	// CUSTOM HOOKS
	const {
		data: { branches },
		isLoading: isLoadingBranches,
		error: branchesErrors,
	} = useBranches({
		key: LIST_QUERY_KEY,
		params: {
			pageSize: MAX_PAGE_SIZE,
			serviceType: serviceTypes.OFFLINE,
		},
		options: { refetchInterval: NOTIFICATION_INTERVAL_MS },
	});

	// VARIABLES
	const {
		params: { branchId: currentBranchId },
		setQueryParams,
	} = useQueryParams();

	// METHODS
	useEffect(() => {
		if (branches.length && !currentBranchId) {
			const id = getId(branches?.[0]);
			handleTabClick(id);
		}

		if (branches.length > 0 && !isBranchesStatusInitialized) {
			if (branches.length) {
				const status = {};

				branches.forEach((branch) => {
					status[getId(branch)] = branch.authorization_status;
				});

				setBranchesStatus(status);
			}

			setIsBranchesStatusInitialized(true);
		}
	}, [branches, currentBranchId, isBranchesStatusInitialized]);

	const handleTabClick = (branchId) => {
		setQueryParams({
			branchId,
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		});
	};

	return (
		<Content className="Dashboard" title="Dashboard">
			<Box>
				<Spin spinning={isLoadingBranches}>
					<RequestErrors
						className="px-6 pt-6"
						errors={convertIntoArray(branchesErrors, 'Branches')}
					/>

					<Tabs
						activeKey={_.toString(currentBranchId)}
						className="pa-6"
						tabPosition="left"
						type="card"
						destroyInactiveTabPane
						onTabClick={handleTabClick}
					>
						{branches.map((branch) => {
							const id = getId(branch);

							return (
								<Tabs.TabPane
									key={id}
									tab={
										<>
											<Tooltip
												placement="top"
												title={
													branch.is_online
														? 'Branch is online'
														: 'Branch is offline'
												}
											>
												<WifiOutlined
													style={{
														color: branch.is_online
															? green.primary
															: red.primary,
													}}
												/>
											</Tooltip>

											{branchesStatus[id] ===
												authorizationStatuses.UNOPENED && (
												<Tooltip placement="top" title="Branch is not yet open">
													<LockOutlined style={{ color: grey.primary }} />
												</Tooltip>
											)}

											{branchesStatus[id] === authorizationStatuses.OPENED && (
												<Tooltip placement="top" title="Branch is open">
													<UnlockOutlined style={{ color: blue.primary }} />
												</Tooltip>
											)}

											{branchesStatus[id] === authorizationStatuses.CLOSED && (
												<Tooltip placement="top" title="Branch has been closed">
													<LockOutlined style={{ color: red.primary }} />
												</Tooltip>
											)}

											<span>{branch.name}</span>
										</>
									}
								>
									<ReportsPerMachine
										branchId={branch.id}
										tableHeaderClassName="pt-2 px-0"
									/>

									<Divider />
									<div className="px-6 pb-6">
										<FastMovingProductsTile branchId={branch.id} />
									</div>
								</Tabs.TabPane>
							);
						})}
					</Tabs>
				</Spin>
			</Box>
		</Content>
	);
};
