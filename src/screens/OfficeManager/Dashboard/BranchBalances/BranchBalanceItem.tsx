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
			<SearchInput
				classNames="tab-search-input"
				placeholder="Search product"
				onChange={(event) => onSearch(event.target.value.trim())}
			/>
			<TableNormal columns={columns} data={data} />
		</>
	);
};
