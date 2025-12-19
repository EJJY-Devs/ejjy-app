import { Button, Divider } from 'antd';
import { AppSettingsModal } from 'components';
import { Box } from 'components/elements';
import { getKeyDownCombination } from 'ejjy-global';
import { IS_APP_LIVE, appTypes, userTypes } from 'global';
import { useAuthLogin, useSiteSettings } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getAppType,
	getLocalApiUrl,
	getOnlineApiUrl,
} from 'utils';
import { LoginForm } from './components/LoginForm';
import './style.scss';

const Login = () => {
	// STATES
	const [appSettingsModalVisible, setAppSettingsModalVisible] = useState(false);
	const [isSetupButtonsVisible, setSetupButtonsVisible] = useState(false);
	const [error, setError] = useState('');
	const setUser = useUserStore((state) => state.setUser);

	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettings();
	const {
		mutateAsync: login,
		isLoading: isLoggingIn,
		error: loginError,
	} = useAuthLogin();

	// METHODS
	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	useEffect(() => {
		if (!getLocalApiUrl() || !getOnlineApiUrl()) {
			setAppSettingsModalVisible(true);
			setSetupButtonsVisible(true);
		}
	}, []);

	const handleKeyDown = (event) => {
		const key = getKeyDownCombination(event);

		if (['meta+s', 'ctrl+s'].includes(key) && !IS_APP_LIVE) {
			event.preventDefault();
			setSetupButtonsVisible((value) => !value);
		}
	};

	const handleSubmit = async (formData) => {
		const { data: user } = await login(formData);

		const appType = getAppType();
		const userType = user.user_type;

		if (
			appType === appTypes.HEAD_OFFICE &&
			(userType === userTypes.BRANCH_MANAGER ||
				userType === userTypes.BRANCH_PERSONNEL)
		) {
			setError('Admin and office manager can only use this app.');
			return;
		}

		if (
			appType === appTypes.BACK_OFFICE &&
			userType !== userTypes.BRANCH_MANAGER &&
			userType !== userTypes.BRANCH_PERSONNEL
		) {
			setError('Branch managers and personnels can only use this app.');
			return;
		}

		setUser(user);
	};

	return (
		<section className="Login">
			<Box className="container">
				<img alt="logo" className="logo" src={siteSettings?.logo_base64} />

				<LoginForm
					errors={[
						...convertIntoArray(error),
						...convertIntoArray(loginError?.errors),
					]}
					loading={isLoggingIn}
					onSubmit={handleSubmit}
				/>

				{isSetupButtonsVisible && (
					<>
						<Divider />

						<Button block onClick={() => setAppSettingsModalVisible(true)}>
							Configure App Settings
						</Button>

						{appSettingsModalVisible && (
							<AppSettingsModal
								onClose={() => setAppSettingsModalVisible(false)}
								onSuccess={() => {
									window.location.reload();
								}}
							/>
						)}
					</>
				)}
			</Box>
		</section>
	);
};

export default Login;
