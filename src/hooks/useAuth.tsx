import { APP_KEY } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery } from 'react-query';
import { useHistory } from 'react-router';
import storage from 'redux-persist/lib/storage';
import { AuthService } from 'services';
import { useUserStore } from 'stores';
import { getLocalApiUrl } from 'utils';

const AUTH_CHECKING_INTERVAL_MS = 10_000;

export const useAuthLogin = () =>
	useMutation<any, any, any>(({ pin }) =>
		AuthService.login(
			{
				pin,
			},
			getLocalApiUrl(),
		),
	);

export const useAuthLogout = () => {
	const history = useHistory();
	const resetUser = useUserStore((state) => state.resetUser);

	return useMutation<any, any, any>(
		(id) => AuthService.logout(id, getLocalApiUrl()),
		{
			onSuccess: () => {
				history.replace('login');

				storage.removeItem(APP_KEY);
				resetUser();
			},
		},
	);
};

export const useAuthLoginCountChecker = ({ id, params, options }: Query) => {
	const { mutateAsync: logout } = useAuthLogout();

	return useQuery<any>(
		['useAuthLoginCountChecker', id, params.loginCount],
		() => wrapServiceWithCatch(AuthService.retrieve(id, getLocalApiUrl())),
		{
			enabled: !!id,
			refetchInterval: AUTH_CHECKING_INTERVAL_MS,
			refetchIntervalInBackground: true,
			notifyOnChangeProps: [],
			onSuccess: async ({ data }) => {
				const { loginCount } = params;
				const newLoginCount = data.login_count;

				if (loginCount !== newLoginCount) {
					await logout(id);
				}
			},
			...options,
		},
	);
};
