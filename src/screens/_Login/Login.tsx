import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '../../components/elements';
import { request } from '../../global/types';
import { useAuth } from '../../hooks/useAuth';
import { IFormValues, LoginForm } from './components/LoginForm';
import './style.scss';

const Login = () => {
	// CUSTOM HOOKS
	const { pathname: pathName } = useLocation();
	const { login, status, errors } = useAuth();

	// METHODS
	const onSubmit = (data: IFormValues) => {
		login({
			...data,
			isFromBranch: pathName === '/login/branch',
		});
	};

	return (
		<section className="Login">
			<Box className="container">
				<img src={require('../../assets/images/logo.jpg')} alt="logo" className="logo" />

				<LoginForm onSubmit={onSubmit} loading={status === request.REQUESTING} errors={errors} />
			</Box>
		</section>
	);
};

export default Login;
