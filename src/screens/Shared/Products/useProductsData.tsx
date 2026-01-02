import { serviceTypes, appTypes } from 'global';
import { useBranchProducts, useProducts } from 'hooks';
import { useEffect, useState } from 'react';
import { getLocalBranchId, getAppType } from 'utils';

export const useProductsData = ({ params, user }) => {
	const [dataSource, setDataSource] = useState([]);

	const {
		data: { products, total: productsTotal },
		isFetching: isFetchingProducts,
		error: productsError,
	} = useProducts({
		params: {
			...params,
			branchId: getLocalBranchId(),
		},
		options: {
			enabled: getAppType() !== appTypes.BACK_OFFICE,
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
			searchBy: 'name',
			serviceType: serviceTypes.OFFLINE,
		},
		options: {
			enabled: getAppType() === appTypes.BACK_OFFICE,
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

	return {
		data: {
			products: dataSource,
			total: productsTotal || branchProductsTotal,
		},
		isFetching: isFetchingProducts || isFetchingBranchProducts,
		error: productsError || branchProductsErrors,
	};
};
