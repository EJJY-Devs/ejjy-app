import React, { useEffect, useState } from 'react';
import { TableNormal } from '../../../../components';

const columns = [{ name: 'Name' }, { name: 'Type' }, { name: 'Action' }];

interface Props {
	dataSource?: any;
}

export const BranchUsers = ({ dataSource }: Props) => {
	// STATES
	const [data, setData] = useState([]);

	// METHODS
	useEffect(() => {
		setData(dataSource);
	}, [dataSource]);

	return <TableNormal columns={columns} data={data} />;
};
