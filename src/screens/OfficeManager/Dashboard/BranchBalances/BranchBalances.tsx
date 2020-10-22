/* eslint-disable react-hooks/exhaustive-deps */
import { Spin, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '../../../../components/elements';
import { selectors as branchSelectors } from '../../../../ducks/OfficeManager/branches';
import { request } from '../../../../global/types';
import { useBranchProducts } from '../../../../hooks/useBranchProducts';
import { getBranchProductStatus } from '../../../../utils/function';
import { BranchBalanceItem } from './BranchBalanceItem';

const { TabPane } = Tabs;

export const BranchBalances = () => {
	const [data, setData] = useState([]);
	const [queriedBranches, setQueriedBranches] = useState([]);

	const branches = useSelector(branchSelectors.selectBranches());
	const { branchProducts, getBranchProductsByBranch, status } = useBranchProducts();

	useEffect(() => {
		if (branches) {
			onTabClick(branches?.[0]?.id);
		}
	}, [branches]);

	useEffect(() => {
		if (branchProducts) {
			const newBranchProducts = branchProducts
				?.filter((branchProduct) => !data.find((item) => item.id === branchProduct.id))
				?.map((branchProduct) => ({
					id: branchProduct.id,
					branch_id: branchProduct.branch.id,
					barcode: branchProduct.product.barcode,
					name: branchProduct.product.name,
					current_balance: branchProduct.current_balance,
					max_balance: branchProduct.product.max_balance,
					status: branchProduct.product_status,
				}));

			setData((value) => [...value, ...newBranchProducts]);
		}
	}, [branchProducts]);

	const getTableDataSource = (branchId) => {
		return data
			?.filter(({ branch_id }) => branch_id === branchId)
			?.map((branchProduct) => {
				const { barcode, name, max_balance, current_balance, status } = branchProduct;

				return [
					barcode,
					name,
					`${current_balance} / ${max_balance}`,
					getBranchProductStatus(status),
				];
			});
	};

	const onTabClick = (key) => {
		if (!queriedBranches.includes(key) && key) {
			setQueriedBranches((value) => [...value, key.toString()]);
			getBranchProductsByBranch(key);
		}
	};

	return (
		<Spin size="large" spinning={status === request.REQUESTING}>
			<Box>
				<Tabs
					defaultActiveKey={branches?.[0]?.id}
					style={{ padding: '20px 25px' }}
					type="card"
					onTabClick={onTabClick}
				>
					{branches.map(({ name, id }) => (
						<TabPane key={id} tab={name}>
							<BranchBalanceItem dataSource={getTableDataSource(id)} />
						</TabPane>
					))}
				</Tabs>
			</Box>
		</Spin>
	);
};
