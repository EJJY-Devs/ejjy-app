/* eslint-disable react-hooks/exhaustive-deps */
import { notification, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IS_LIVE_APP } from '../../global/constants';
import { request, userTypes } from '../../global/types';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../OfficeManager/hooks/useBranches';
import './style.scss';

const Landing = () => {
	const history = useHistory();

	const { user } = useAuth();
	const { getBranches, status: getBranchesStatus } = useBranches();

	useEffect(() => {
		if (user) {
			if (user.active_sessions_count > 1) {
				notification.error({
					duration: null,
					message: 'Account Notification',
					description: 'Someone else was using this account.',
				});
			}

			switch (user?.user_type) {
				case userTypes.OFFICE_MANAGER: {
					getBranches();
					break;
				}
				case userTypes.BRANCH_MANAGER: {
					if (IS_LIVE_APP) {
						getBranches();
					}
					break;
				}
				case userTypes.BRANCH_PERSONNEL: {
					if (IS_LIVE_APP) {
						getBranches();
					}
					break;
				}
			}
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			switch (user?.user_type) {
				case userTypes.ADMIN: {
					history.replace('/dashboard');
					break;
				}
				case userTypes.OFFICE_MANAGER: {
					redirectOfficeManager();
					break;
				}
				case userTypes.BRANCH_MANAGER: {
					redirectBranchManager();
					break;
				}
				case userTypes.BRANCH_PERSONNEL: {
					redirectBranchPersonel();
					history.replace('/dashboard');
					break;
				}
			}
		}
	}, [user, getBranchesStatus]);

	const redirectOfficeManager = () => {
		const requests = [getBranchesStatus];

		if (requests.includes(request.REQUESTING)) {
			return;
		} else if (requests.every((value) => value === request.SUCCESS)) {
			history.replace('/dashboard');
		} else if (requests.some((value) => value === request.ERROR)) {
			history.replace('/404');
		}
	};

	const redirectBranchManager = () => {
		if (!IS_LIVE_APP) {
			history.replace('/dashboard');
			return;
		}

		const requests = [getBranchesStatus];

		if (requests.includes(request.REQUESTING)) {
			return;
		} else if (requests.every((value) => value === request.SUCCESS)) {
			history.replace('/dashboard');
		} else if (requests.some((value) => value === request.ERROR)) {
			history.replace('/404');
		}
	};

	const redirectBranchPersonel = () => {
		if (!IS_LIVE_APP) {
			history.replace('/dashboard');
			return;
		}

		const requests = [getBranchesStatus];

		if (requests.includes(request.REQUESTING)) {
			return;
		} else if (requests.every((value) => value === request.SUCCESS)) {
			history.replace('/dashboard');
		} else if (requests.some((value) => value === request.ERROR)) {
			history.replace('/404');
		}
	};

	return (
		<section className="Landing">
			<Spin size="large" tip="Fetching data..." />
		</section>
	);
};

export default Landing;
