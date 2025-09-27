import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { wrapServiceWithCatch } from 'hooks/helper';
import { Query } from 'hooks/inteface';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProductsService } from 'services';
import {
	getGoogleApiUrl,
	getLocalApiUrl,
	getOnlineApiUrl,
	isStandAlone,
} from 'utils';

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
		async ({
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
		}: any) => {
			const baseURL = isStandAlone() ? getLocalApiUrl() : getGoogleApiUrl();
			const result = await ProductsService.create(
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
				baseURL,
			);

			// If using Google API (standalone), trigger background sync
			if (isStandAlone()) {
				// Don't wait for this - let it run in background
				setTimeout(() => {
					queryClient.invalidateQueries('useOfflineBulkIds');
				}, 100);
			}

			return result;
		},
		{
			onSuccess: (newProduct) => {
				// Immediately update the products cache with the new product
				queryClient.setQueryData(['useProducts'], (oldData: any) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						products: [newProduct.data, ...(oldData.products || [])],
						total: (oldData.total || 0) + 1,
					};
				});

				// Also invalidate to ensure fresh data on next fetch
				queryClient.invalidateQueries('useProducts');
			},
		},
	);
};

export const useProductReinitialize = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		async (data) => {
			const baseURL = isStandAlone() ? getLocalApiUrl() : getGoogleApiUrl();
			const result = await ProductsService.reinitialize(data, baseURL);

			// If using Google API (standalone), trigger background sync
			if (isStandAlone()) {
				// Don't wait for this - let it run in background
				setTimeout(() => {
					queryClient.invalidateQueries('useOfflineBulkIds');
				}, 100);
			}

			return result;
		},
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
		async ({
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
		}: any) => {
			const baseURL = isStandAlone() ? getLocalApiUrl() : getGoogleApiUrl();
			const result = await ProductsService.edit(
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
				baseURL,
			);

			// If using Google API (standalone), trigger background sync
			if (isStandAlone()) {
				// Don't wait for this - let it run in background
				setTimeout(() => {
					queryClient.invalidateQueries('useOfflineBulkIds');
				}, 100);
			}

			return result;
		},
		{
			onSuccess: (updatedProduct, { id }) => {
				// Immediately update the products cache with the edited product
				queryClient.setQueryData(['useProducts'], (oldData: any) => {
					if (!oldData) return oldData;

					const updatedProducts = (oldData.products || []).map((product: any) =>
						product.id === id
							? { ...product, ...updatedProduct.data }
							: product,
					);

					return {
						...oldData,
						products: updatedProducts,
					};
				});

				// Also invalidate to ensure fresh data on next fetch
				queryClient.invalidateQueries('useProducts');
			},
		},
	);
};

export const useProductDelete = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		async ({ id, actingUserId }) => {
			const baseURL = isStandAlone() ? getLocalApiUrl() : getGoogleApiUrl();
			const result = await ProductsService.delete(
				id,
				{ acting_user_id: actingUserId },
				baseURL,
			);

			// If using Google API (standalone), trigger background sync
			if (isStandAlone()) {
				// Don't wait for this - let it run in background
				setTimeout(() => {
					queryClient.invalidateQueries('useOfflineBulkIds');
				}, 100);
			}

			return result;
		},
		{
			onSuccess: (_, { id }) => {
				// Immediately remove the product from the cache
				queryClient.setQueryData(['useProducts'], (oldData: any) => {
					if (!oldData) return oldData;

					const filteredProducts = (oldData.products || []).filter(
						(product: any) => product.id !== id,
					);

					return {
						...oldData,
						products: filteredProducts,
						total: Math.max((oldData.total || 0) - 1, 0),
					};
				});

				// Also invalidate to ensure fresh data on next fetch
				queryClient.invalidateQueries('useProducts');
			},
		},
	);
};

export const useProductEditLocal = () => {
	const queryClient = useQueryClient();

	return useMutation<any, any, any>(
		async ({
			id,
			actingUserId,
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
		}: any) => {
			// Always use Google API for manual sync
			const result = await ProductsService.edit(
				id,
				{
					acting_user_id: actingUserId,
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
					max_balance: maxBalance,
					name,
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
				getOnlineApiUrl(),
			);

			return result;
		},
		{
			onSuccess: () => {
				// Invalidate queries to refresh data
				queryClient.invalidateQueries('useProducts');
				queryClient.invalidateQueries('useBranchProducts');
			},
		},
	);
};

export default useProducts;
