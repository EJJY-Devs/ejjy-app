import axios from 'axios';
import { flatten, values } from 'lodash';
import { actions as authActions, key as AUTH_KEY } from './ducks/auth';
import { API_TIMEOUT, API_URL, NO_VERIFICATION_NEEDED } from './services';

const VERIFY_TOKEN_URL = `${API_URL}/tokens/access/verify/`;
const RENEW_ACCESS_TOKEN_URL = `${API_URL}/tokens/renew/`;

const tokenResponseStatuses = {
	INVALID: 'token_not_valid',
};

export default function configureAxios(store: any) {
	axios.defaults.baseURL = API_URL;
	axios.defaults.timeout = API_TIMEOUT;

	// add a request interceptor to all the axios requests
	// that are going to be made in the site. The purpose
	// of this interceptor is to verify if the access token
	// is still valid and renew it if needed and possible
	axios.interceptors.request.use(
		// eslint-disable-next-line func-names
		function (config) {
			// if there's no verification needed, just exit immediately
			if (NO_VERIFICATION_NEEDED === config.params) {
				return config;
			}

			// since there's no `connect` HOC, this is how we
			// access the store (or reducer)
			const state = store.getState();
			const { accessToken } = state[AUTH_KEY];

			// Get access token from store for every api request
			config.headers.authorization = accessToken ? `Bearer ${accessToken}` : null;

			return config;
		},
		function (error) {
			return Promise.reject(error);
		},
	);

	axios.interceptors.response.use(null, (error) => {
		if (error.config && error.response && error.response.status === 401) {
			// Get refresh token when 401 response status
			const state = store.getState();
			const { refreshToken } = state[AUTH_KEY];

			if (!refreshToken) {
				store.dispatch(authActions.logout());
				return;
			}

			// We are certain that the access token already expired.
			// We'll check if REFRESH TOKEN has also expired.
			return fetch(VERIFY_TOKEN_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: refreshToken }),
			})
				.then((res) => res.json())
				.then((tokenStatus) => {
					if (tokenStatus?.code === tokenResponseStatuses.INVALID) {
						// if the REFRESH TOKEN has already expired as well, logout the user
						// and throw an error to exit this Promise chain
						store.dispatch(authActions.logout());
						throw new Error('refresh token has already expired');
					}

					// If the REFRESH TOKEN is still active, renew the ACCESS TOKEN and the REFRESH TOKEN
					return fetch(RENEW_ACCESS_TOKEN_URL, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ refresh: refreshToken }),
					});
				})
				.then((res) => res.json())
				.then(({ access, refresh }) => {
					// store the NEW ACCESS TOKEN and NEW REFRESH TOKEN to the reducer
					store.dispatch(
						authActions.save({
							accessToken: access,
							refreshToken: refresh,
						}),
					);
					// Modify the Authorization Header using the NEW ACCESS TOKEN
					error.config.headers.authorization = `Bearer ${access}`;
					return axios.request(error.config);
				})
				.catch(() => Promise.reject(error));
		}

		const modifiedError = { ...error };

		if (error.isAxiosError) {
			if (typeof error.response.data === 'string') {
				modifiedError.errors = [error.response.data];
			} else {
				modifiedError.errors = flatten(values(error.response.data));
			}
		}

		return Promise.reject(modifiedError);
	});
}
