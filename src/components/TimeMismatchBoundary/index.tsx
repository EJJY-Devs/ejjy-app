/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Button, Result } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { useBranchMachines, useSiteSettings } from 'hooks';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import './style.scss';

export const TimeMismatchBoundary = () => {
	// VARIABLES
	const MINUTES_DIFFERENCE = 2;
	const REFETCH_INTERVAL_MS = 5000;
	const TIME_API_BASE_URL = 'https://worldtimeapi.org/';

	// STATES
	const [isCheckingAgain, setIsCheckingAgain] = useState(false);
	const [hasMismatch, setHasMismatch] = useState(false);

	// CUSTOM HOOKS
	const {
		data: { branchMachines },
		isFetched: isBranchMachinesFetched,
	} = useBranchMachines();
	const {
		data: siteSettings,
		isFetched: isSiteSettingsFetched,
	} = useSiteSettings({
		options: { notifyOnChangeProps: ['data', 'isFetched'] },
	});

	// METHODS
	const tryServerTime = async (baseURL: string) => {
		if (!baseURL) return null;

		const endpoints = ['/server/time/', '/v1/server/time/'];

		for (const endpoint of endpoints) {
			try {
				const response = await axios.get(endpoint, {
					baseURL,
					timeout: 4000,
				});
				return response;
			} catch (e) {
				// Try next endpoint variant.
			}
		}

		return null;
	};

	const serviceFn = async () => {
		try {
			// Use branch machine URLs as the primary source.
			for (const branchMachine of branchMachines) {
				const response = await tryServerTime(branchMachine.server_url);
				if (response) return response;
			}

			// Last fallback: public timezone API.
			return await axios.get('/api/timezone/Asia/Manila/', {
				baseURL: TIME_API_BASE_URL,
				timeout: 4000,
			});
		} catch (e) {
			return null;
		}
	};

	const handleSuccessCheck = (response) => {
		if (response) {
			let retrievedDate = null;

			if (response.config.baseURL === TIME_API_BASE_URL) {
				retrievedDate = dayjs(response.data.datetime);
			} else {
				retrievedDate = dayjs.tz(response.data);
			}

			setHasMismatch(
				retrievedDate?.isValid() &&
					Math.abs(dayjs().diff(retrievedDate, 'minutes')) >=
						MINUTES_DIFFERENCE,
			);
		}
	};

	useQuery<any>(
		['time', hasMismatch, siteSettings?.is_time_checker_feature_enabled],
		serviceFn,
		{
			enabled:
				siteSettings?.is_time_checker_feature_enabled === true &&
				!hasMismatch &&
				isSiteSettingsFetched &&
				isBranchMachinesFetched,
			retry: false,
			refetchInterval: REFETCH_INTERVAL_MS,
			refetchIntervalInBackground: true,
			notifyOnChangeProps: ['data'],
			onSuccess: handleSuccessCheck,
		},
	);

	return hasMismatch ? (
		<div className="TimeMismatchBoundary">
			<Result
				extra={[
					<Button
						key="btn"
						loading={isCheckingAgain}
						type="primary"
						onClick={() => {
							setIsCheckingAgain(true);
							serviceFn()
								.then(handleSuccessCheck)
								.finally(() => {
									setIsCheckingAgain(false);
								});
						}}
					>
						Check again
					</Button>,
				]}
				status="error"
				subTitle="The machine's time does not match the Philippine Standard Time."
				title="Time Mismatch"
			/>
		</div>
	) : null;
};
