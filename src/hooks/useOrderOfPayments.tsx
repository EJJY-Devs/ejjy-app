import { isUserFromBranch } from 'ejjy-global';
import { useMutation } from 'react-query';
import { OrderOfPaymentsService } from 'services';
import { useUserStore } from 'stores';
import { getLocalApiUrl, getOnlineApiUrl } from 'utils';

export const useOrderOfPaymentsCreate = (options = {}) => {
	const user = useUserStore((state) => state.user);

	return useMutation<any, any, any>(
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
					amount,
					purpose,
					extra_description: extraDescription,
					charge_sales_transaction_id: chargeSalesTransactionId,
				},
				isUserFromBranch(user.user_type) ? getLocalApiUrl() : getOnlineApiUrl(),
				// getLocalApiUrl(), //TODO: For demo purposes, once upload to gcloud is enabled, revert to online API URL
			),
		options,
	);
};
