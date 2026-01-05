/* eslint-disable dot-notation */
import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Radio, Row, Select, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import { TableActions, TableHeader, ViewBranchProductModal } from 'components';
import { RequestErrors } from 'components/RequestErrors';
import { Label } from 'components/elements';
import { filterOption, getProductCode } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
	pageSizeOptions,
} from 'global';
import { useBranchProducts, useProductCategories, useQueryParams } from 'hooks';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { convertIntoArray, formatQuantity, getId } from 'utils';
import { AddBranchProductBalanceModal } from './components/AddBranchProductBalanceModal';

const modals = {
	VIEW: 0,
	ADD: 1,
};

const isSoldInBranchOptions = {
	SHOW_ALL: 'show_all',
	SHOW_NOT_SOLD: 'show_not_sold',
	SHOW_IN_STOCK: 'show_in_stocks',
};

const columns: ColumnsType = [
	{ title: 'Code', dataIndex: 'code' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Balance', dataIndex: 'balance' },
	{ title: 'Actions', dataIndex: 'actions' }, // NOTE: Removed for the meantime as we don't know yet if this is needed in HeadOffice
];

interface Props {
	branch: any;
	disabled: boolean;
}

export const TabBranchProducts = ({ branch, disabled }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedBranchProduct, setSelectedBranchProduct] = useState(null);
	const [modalType, setModalType] = useState(null);

	// NOTE: Hiding/showing of current balance is temporarily disabled as requested by Emman
	const [isCurrentBalanceVisible] = useState(true);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams({
		onParamsCheck: (queryParams) => {
			const newParams = {};

			if (!queryParams.isSoldInBranch) {
				newParams['isSoldInBranch'] = isSoldInBranchOptions.SHOW_IN_STOCK;
			}

			return newParams;
		},
	});
	const {
		data: { branchProducts, total },
		isFetching: isFetchingBranchProducts,
		error: branchProductsErrors,
		refetch: refetchBranchProducts,
	} = useBranchProducts({
		params: {
			...params,
			branchId: branch.id,
			searchBy: 'name',
			isSoldInBranch: (() => {
				let isSoldInBranch = null;
				if (params?.isSoldInBranch === isSoldInBranchOptions.SHOW_IN_STOCK) {
					isSoldInBranch = true;
				} else if (
					params?.isSoldInBranch === isSoldInBranchOptions.SHOW_NOT_SOLD
				) {
					isSoldInBranch = false;
				}

				return isSoldInBranch;
			})(),
		},
	});

	// NOTE: Hiding/showing of current balance is temporarily disabled as requested by Emman
	// useEffect(() => {
	// 	document.addEventListener('keydown', handleKeyDown);

	// 	return () => {
	// 		document.removeEventListener('keydown', handleKeyDown);
	// 	};
	// });

	// METHODS
	useEffect(() => {
		const formattedBranchProducts = branchProducts.map((branchProduct) => {
			const {
				id,
				product: { name, unit_of_measurement },
				current_balance,
				max_balance,
			} = branchProduct;

			const currentBalance = (
				<Tooltip
					overlayClassName="button-tooltip"
					title={formatQuantity({
						unitOfMeasurement: unit_of_measurement,
						quantity: current_balance,
					})}
				>
					{formatQuantity({
						unitOfMeasurement: unit_of_measurement,
						quantity: current_balance,
						isCeiled: true,
					})}
				</Tooltip>
			);

			const maxBalance = formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: max_balance,
			});

			return {
				key: id,
				code: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => {
							setSelectedBranchProduct(branchProduct);
							setModalType(modals.VIEW);
						}}
					>
						{getProductCode(branchProduct.product)}
					</Button>
				),
				name,
				balance: (
					<>
						{isCurrentBalanceVisible ? currentBalance : '???'} / {maxBalance}
					</>
				),
				actions: (
					<TableActions
						areButtonsDisabled={disabled}
						onAdd={() => {
							setSelectedBranchProduct(branchProduct);
							setModalType(modals.ADD);
						}}
						onAddName="Supplier Delivery"
					/>
				),
			};
		});

		setDataSource(formattedBranchProducts);
	}, [branchProducts, disabled]);

	// NOTE: Hiding/showing of current balance is temporarily disabled as requested by Emman
	// const handleKeyDown = (event) => {
	// 	const key = getKeyDownCombination(event);

	// 	if (SHOW_HIDE_SHORTCUT.includes(key) && modalType !== null) {
	// 		event.preventDefault();

	// 		if (isCurrentBalanceVisible) {
	// 			setIsCurrentBalanceVisible(false);
	// 		} else {
	// 			confirmPassword({
	// 				onSuccess: () => setIsCurrentBalanceVisible(true),
	// 			});
	// 		}
	// 	}
	// };

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '8px 0',
				}}
			>
				<TableHeader
					buttonName="Create Branch Product"
					title="Branch Products"
					wrapperClassName="pt-2 px-0"
				/>
				<span style={{ color: '#fa8c16', fontSize: '12px' }}>
					Branch Product Count: <strong>{total?.toLocaleString() || 0}</strong>
				</span>
			</div>

			<Filter />

			<RequestErrors
				errors={convertIntoArray(branchProductsErrors, 'Branch Product')}
				withSpaceBottom
				withSpaceTop
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingBranchProducts}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page, newPageSize) => {
						setQueryParams({
							page,
							pageSize: newPageSize,
						});
					},
					disabled: !dataSource,
					position: ['bottomCenter'],
					pageSizeOptions,
				}}
				scroll={{ x: 800 }}
				bordered
			/>

			{selectedBranchProduct && modalType === modals.VIEW && (
				<ViewBranchProductModal
					branchProduct={selectedBranchProduct}
					isCurrentBalanceVisible
					onClose={() => setModalType(null)}
				/>
			)}

			{selectedBranchProduct && modalType === modals.ADD && (
				<AddBranchProductBalanceModal
					branchId={getId(branch)}
					branchProduct={selectedBranchProduct}
					onClose={() => setModalType(null)}
					onSuccess={refetchBranchProducts}
				/>
			)}
		</div>
	);
};

