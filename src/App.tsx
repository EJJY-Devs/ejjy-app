import { Spin } from 'antd';
import {
	AppIcons,
	CommonRoute,
	NoAuthRoute,
	PageInformation,
} from 'components';
import {
	APP_BRANCH_KEY_KEY,
	APP_LOCAL_BRANCH_ID_KEY,
	appTypes,
	serviceTypes,
	userTypes,
} from 'global';
import {
	useBranches,
	useInitializeData,
	useInitializeIds,
	useNetwork,
} from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Redirect, Switch, useHistory } from 'react-router-dom';
import Admin from 'screens/Admin';
import BranchManager from 'screens/BranchManager';
import BranchPersonnel from 'screens/BranchPersonnel';
import Login from 'screens/Common/Login';
import NetworkError from 'screens/Common/NetworkError';
import OfficeManager from 'screens/OfficeManager';
import {
	getAppType,
	getBranchKey,
	getBranchProductIds,
	getBranchProductBalanceUpdateLogsIds,
	getLocalApiUrl,
	getLocalBranchId,
	getOnlineApiUrl,
	getOnlineBranchId,
	getProductIds,
	isStandAlone,
} from 'utils';
import npmPackage from '../package.json';

const NETWORK_RETRY = 10;
const NETWORK_RETRY_DELAY_MS = 1000;

