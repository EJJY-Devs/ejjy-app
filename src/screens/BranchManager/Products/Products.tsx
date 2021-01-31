/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, TableHeader } from '../../../components';
import { Box, ButtonLink } from '../../../components/elements';
import { types } from '../../../ducks/branch-products';
import { EMPTY_CELL } from '../../../global/constants';
import { request } from '../../../global/types';
import { useAuth } from '../../../hooks/useAuth';
import { useBranchProducts } from '../../../hooks/useBranchProducts';
import { calculateTableHeight, getBranchProductStatus } from '../../../utils/function';
import { ViewProductModal } from './components/ViewProductModal';

const columns = [
	{ title: 'Barcode', dataIndex: 'barcode' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'RS ID', dataIndex: 'requisitionSlip' },
];

const Products = () => {
	// States
	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [viewBranchProductModalVisible, setViewBranchProductModalVisible] = useState(false);
	const [selectedBranchProduct, setSelectedBranchProduct] = useState(null);

	// Custom hooks
	const { user } = useAuth();
	const { branchProducts, getBranchProductsByBranch, status, recentRequest } = useBranchProducts();

	// Effect: Fetch branch products
	useEffect(() => {
		getBranchProductsByBranch(user?.branch?.id);
	}, []);

	// Effect: Format branch products to be rendered in Table
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.GET_BRANCH_PRODUCTS_BY_BRANCH) {
			const formattedBranchProducts = branchProducts.map((branchProduct) => {
				const {
					product: { barcode, textcode, name },
					requisition_slip,
					product_status,
				} = branchProduct;

				const product = {
					...branchProduct?.product,
					max_balance: branchProduct?.max_balance,
					reorder_point: branchProduct?.reorder_point,
					price_per_piece: branchProduct?.price_per_piece,
					price_per_bulk: branchProduct?.price_per_bulk,
					allowable_spoilage: branchProduct?.allowable_spoilage,
					is_daily_checked: branchProduct?.is_daily_checked,
					is_vat_exempted: branchProduct?.is_vat_exempted,
				};

				return {
					_textcode: textcode,
					_barcode: barcode,
					barcode: <ButtonLink text={barcode || textcode} onClick={() => onView(product)} />,
					name,
					status: getBranchProductStatus(product_status),
					requisitionSlip: requisition_slip ? (
						<Link to={`/requisition-slips/${requisition_slip?.id}`}>{requisition_slip?.id}</Link>
					) : (
						EMPTY_CELL
					),
				};
			});

			setData(formattedBranchProducts);
			setTableData(formattedBranchProducts);
		}
	}, [branchProducts, status, recentRequest]);

	const getFetchLoading = useCallback(
		() => status === request.REQUESTING && recentRequest === types.GET_BRANCH_PRODUCTS_BY_BRANCH,
		[status, recentRequest],
	);

	const onView = (branchProduct) => {
		setSelectedBranchProduct(branchProduct);
		setViewBranchProductModalVisible(true);
	};

	const onSearch = (keyword) => {
		keyword = keyword?.toLowerCase();
		const filteredData =
			keyword.length > 0
				? data.filter((item) => {
						const name = item?.name?.toLowerCase() ?? '';
						const barcode = item?._barcode?.toLowerCase() ?? '';
						const textcode = item?._textcode?.toLowerCase() ?? '';

						return (
							name.includes(keyword) || barcode.includes(keyword) || textcode.includes(keyword)
						);
				  })
				: data;

		setTableData(filteredData);
	};

	return (
		<Container title="Products" loadingText="Fetching products..." loading={getFetchLoading()}>
			<section>
				<Box>
					<TableHeader title="Products" buttonName="Create Branch Product" onSearch={onSearch} />

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
					/>

					<ViewProductModal
						product={selectedBranchProduct}
						visible={viewBranchProductModalVisible}
						onClose={() => setViewBranchProductModalVisible(false)}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default Products;
