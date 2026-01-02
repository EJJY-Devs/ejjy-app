import { Button, message, Spin, Tabs } from 'antd';
import { LockFilled } from '@ant-design/icons';
import { Content, RequestErrors } from 'components';
import { Box } from 'components/elements';
import { appTypes, DEFAULT_PAGE, DEFAULT_PAGE_SIZE, userTypes } from 'global';
import { useBranches, useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getAppType,
	getLocalApiUrl,
	getLocalBranchId,
	isUserFromOffice,
} from 'utils';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { CumulativeSales } from './components/CumulativeSales';
import { BranchSales } from './components/BranchSales';
import './style.scss';

export const Sales = () => {
	// STATES
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesErrors,
	} = useBranches({
		options: {
			enabled: isUserFromOffice(user.user_type),
		},
	});

	// VARIABLES
	const {
		params: { branchId: currentBranchId },
		setQueryParams,
	} = useQueryParams();

	// METHODS
	useEffect(() => {
		return () => {
			setIsAuthorized(false);
		};
	}, []);

	const handleShowData = () => {
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			userTypes: [userTypes.ADMIN],
			onSuccess: handleAuthorizedSuccess,
			onCancel: () => setAuthorizeConfig(null),
		});
	};

	useEffect(() => {
		if (branches && !currentBranchId) {
			handleTabClick(branches?.[0]?.id);
		}
	}, [branches, currentBranchId]);

	const handleAuthorizedSuccess = () => {
		setIsAuthorized(true);
		setAuthorizeConfig(null);

		message.success('Authorization successful!');
	};

	const handleTabClick = (branchId) => {
		setQueryParams({
			branchId,
			page: DEFAULT_PAGE,
			pageSize: DEFAULT_PAGE_SIZE,
		});
	};

	return (
		<>
			<Content title="Sales">
				{getAppType() === appTypes.BACK_OFFICE && !isAuthorized && (
					<div className="ShowDataButtonContainer">
						<div className="ShowDataBox">
							<LockFilled className="LockIcon" />
							<Button size="large" type="primary" onClick={handleShowData}>
								Show Data
							</Button>
						</div>
					</div>
				)}

				<div
					className={`SalesContent ${
						getAppType() === appTypes.HEAD_OFFICE || isAuthorized
							? 'authorized'
							: 'blurred'
					}`}
				>
					<Box padding>
						<CumulativeSales />
					</Box>

					<Box padding={getAppType() === appTypes.BACK_OFFICE}>
						{getAppType() === appTypes.HEAD_OFFICE && (
							<Spin spinning={isFetchingBranches}>
								<RequestErrors
									className="px-6 pt-6"
									errors={convertIntoArray(branchesErrors, 'Branches')}
								/>

								<Tabs
									activeKey={_.toString(currentBranchId)}
									className="pa-6"
									type="card"
									destroyInactiveTabPane
									onTabClick={handleTabClick}
								>
									{branches.map(({ name, id }) => (
										<Tabs.TabPane key={id} tab={name}>
											<BranchSales branchId={id} />
										</Tabs.TabPane>
									))}
								</Tabs>
							</Spin>
						)}

						{getAppType() === appTypes.BACK_OFFICE && (
							<BranchSales branchId={getLocalBranchId()} />
						)}
					</Box>
				</div>
			</Content>

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</>
	);
};
