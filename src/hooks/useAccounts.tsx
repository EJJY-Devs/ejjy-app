import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery } from 'react-query';
import { AccountsService } from 'services';
import { getLocalApiUrl, getOnlineApiUrl, isStandAlone } from 'utils';

const useAccounts = ({ params }: Query) =>
	useQuery<any>(
		[
			'useAccounts',
			params?.page,
			params?.pageSize,
			params?.search,
			params?.serviceType,
			params?.type,
			params?.withCreditRegistration,
			params?.withSupplierRegistration,
		],
		() => {
			const service = isStandAlone()
				? AccountsService.list
				: AccountsService.listOffline;

			return wrapServiceWithCatch(
				service(
					{
						page: params?.page || DEFAULT_PAGE,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						search: params?.search,
						type: params?.type,
						with_credit_registration: params?.withCreditRegistration,
						with_supplier_registration: params?.withSupplierRegistration,
					},
					getLocalApiUrl(),
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				accounts: query.data.results,
				total: query.data.count,
			}),
		},
	);

export const useAccountRetrieve = ({ id, options }: Query) =>
	useQuery<any>(
		['useAccountRetrieve', id],
		() => wrapServiceWithCatch(AccountsService.retrieve(id, getLocalApiUrl())),
		{
			select: (query) => query.data,
			...options,
		},
	);

export const useAccountCreate = () =>
	useMutation<any, any, any>(
		({
			biodataImage,
			birthday,
			businessAddress,
			businessName,
			civilStatus,
			contactNumber,
			emailAddress,
			fatherName,
			firstName,
			gender,
			homeAddress,
			isPointSystemEligible,
			lastName,
			middleName,
			motherMaidenName,
			nationality,
			placeOfBirth,
			religion,
			tin,
			type,
			pin,
		}: any) =>
			AccountsService.create(
				{
					biodata_image: biodataImage,
					birthday,
					business_address: businessAddress,
					business_name: businessName,
					civil_status: civilStatus,
					contact_number: contactNumber,
					email_address: emailAddress,
					father_name: fatherName,
					first_name: firstName,
					gender,
					home_address: homeAddress,
					is_point_system_eligible: isPointSystemEligible,
					last_name: lastName,
					middle_name: middleName,
					mother_maiden_name: motherMaidenName,
					nationality,
					place_of_birth: placeOfBirth,
					religion,
					tin,
					type,
					pin,
				},
				getOnlineApiUrl(),
			),
	);

export const useAccountEdit = () =>
	useMutation<any, any, any>(
		({
			id,
			biodataImage,
			birthday,
			businessAddress,
			businessName,
			civilStatus,
			contactNumber,
			emailAddress,
			fatherName,
			firstName,
			gender,
			homeAddress,
			isPointSystemEligible,
			lastName,
			middleName,
			motherMaidenName,
			nationality,
			placeOfBirth,
			religion,
			tin,
			type,
			pin,
		}: any) =>
			AccountsService.edit(
				id,
				{
					biodata_image: biodataImage,
					birthday,
					business_address: businessAddress,
					business_name: businessName,
					civil_status: civilStatus,
					contact_number: contactNumber,
					email_address: emailAddress,
					father_name: fatherName,
					first_name: firstName,
					gender,
					home_address: homeAddress,
					is_point_system_eligible: isPointSystemEligible,
					last_name: lastName,
					middle_name: middleName,
					mother_maiden_name: motherMaidenName,
					nationality,
					place_of_birth: placeOfBirth,
					religion,
					tin,
					type,
					pin,
				},
				getOnlineApiUrl(),
			),
	);

export const useAccountRedeemPoints = () =>
	useMutation<any, any, any>(
		({ id, redeemedPoints, redeemAuthorizerId, redeemRemarks }: any) =>
			AccountsService.redeemPoints(
				id,
				{
					redeem_authorizer_id: redeemAuthorizerId,
					redeem_remarks: redeemRemarks,
					redeemed_points: redeemedPoints,
				},
				getOnlineApiUrl(),
			),
	);

export const useCreditLogs = ({ options }: Query = {}) =>
	useQuery<any>(
		['useCreditLogs'],
		() => wrapServiceWithCatch(AccountsService.creditLogs(getLocalApiUrl())),
		{
			initialData: { data: [] },
			select: (query) => ({
				creditLogs: query.data,
			}),
			...options,
		},
	);

export default useAccounts;
