import { appTypes, userTypes } from 'global';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useUserStore } from 'stores';
import { getAppType } from 'utils';

interface Props {
	forUserType: string;
	isLoading: boolean;
	path: string;
	render?: any;
}

export const CommonRoute = ({ forUserType, isLoading, ...rest }: Props) => {
	const user = useUserStore((state) => state.user);

	if (isLoading) {
		return null;
	}

	// Allow Backoffice to access branch-manager routes without authentication
	if (
		getAppType() === appTypes.BACK_OFFICE &&
		forUserType === userTypes.BRANCH_MANAGER
	) {
		return <Route {...rest} />;
	}

	if (user?.user_type === forUserType) {
		return <Route {...rest} />;
	}

	return <Redirect to="/404" />;
};
