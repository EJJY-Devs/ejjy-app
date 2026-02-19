import { useMutation } from 'react-query';
import { OrderOfPaymentsService } from 'services';
import { getLocalApiUrl, getLocalBranchId } from 'utils';

export const useOrderOfPaymentsCreate = (options = {}) =>
	useMutation<any, any, any>(
		({
			createdById,
			payorId,
			amount,
			purpose,
			extraDescription,
			chargeSalesTransactionId,
		}: any) =>
			OrderOfPaymentsService.create(
				{
					created_by_id: createdById,
					payor_id: payorId,
					branch_id: getLocalBranchId()
						? Number(getLocalBranchId())
						: undefined,
					amount,
					purpose,
					extra_description: extraDescription,
					charge_sales_transaction_id: chargeSalesTransactionId,
				},
				getLocalApiUrl(),
			),
		options,
	);
