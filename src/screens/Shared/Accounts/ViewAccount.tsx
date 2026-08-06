import { Spin } from 'antd';
import { Breadcrumb, Content, RequestErrors } from 'components';
import { Box } from 'components/elements';
import { getFullName } from 'ejjy-global';
import { useAccountRetrieve, useQueryParams } from 'hooks';
import React, { useCallback } from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray, getUrlPrefix } from 'utils';
import { AccountDetails } from './components/ViewAccount/AccountDetails';
import { PointTransactions } from './components/ViewAccount/PointTransactions';
import { accountTabs } from './data';

interface Props {
	match: any;
}

export const ViewAccount = ({ match }: Props) => {
	// VARIABLES
	const accountId = match?.params?.id;

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { params } = useQueryParams();
	const {
		data: account,
		isFetching: isFetchingAccount,
		error: accountErrors,
	} = useAccountRetrieve({
		id: accountId,
		options: { enabled: !!accountId },
	});

	// METHODS
	const getBreadcrumbItems = useCallback(() => {
		const accountsLink =
			match?.url?.split('/').slice(0, -1).join('/') ||
			`${getUrlPrefix(user.user_type)}/accounts`;

		if (
			params.tab === accountTabs.SUPPLIER_ACCOUNTS ||
			params.tab === accountTabs.CREDIT_ACCOUNTS
		) {
			return [
				{ name: 'Accounts', link: accountsLink },
				{
					name: params.tab,
					link: `${accountsLink}?tab=${params.tab}`,
				},
				{ name: getFullName(account) },
			];
		}

		return [
			{ name: 'Accounts', link: accountsLink },
			{ name: getFullName(account) },
		];
	}, [account, match, params.tab]);

	return (
		<Content
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			title="[VIEW] Account"
		>
			<Spin spinning={isFetchingAccount}>
				<Box padding>
					<RequestErrors
						errors={convertIntoArray(accountErrors)}
						withSpaceBottom
					/>

					{account && <AccountDetails account={account} />}
				</Box>

				{account && account?.is_point_system_eligible && (
					<PointTransactions account={account} />
				)}
			</Spin>
		</Content>
	);
};
