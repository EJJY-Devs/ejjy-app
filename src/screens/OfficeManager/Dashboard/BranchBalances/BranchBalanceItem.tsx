import React, { useEffect, useState } from 'react';
import { TableNormal } from '../../../../components';
import { SearchInput } from '../../../../components/elements';

const columns = [{ name: 'Barcode' }, { name: 'Name' }, { name: 'Balance' }, { name: 'Status' }];

interface Props {
	dataSource?: any;
}

export const BranchBalanceItem = ({ dataSource }: Props) => {
	const [data, setData] = useState([]);

	useEffect(() => {
		setData(dataSource);
	}, [dataSource]);

	const onSearch = (searchedText) => {
		setData(
			dataSource.filter((item) => {
				const barcode = item?.[0]?.toLowerCase() || '';
				const name = item?.[1]?.toLowerCase() || '';

				return barcode.includes(searchedText) || name.includes(searchedText);
			}),
		);
	};

	return (
		<>
			<SearchInput
				classNames="tab-search-input"
				placeholder="Search product"
				onChange={(event) => onSearch(event.target.value.trim())}
			/>
			<TableNormal columns={columns} data={data} />
		</>
	);
};