const Filter = () => {
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// METHODS
	const handleSearchDebounced = useCallback(
		debounce((keyword) => {
			setQueryParams({ search: keyword }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[params],
	);

	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<Label label="Search" spacing />
				<Input
					defaultValue={params.search}
					prefix={<SearchOutlined />}
					allowClear
					onChange={(event) => handleSearchDebounced(event.target.value.trim())}
				/>
			</Col>

			<Col lg={12} span={24}>
				<Label label="Product Category" spacing />
				<Select
					className="w-100"
					filterOption={filterOption}
					loading={isFetchingProductCategories}
					optionFilterProp="children"
					value={params.productCategory}
					allowClear
					showSearch
					onChange={(value) => {
						setQueryParams(
							{ productCategory: value },
							{ shouldResetPage: true },
						);
					}}
				>
					{productCategories.map(({ name }) => (
						<Select.Option key={name} value={name}>
							{name}
						</Select.Option>
					))}
				</Select>
			</Col>

			<Col lg={12} span={24}>
				<Label label="Show Sold In Branch" spacing />
				<Radio.Group
					options={[
						{ label: 'Show All', value: isSoldInBranchOptions.SHOW_ALL },
						{
							label: 'Show Not Sold',
							value: isSoldInBranchOptions.SHOW_NOT_SOLD,
						},
						{
							label: 'Show In Stock',
							value: isSoldInBranchOptions.SHOW_IN_STOCK,
						},
					]}
					optionType="button"
					value={params.isSoldInBranch}
					onChange={(e) => {
						const { value } = e.target;
						setQueryParams(
							{ isSoldInBranch: value },
							{ shouldResetPage: true },
						);
					}}
				/>
			</Col>
		</Row>
	);
};
