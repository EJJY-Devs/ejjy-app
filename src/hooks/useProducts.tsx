import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProductsService } from 'services';
import { getGoogleApiUrl, getLocalApiUrl, isStandAlone } from 'utils';

const useProducts = ({ params, options }: Query) =>
	useQuery<any>(
		[
			'useProducts',
			params?.branchId,
			params?.ids,
			params?.page,
			params?.pageSize,
			params?.productCategory,
			params?.search,
		],
		() => {
			const service = isStandAlone()
				? ProductsService.list
				: ProductsService.listOffline;

			return wrapServiceWithCatch(
				service(
					{
						branch_id: params?.branchId,
						ids: params?.ids,
						page_size: params?.pageSize || DEFAULT_PAGE_SIZE,
						page: params?.page || DEFAULT_PAGE,
						product_category: params?.productCategory,
						search: params?.search,
					},
					getLocalApiUrl(),
				),
			);
		},
		{
			initialData: { data: { results: [], count: 0 } },
			select: (query) => ({
				products: query.data.results,
				total: query.data.count,
			}),
			...options,
		},
	);

export const useProductCreate = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			actingUserId,
			allowableSpoilage,
			barcode,
			conversionAmount,
			costPerBulk,
			costPerPiece,
			description,
			hasQuantityAllowance,
			isDailyChecked,
			isRandomlyChecked,
			isShownInScaleList,
			isSoldInBranch,
			isVatExempted,
			maxBalance,
			name,
			// packingBarcode,
			// packingBarcodeUnitOfMeasurement,
			piecesInBulk,
			pointSystemTagId,
			pricePerBulk,
			pricePerPiece,
			printDetails,
			priceTagPrintDetails,
			productCategory,
			reorderPoint,
			sellingBarcode,
			sellingBarcodeUnitOfMeasurement,
			textcode,
			type,
			unitOfMeasurement,
			wholeSalePrice,
			creditPrice,
			specialPrice,
			scaleCode,
			isMultipleInstance,
		}: any) =>
			ProductsService.create(
				{
					acting_user_id: actingUserId,
					allowable_spoilage: allowableSpoilage,
					scale_code: scaleCode,
					barcode,
					conversion_amount: conversionAmount,
					cost_per_bulk: costPerBulk,
					cost_per_piece: costPerPiece,
					description,
					has_quantity_allowance: hasQuantityAllowance,
					is_daily_checked: isDailyChecked,
					is_randomly_checked: isRandomlyChecked,
					is_shown_in_scale_list: isShownInScaleList,
					is_sold_in_branch: isSoldInBranch,
					is_vat_exempted: isVatExempted,
					max_balance: maxBalance,
					name,
					// packing_barcode_unit_of_measurement: packingBarcodeUnitOfMeasurement,
					// packing_barcode: packingBarcode,
					is_multiple_instance: isMultipleInstance,
					pieces_in_bulk: piecesInBulk,
					point_system_tag_id: pointSystemTagId || undefined,
					price_per_bulk: pricePerBulk,
					price_per_piece: pricePerPiece,
					print_details: printDetails,
					price_tag_print_details: priceTagPrintDetails,
					product_category: productCategory,
					reorder_point: reorderPoint,
					selling_barcode_unit_of_measurement: sellingBarcodeUnitOfMeasurement,
					selling_barcode: sellingBarcode,
					textcode,
					type,
					unit_of_measurement: unitOfMeasurement,
					wholesale_price: wholeSalePrice,
					credit_price: creditPrice,
					special_price: specialPrice,
				},
				getGoogleApiUrl(), // TODO: Need to change this to accomodate if standalone. Dapat mu-send sa online api if standalone
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProducts');
			},
		},
	);
};

export const useProductReinitialize = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		(data) => ProductsService.reinitialize(data, getGoogleApiUrl()),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProducts');
			},
		},
	);
};

export const useProductEdit = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({
			id,
			actingUserId,
			// allowableSpoilage,
			barcode,
			conversionAmount,
			costPerBulk,
			costPerPiece,
			description,
			hasQuantityAllowance,
			isDailyChecked,
			isRandomlyChecked,
			isShownInScaleList,
			isSoldInBranch,
			isVatExempted,
			// markdownPricePerBulk1,
			// markdownPricePerBulk2,
			// markdownPricePerPiece1,
			// markdownPricePerPiece2,
			maxBalance,
			name,
			// packingBarcode,
			// packingBarcodeUnitOfMeasurement,
			piecesInBulk,
			pointSystemTagId,
			pricePerBulk,
			pricePerPiece,
			priceTagPrintDetails,
			printDetails,
			productCategory,
			reorderPoint,
			sellingBarcode,
			sellingBarcodeUnitOfMeasurement,
			textcode,
			type,
			unitOfMeasurement,
			wholeSalePrice,
			creditPrice,
			specialPrice,
			isMultipleInstance,
			scaleCode,
		}: any) =>
			ProductsService.edit(
				id,
				{
					acting_user_id: actingUserId,
					// allowable_spoilage: allowableSpoilage,
					scale_code: scaleCode,
					barcode: barcode || undefined,
					conversion_amount: conversionAmount,
					cost_per_bulk: costPerBulk,
					cost_per_piece: costPerPiece,
					description,
					has_quantity_allowance: hasQuantityAllowance,
					is_daily_checked: isDailyChecked,
					is_randomly_checked: isRandomlyChecked,
					is_shown_in_scale_list: isShownInScaleList,
					is_sold_in_branch: isSoldInBranch,
					is_multiple_instance: isMultipleInstance,
					is_vat_exempted: isVatExempted,
					// markdown_price_per_bulk1: markdownPricePerBulk1,
					// markdown_price_per_bulk2: markdownPricePerBulk2,
					// markdown_price_per_piece1: markdownPricePerPiece1,
					// markdown_price_per_piece2: markdownPricePerPiece2,
					max_balance: maxBalance,
					name,
					// packing_barcode_unit_of_measurement: packingBarcodeUnitOfMeasurement,
					// packing_barcode: packingBarcode || undefined,
					pieces_in_bulk: piecesInBulk,
					point_system_tag_id: pointSystemTagId || undefined,
					price_per_bulk: pricePerBulk,
					price_per_piece: pricePerPiece,
					price_tag_print_details: priceTagPrintDetails,
					print_details: printDetails,
					product_category: productCategory,
					reorder_point: reorderPoint,
					selling_barcode_unit_of_measurement: sellingBarcodeUnitOfMeasurement,
					selling_barcode: sellingBarcode || undefined,
					textcode,
					type,
					unit_of_measurement: unitOfMeasurement,
					wholesale_price: wholeSalePrice,
					credit_price: creditPrice,
					special_price: specialPrice,
				},
				getGoogleApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProducts');
			},
		},
	);
};

export const useProductDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		({ id, actingUserId }) =>
			ProductsService.delete(
				id,
				{ acting_user_id: actingUserId },
				getGoogleApiUrl(),
			),
		{
			onSuccess: () => {
				queryClient.invalidateQueries('useProducts');
			},
		},
	);
};

export default useProducts;
