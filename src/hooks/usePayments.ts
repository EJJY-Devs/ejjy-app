import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, timeRangeTypes } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { useQuery } from 'react-query';
import { PaymentsService } from 'services';
import { getLocalApiUrl } from 'utils';
import { Query } from './inteface';

export const usePaymentsSummary = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useTransactionsSummary',
			params?.branchMachineId,
			params?.statuses,
			params?.timeRange,
		],
		() =>
			wrapServiceWithCatch(
				PaymentsService.summary(
					{
						branch_machine_id: params?.branchMachineId,
						statuses: params?.statuses,
						time_range: params?.timeRange || timeRangeTypes.DAILY,
					},
					getLocalApiUrl(),
				),
			),
		{
			select: (query) => ({
				summary: query?.data,
			}),
			...options,
		},
	);

export default usePaymentsSummary;
