/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Container, Table, TableActions, TableHeader } from '../../../components';
import { Box, ButtonLink } from '../../../components/elements';
import { types } from '../../../ducks/OfficeManager/products';
import { request } from '../../../global/types';
import { useProducts } from '../../../hooks/useProducts';
import { calculateTableHeight } from '../../../utils/function';
import { CreateEditProductModal } from './components/CreateEditProductModal';
import { ViewProductModal } from './components/ViewProductModal';

const columns = [
	{ title: 'Barcode', dataIndex: 'barcode' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const Products = () => {
	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [createEditProductModalVisible, setCreateEditProductModalVisible] = useState(false);
	const [viewProductModalVisible, setViewProductModalVisible] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);

	const { products, getProducts, removeProduct, status, recentRequest } = useProducts();

	useEffect(() => {
		getProducts();
	}, []);

	// Effect: Format products to be rendered in Table
	useEffect(() => {
		const formattedProducts = products.map((product) => {
			const { id, barcode, name } = product;

			return {
				_barcode: barcode,
				barcode: <ButtonLink text={barcode} onClick={() => onView(product)} />,
				name,
				actions: <TableActions onEdit={() => onEdit(product)} onRemove={() => removeProduct(id)} />,
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

	const onCreate = () => {
		setSelectedProduct(null);
		setCreateEditProductModalVisible(true);
	};

	const onEdit = (product) => {
		setSelectedProduct(product);
		setCreateEditProductModalVisible(true);
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
					<TableHeader buttonName="Create Product" onSearch={onSearch} onCreate={onCreate} />

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

					<CreateEditProductModal
						product={selectedProduct}
						visible={createEditProductModalVisible}
						onClose={() => setCreateEditProductModalVisible(false)}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default Products;
