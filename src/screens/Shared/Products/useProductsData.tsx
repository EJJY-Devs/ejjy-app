import { serviceTypes, appTypes } from 'global';
import { useBranchProducts, useProducts } from 'hooks';
import { useEffect, useState } from 'react';
import { getLocalBranchId, getAppType } from 'utils';

export const useProductsData = ({ params, user }) => {
	const [dataSource, setDataSource] = useState([]);
	// Tracks whether the very first fetch has completed. Background syncing
	// (useInitializeData) invalidates the products queries every ~10s, and
	// some other poller in the tree (branch ping, notification counts, etc.)
	// is enough to re-render this screen mid-refetch and pick up a "live"
	// isFetching=true even though we don't render on our own query's
	// isFetching changes. Once the first load is done, never surface
	// isFetching as true again so those background refetches stay silent.
	const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

	const {
		data: { products, total: productsTotal },
		isFetching: isFetchingProducts,
		error: productsError,
	} = useProducts({
		params: {
			...params,
			branchId: getLocalBranchId(),
			ordering: (params as any)?.ordering || 'name',
		},
		options: {
			enabled: getAppType() !== appTypes.BACK_OFFICE,
			keepPreviousData: true,
			notifyOnChangeProps: ['data', 'error'],
		},
	});
	const {
		data: { branchProducts, total: branchProductsTotal },
		isFetching: isFetchingBranchProducts,
		error: branchProductsErrors,
	} = useBranchProducts({
		params: {
			...params,
			branchId: getLocalBranchId(),
			ordering: 'product__name',
			// No searchBy: lets the backend match the search term against
			// the product's name or any of its codes (barcode, SKU).
			serviceType: serviceTypes.OFFLINE,
		},
		options: {
			enabled: getAppType() === appTypes.BACK_OFFICE,
			keepPreviousData: true,
			notifyOnChangeProps: ['data', 'error'],
		},
	});

	useEffect(() => {
		if (getAppType() === appTypes.BACK_OFFICE) {
			setDataSource(
				branchProducts.map((branchProduct) => ({
					...branchProduct.product,
					...branchProduct,
				})),
			);
		} else {
			setDataSource(products);
		}
	}, [products, branchProducts, user]);

	const isFetching = isFetchingProducts || isFetchingBranchProducts;

	useEffect(() => {
		if (!isFetching) {
			setHasLoadedOnce(true);
		}
	}, [isFetching]);

	return {
		data: {
			products: dataSource,
			total: productsTotal || branchProductsTotal,
		},
		isFetching: isFetching && !hasLoadedOnce,
		error: productsError || branchProductsErrors,
	};
};
