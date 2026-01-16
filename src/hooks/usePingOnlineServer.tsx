import { appTypes, headOfficeTypes } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { SiteSettingsService } from 'services';
import { useUserStore } from 'stores';
import {
	getAppType,
	getHeadOfficeType,
	getLocalApiUrl,
	getOnlineApiUrl,
	isStandAlone,
} from 'utils';

const usePingOnlineServer = () => {
	// STATES
	const [isEnabled, setIsEnabled] = useState(false);
	const [isConnected, setIsConnected] = useState(null);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);

	useQuery(
		['usePingOnlineServer', isEnabled],
		() => wrapServiceWithCatch(SiteSettingsService.retrieve(getOnlineApiUrl())),
		{
			enabled: isEnabled,
			notifyOnChangeProps: ['data'],
			refetchInterval: 10000,
			onSettled: (_data, error) => {
				setIsConnected(!error);
			},
		},
	);

	useEffect(() => {
		const localApiUrl = getLocalApiUrl();
		const onlineApiUrl = getOnlineApiUrl();
		const appType = getAppType();
		const headOfficeType = getHeadOfficeType();

		// Don't ping if:
		// 1. No URLs configured
		// 2. Standalone mode
		// 3. Back office
		// 4. Not-Main HO (uses ngrok URL as local API, shouldn't ping itself)
		if (
			localApiUrl &&
			onlineApiUrl &&
			!isStandAlone() &&
			appType !== appTypes.BACK_OFFICE &&
			!(
				appType === appTypes.HEAD_OFFICE &&
				headOfficeType === headOfficeTypes.NOT_MAIN
			)
		) {
			setIsEnabled(true);
		}
	}, [user]);

	return { isConnected };
};

export default usePingOnlineServer;
