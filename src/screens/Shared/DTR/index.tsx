import { Button, message, Tabs } from 'antd';
import { LockFilled } from '@ant-design/icons';
import { Content } from 'components';
import { Box } from 'components/elements';
import { appTypes, userTypes } from 'global';
import { useQueryParams } from 'hooks';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { getAppType, getLocalApiUrl } from 'utils';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { TabDTR } from './components/TabDTR';
import { TabDTRPrinting } from './components/TabDTRPrinting';
import './style.scss';

const tabs = {
	DTR: 'List',
	DTR_PRINTING: 'DTR Printing',
};

export const DTR = () => {
	// STATES
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	// CUSTOM HOOKS
	const {
		params: { tab = tabs.DTR },
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

	const handleAuthorizedSuccess = () => {
		setIsAuthorized(true);
		setAuthorizeConfig(null);

		message.success('Authorization successful!');
	};

	const handleTabClick = (selectedTab) => {
		setQueryParams(
			{ tab: selectedTab },
			{ shouldResetPage: true, shouldIncludeCurrentParams: false },
		);
	};

	return (
		<>
			<Content title="Daily Time Record">
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
					className={`DTRContent ${
						getAppType() === appTypes.HEAD_OFFICE || isAuthorized
							? 'authorized'
							: 'blurred'
					}`}
				>
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
				</div>
			</Content>

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</>
	);
};
