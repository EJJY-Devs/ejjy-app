import { appTypes, userTypes } from 'global';
import React from 'react';
import { useUserStore } from 'stores';
import { getAppType } from 'utils';
import { VoidedTransactionsTable } from './VoidedTransactionsTable';

interface Props {
	/**
	 * When provided the table is scoped to this branch (BO usage).
	 * When omitted, HO can pick a branch via the filter.
	 */
	branchId?: number;
}

export const TabVoidedTransactions = ({ branchId }: Props) => {
	const user = useUserStore((state) => state.user);
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	// HO Admin can create adjustment slips; all other roles are view-only.
	const showCreateAction =
		isHeadOffice && user.user_type === userTypes.OFFICE_MANAGER;

	return (
		<VoidedTransactionsTable
			branchId={branchId}
			showBranchColumn={isHeadOffice}
			showCreateAction={showCreateAction}
		/>
	);
};
