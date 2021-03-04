/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableNormal } from '../../../../../components';
import { CashieringCard } from '../../../../../components/CashieringCard/CashieringCard';
import { SearchInput } from '../../../../../components/elements';
import { selectors as authSelectors } from '../../../../../ducks/auth';
import { request } from '../../../../../global/types';
import { useBranchesDays } from '../../../../../hooks/useBranchesDays';
import { useBranchProducts } from '../../../../../hooks/useBranchProducts';
import { getBranchProductStatus } from '../../../../../utils/function';

const columns = [{ name: 'Barcode' }, { name: 'Name' }, { name: 'Balance' }, { name: 'Status' }];

const PAGE_SIZE = 5;

interface Props {
	dataSource?: any;
	branchId: number;
	disabled: boolean;
	isActive: boolean;
}

export const BranchBalanceItem = ({ isActive, branchId, dataSource, disabled }: Props) => {
	// STATES
	const [data, setData] = useState([]);

	// CUSTOM HOOKS
	const {
		branchDay,
		createBranchDay,
		editBranchDay,
		status: branchesDaysStatus,
		errors: branchesDaysErrors,
	} = useBranchesDays();
	const {
		branchProducts,
		pageCount,
		currentPage,
		addItemInPagination,
		updateItemInPagination,
		removeItemInPagination,

		getBranchProductsByBranch,
		status: branchProductStatus,
	} = useBranchProducts({ pageSize: PAGE_SIZE });
	const user = useSelector(authSelectors.selectUser());

	// METHODS
	useEffect(() => {
		getBranchProductsByBranch({ page: 1, branchId });
	}, []);

	useEffect(() => {
		const newBranchProducts = branchProducts?.map((branchProduct) => {
			const { barcode, name, textcode, max_balance, current_balance, status } = branchProduct;

			return [
				{ isHidden: true, barcode, name, textcode },
				barcode || textcode,
				name,
				`${current_balance} / ${max_balance}`,
				getBranchProductStatus(status),
			];
		});

		setData((value) => [...value, ...newBranchProducts]);
	}, [branchProducts]);

	// Effect: Display errors from branch cashiering
	useEffect(() => {
		if (branchesDaysErrors?.length && branchesDaysStatus === request.ERROR) {
			message.error(branchesDaysErrors);
		}
	}, [branchesDaysErrors, branchesDaysStatus]);

	const onStartDay = () => {
		createBranchDay(branchId, user.id);
	};

	const onEndDay = () => {
		editBranchDay(branchDay.id, user.id);
	};

	const onSearch = (keyword) => {
		keyword = keyword?.toLowerCase();

		const filteredData =
			keyword.length > 0
				? dataSource.filter((item) => {
						const barcode = item?.[0]?.barcode?.toLowerCase() || '';
						const textcode = item?.[0]?.textcode?.toLowerCase() || '';
						const name = item?.[0]?.name?.toLowerCase() || '';

						return (
							name.includes(keyword) || barcode.includes(keyword) || textcode.includes(keyword)
						);
				  })
				: dataSource;

		setData(filteredData);
	};

	return (
		<>
			<CashieringCard
				classNames="bordered cashiering-card-office"
				branchDay={branchDay}
				onClick={branchDay ? onEndDay : onStartDay}
				loading={branchesDaysStatus === request.REQUESTING}
				disabled={disabled}
			/>

			<SearchInput
				classNames="tab-search-input"
				placeholder="Search product"
				onChange={(event) => onSearch(event.target.value.trim())}
			/>
			<TableNormal columns={columns} data={data} />

			{/* <Pagination
				className="table-pagination"
				current={currentPage}
				total={pageCount}
				pageSize={PAGE_SIZE}
				onChange={onPageChange}
				disabled={!tableData}
			/> */}
		</>
	);
};
