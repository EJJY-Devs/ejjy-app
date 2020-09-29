/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Breadcrumb, Container, Table, TableActions, TableHeader } from '../../../components';
import { Box, ButtonLink } from '../../../components/elements';
import { types } from '../../../ducks/branch-products';
import { selectors as branchesSelectors } from '../../../ducks/OfficeManager/branches';
import { request } from '../../../global/types';
import { useBranchProducts } from '../../../hooks/useBranchProducts';
import { calculateTableHeight } from '../../../utils/function';
import { EditBranchProductsModal } from './components/BranchProducts/EditBranchProductsModal';
import { ViewBranchProductModal } from './components/BranchProducts/ViewBranchProductModal';
import './style.scss';

interface Props {
	match: any;
}

const columns = [
	{ title: 'Barcode', dataIndex: 'barcode' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Balance', dataIndex: 'balance' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const ViewBranch = ({ match }: Props) => {
	// Routing
	const branchId = match?.params?.id;

	// States
	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [editBranchProductModalVisible, setEditBranchProductModalVisible] = useState(false);
	const [viewBranchProductModalVisible, setViewBranchProductModalVisible] = useState(false);
	const [selectedBranchProduct, setSelectedBranchProduct] = useState(null);

	// Custom hooks
	const { branchProducts, getBranchProductsByBranch, status, recentRequest } = useBranchProducts();
	const branch = useSelector(branchesSelectors.selectBranchById(Number(branchId)));

	// Effect: Fetch branch products
	useEffect(() => {
		getBranchProductsByBranch(branchId);
	}, []);

	// Effect: Format branch products to be rendered in Table
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.GET_BRANCH_PRODUCTS_BY_BRANCH) {
			const formattedBranchProducts = branchProducts.map((branchProduct) => {
				const {
					product: { barcode, name, max_balance },
					current_balance,
				} = branchProduct;

				return {
					_barcode: barcode,
					barcode: <ButtonLink text={barcode} onClick={() => onView(branchProduct)} />,
					name,
					balance: `${current_balance} / ${max_balance}`,
					actions: <TableActions onEdit={() => onEdit(branchProduct)} />,
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

	const getBreadcrumbItems = useCallback(
		() => [{ name: 'Branches', link: '/branches' }, { name: branch?.name }],
		[branch],
	);

	const onView = (branchProduct) => {
		setSelectedBranchProduct(branchProduct);
		setViewBranchProductModalVisible(true);
	};

	const onEdit = (branch) => {
		setSelectedBranchProduct(branch);
		setEditBranchProductModalVisible(true);
	};

	const onSearch = (keyword) => {
		keyword = lowerCase(keyword);
		const filteredData =
			keyword.length > 0
				? data.filter(({ _barcode, name }) => _barcode.includes(keyword) || name.includes(keyword))
				: data;

		setTableData(filteredData);
	};

	return (
		<Container
			title="[VIEW] Branch"
			rightTitle={branch?.name}
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			loadingText="Fetching branch details..."
			loading={getFetchLoading()}
		>
			<section>
				<Box>
					<TableHeader title="Products" buttonName="Create Branch Product" onSearch={onSearch} />

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
					/>

					<ViewBranchProductModal
						branchName={branch?.name}
						branchProduct={selectedBranchProduct}
						visible={viewBranchProductModalVisible}
						onClose={() => setViewBranchProductModalVisible(false)}
					/>

					<EditBranchProductsModal
						branch={branch}
						branchProduct={selectedBranchProduct}
						visible={editBranchProductModalVisible}
						onClose={() => setEditBranchProductModalVisible(false)}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default ViewBranch;
