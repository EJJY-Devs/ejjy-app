/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Container, Table, TableHeader } from '../../../components';
import { Box, ButtonLink } from '../../../components/elements';
import { types } from '../../../ducks/OfficeManager/products';
import { request } from '../../../global/types';
import { useProducts } from '../../../hooks/useProducts';
import { calculateTableHeight } from '../../../utils/function';
import { ViewProductModal } from './components/ViewProductModal';

const columns = [
	{ title: 'Barcode', dataIndex: 'barcode' },
	{ title: 'Name', dataIndex: 'name' },
];

// NOTE: THIS IS NOT COMPLETED YET, NOT PART OF ANY SPRINTS YET.
const Products = () => {
	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [viewProductModalVisible, setViewProductModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);

	const { status, products, getProducts, recentRequest } = useProducts();

	useEffect(() => {
		getProducts();
	}, []);

	// Effect: Format products to be rendered in Table
	useEffect(() => {
		const formattedProducts = products.map((product) => {
			const { barcode, name } = product;

			return {
				_barcode: barcode,
				barcode: <ButtonLink text={barcode} onClick={() => onView(product)} />,
				name,
			};
		});

		setData(formattedProducts);
		setTableData(formattedProducts);
	}, [products]);

	const getFetchLoading = useCallback(
		() => status === request.REQUESTING && recentRequest === types.GET_PRODUCTS,
		[status, recentRequest],
	);

	const onView = (product) => {
		setSelectedProduct(product);
		setViewProductModalVisible(true);
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
		<Container title="Products" loading={getFetchLoading()} loadingText="Fetching products...">
			<section className="Products">
				<Box>
					<TableHeader onSearch={onSearch} />

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
						loading={status === request.REQUESTING}
					/>

					<ViewProductModal
						product={selectedProduct}
						visible={viewProductModalVisible}
						onClose={() => setViewProductModalVisible(false)}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default Products;