const App = () => {
	const history = useHistory();

	const {
		isFetching: isConnectingNetwork,
		isSuccess: isNetworkSuccess,
	} = useNetwork({
		options: {
			retry: NETWORK_RETRY,
			retryDelay: NETWORK_RETRY_DELAY_MS,
			enabled: !!getLocalApiUrl() && !!getOnlineApiUrl(),
			onError: () => {
				history.replace({
					pathname: '/error',
					state: true,
				});
			},
		},
	});

	const {
		data: { branches },
		isFetching: isFetchingBranches,
		isSuccess: isFetchingBranchesSuccess,
	} = useBranches({
		key: 'App',
		params: {
			serviceType: serviceTypes.OFFLINE,
			baseURL: getLocalApiUrl(),
		},
	});

	// This is to get the ids in the local storage without the need to refresh the app
	const [storageData, setStorageData] = useState(() => ({
		productIds: getProductIds() || null,
		branchProductIds: getBranchProductIds() || null,
		branchProductBalanceUpdateLogsIds:
			getBranchProductBalanceUpdateLogsIds() || null,
	}));

	useEffect(() => {
		const updateStorageData = () => {
			setStorageData({
				productIds: getProductIds() || null,
				branchProductIds: getBranchProductIds() || null,
				branchProductBalanceUpdateLogsIds:
					getBranchProductBalanceUpdateLogsIds() || null,
			});
		};

		// Listen for storage changes (across tabs)
		window.addEventListener('storage', updateStorageData);

		// Override localStorage.setItem to detect updates in the same tab
		const originalSetItem = localStorage.setItem;
		localStorage.setItem = function setItemOverride(...args) {
			originalSetItem.apply(this, args);
			updateStorageData();
		};

		// Override localStorage.removeItem to detect deletions in the same tab
		const originalRemoveItem = localStorage.removeItem;
		localStorage.removeItem = function removeItemOverride(key) {
			originalRemoveItem.call(this, key);
			updateStorageData();
		};

		return () => {
			window.removeEventListener('storage', updateStorageData);
			localStorage.setItem = originalSetItem;
			localStorage.removeItem = originalRemoveItem;
		};
	}, []);

	useInitializeData({
		params: {
			isHeadOffice: getAppType() === appTypes.HEAD_OFFICE,
			branchId:
				getAppType() === appTypes.BACK_OFFICE ? getOnlineBranchId() : undefined,
			branchIds:
				getAppType() === appTypes.HEAD_OFFICE
					? branches.map(({ id }) => id)
					: undefined,
			...(storageData.productIds && {
				productIds: storageData.productIds.split(',').slice(0, 100).join(','), // Limit to 100
			}),
			...(storageData.branchProductIds && {
				branchProductIds: storageData.branchProductIds
					.split(',')
					.slice(0, 100)
					.join(','), // Limit to 100
			}),
			...(storageData.branchProductBalanceUpdateLogsIds && {
				branchProductBalanceUpdateLogsIds: storageData.branchProductBalanceUpdateLogsIds
					.split(',')
					.slice(0, 20)
					.join(','), // Limit to 20
			}),
		},
		options: {
			enabled:
				isNetworkSuccess &&
				isFetchingBranchesSuccess &&
				!!getOnlineApiUrl() &&
				!isStandAlone(),
		},
	});

	// THIS IS FOR BULK-INITIALIZING LARGE SCALE DATA
	const [branchId, setBranchId] = useState(null);

	// Effect to wait for branchId to be available
	useEffect(() => {
		if (getAppType() === appTypes.BACK_OFFICE && isFetchingBranchesSuccess) {
			const id = Number(getOnlineBranchId()); // Ensure it's a number
			const branchExists = branches?.some((branch) => Number(branch.id) === id); // Compare numbers

			if (id && branchExists) {
				setBranchId(id); // ✅ Only set branchId if it exists in the branches list
			} else {
				setBranchId(null); // ❌ Prevent invalid branchId
			}
		}
	}, [isFetchingBranchesSuccess, branches]);

	useInitializeIds({
		params: {
			isHeadOffice: getAppType() === appTypes.HEAD_OFFICE,
			...(getAppType() === appTypes.BACK_OFFICE && branchId && { branchId }), // ✅ Only add branchId if it's needed and available
		},
		options: {
			enabled:
				isNetworkSuccess &&
				isFetchingBranchesSuccess &&
				!!getOnlineApiUrl() &&
				!isStandAlone() &&
				(getAppType() === appTypes.HEAD_OFFICE || branchId !== null), // ✅ Only enable if conditions are met
		},
	});

	// METHODS
	useEffect(() => {
		if (branches.length > 0) {
			const branchKey = getBranchKey();
			const localBranchId = Number(getLocalBranchId());
			const onlineBranchId = Number(getOnlineBranchId());
			const localBranch = branches.find(
				(branch) => branch.online_id === onlineBranchId,
			);

			if (localBranch && Number(localBranch.id) !== localBranchId) {
				localStorage.setItem(APP_LOCAL_BRANCH_ID_KEY, localBranch.id);
			}

			if (localBranch && localBranch.key !== branchKey) {
				localStorage.setItem(APP_BRANCH_KEY_KEY, localBranch.key);
			}
		}
	}, [branches]);

	const getLoadingMessage = useCallback(() => {
		let message = '';
		if (isConnectingNetwork) {
			message = 'Connecting to server...';
		} else if (isFetchingBranches) {
			message = 'Updating app data...';
		}

		return message;
	}, [isConnectingNetwork, isFetchingBranches]);

	const isLoading = isConnectingNetwork || isFetchingBranches;

	return (
		<>
			<Helmet
				title={`${
					getAppType() === appTypes.BACK_OFFICE
						? 'EJJY Back Office'
						: 'EJJY Head Office'
				} (v${npmPackage.version})`}
			/>

			<PageInformation />

			<AppIcons />

			<Spin
				className="GlobalSpinner"
				spinning={isLoading}
				style={{ width: '100vw', height: '100vh' }}
				tip={getLoadingMessage()}
			>
				<Switch>
					<NoAuthRoute component={Login} path="/login" exact />

					<NoAuthRoute
						component={NetworkError}
						path="/error"
						exact
						noRedirects
					/>
					<CommonRoute
						forUserType={userTypes.ADMIN}
						isLoading={isLoading}
						path="/admin"
						render={(props) => <Admin {...props} />}
					/>

					<CommonRoute
						forUserType={userTypes.OFFICE_MANAGER}
						isLoading={isLoading}
						path="/office-manager"
						render={(props) => <OfficeManager {...props} />}
					/>

					<CommonRoute
						forUserType={userTypes.BRANCH_MANAGER}
						isLoading={isLoading}
						path="/branch-manager"
						render={(props) => <BranchManager {...props} />}
					/>

					<CommonRoute
						forUserType={userTypes.BRANCH_PERSONNEL}
						isLoading={isLoading}
						path="/branch-personnel"
						render={(props) => <BranchPersonnel {...props} />}
					/>

					<Redirect from="/" to="/login" />
				</Switch>
			</Spin>
		</>
	);
};

export default App;
