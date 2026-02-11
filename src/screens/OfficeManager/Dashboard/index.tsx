import { blue, green, grey, red } from '@ant-design/colors';
import { LockOutlined, UnlockOutlined, WifiOutlined } from '@ant-design/icons';
import { Button, Divider, message, Space, Spin, Tabs, Tooltip } from 'antd';
import { BranchDayAuthorization, Content, RequestErrors } from 'components';
import { Box } from 'components/elements';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	NOTIFICATION_INTERVAL_MS,
	serviceTypes,
} from 'global';
import {
	useBranchDayAuthorizationCreate,
	useBranchDayAuthorizationEnd,
	useBranches,
	useQueryParams,
} from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { ReportsPerMachine } from 'screens/Shared/Dashboard/components/ReportsPerMachine';
import { FastMovingProductsTile } from 'screens/Shared/Dashboard/components/FastMovingProductsTile';
import { useUserStore } from 'stores';
import { convertIntoArray, getId } from 'utils';
import './style.scss';

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
	const queryClient = useQueryClient();
	const user = useUserStore((state) => state.user);
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
	const {
		mutateAsync: createBranchDayAuthorization,
		isLoading: isCreatingBranchDayAuthorization,
		error: createBranchDayAuthorizationError,
	} = useBranchDayAuthorizationCreate();
	const {
		mutateAsync: endBranchDayAuthorization,
		isLoading: isEndingBranchDayAuthorization,
		error: endBranchDayAuthorizationError,
	} = useBranchDayAuthorizationEnd();

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

	const handleOpenAllBranches = async () => {
		const branchIds = Object.keys(branchesStatus)
			.filter((key) => branchesStatus[key] === authorizationStatuses.UNOPENED)
			.map((key) => key);

		if (branchIds.length) {
			const response = await createBranchDayAuthorization({
				branchIds: branchIds.join(','),
				startedById: getId(user),
			});

			if (response) {
				setBranchesStatus((values) => {
					const status = _.cloneDeep(values);
					branchIds.forEach((branchId) => {
						status[branchId] = authorizationStatuses.OPENED;
					});

					return status;
				});

				queryClient.invalidateQueries(['useBranches', LIST_QUERY_KEY]);
				queryClient.invalidateQueries('useBranchDayAuthorizationsRetrieve');
			}

			message.success('Day was opened successfully.');
		}
	};

	const handleCloseAllBranches = async () => {
		const branchIds = Object.keys(branchesStatus)
			.filter((key) => branchesStatus[key] === authorizationStatuses.OPENED)
			.map((key) => key);

		if (branchIds.length) {
			const response = await endBranchDayAuthorization({
				branchIds: branchIds.join(','),
				endedById: getId(user),
			});

			if (response) {
				setBranchesStatus((values) => {
					const status = _.cloneDeep(values);
					branchIds.forEach((branchId) => {
						status[branchId] = authorizationStatuses.CLOSED;
					});

					return status;
				});

				queryClient.invalidateQueries(['useBranches', LIST_QUERY_KEY]);
				queryClient.invalidateQueries('useBranchDayAuthorizationsRetrieve');
			}

			message.success('Day was closed successfully.');
		}
	};

	return (
		<Content className="Dashboard" title="Dashboard">
			<Box>
				<Spin spinning={isLoadingBranches}>
					<RequestErrors
						className="px-6 pt-6"
						errors={[
							...convertIntoArray(branchesErrors, 'Branches'),
							...convertIntoArray(createBranchDayAuthorizationError?.errors),
							...convertIntoArray(endBranchDayAuthorizationError?.errors),
						]}
					/>

					<Tabs
						activeKey={_.toString(currentBranchId)}
						className="pa-6"
						tabBarExtraContent={{
							left: (
								<Space className="w-100" direction="vertical">
									<Button
										disabled={
											!Object.keys(branchesStatus).some(
												(key) =>
													branchesStatus[key] ===
													authorizationStatuses.UNOPENED,
											)
										}
										icon={<UnlockOutlined />}
										loading={isCreatingBranchDayAuthorization}
										type="primary"
										block
										onClick={handleOpenAllBranches}
									>
										Open All Unopened Branches
									</Button>
									<Button
										disabled={
											!Object.keys(branchesStatus).some(
												(key) =>
													branchesStatus[key] === authorizationStatuses.OPENED,
											)
										}
										icon={<LockOutlined />}
										loading={isEndingBranchDayAuthorization}
										block
										onClick={handleCloseAllBranches}
									>
										Close All Opened Branches
									</Button>
								</Space>
							),
						}}
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
									<BranchDayAuthorization
										branch={branch}
										className="mt-2"
										bordered
										onSuccess={(branchId, isOpen) => {
											setBranchesStatus((values) => {
												const status = _.cloneDeep(values);
												status[branchId] = isOpen
													? authorizationStatuses.OPENED
													: authorizationStatuses.CLOSED;

												return status;
											});

											queryClient.invalidateQueries([
												'useBranches',
												LIST_QUERY_KEY,
											]);
										}}
									/>

									<Divider />

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
