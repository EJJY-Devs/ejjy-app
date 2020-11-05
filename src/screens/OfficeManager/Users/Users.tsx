/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Table, TableActions, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { types } from '../../../ducks/OfficeManager/users';
import { request, userTypes } from '../../../global/types';
import { calculateTableHeight } from '../../../utils/function';
import { useUsers } from '../hooks/useUsers';
import './style.scss';

const columns = [
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Branch', dataIndex: 'branch' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const Users = () => {
	const history = useHistory();

	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);

	const { users, getUsers, status, recentRequest } = useUsers();

	useEffect(() => {
		getUsers({
			fields: 'id,first_name,last_name,user_type,branch',
		});
	}, []);

	// Effect: Format users to be rendered in Table
	useEffect(() => {
		if (status === request.SUCCESS && recentRequest === types.GET_USERS && users) {
			const formattedUsers = users
				.filter((user) => user.user_type !== userTypes.OFFICE_MANAGER)
				.map((user) => {
					const name = `${user.first_name} ${user.last_name}`;
					const branch = user.branch.name;

					return {
						_name: name,
						_branch: branch,
						name,
						branch,
						actions: <TableActions onEdit={() => history.push(`/users/assign/${user.id}`)} />,
					};
				});

			setData(formattedUsers);
			setTableData(formattedUsers);
		}
	}, [users, status, recentRequest]);

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
			title="Users"
			loading={status === request.REQUESTING}
			loadingText="Fetching users..."
		>
			<section>
				<Box>
					<TableHeader onSearch={onSearch} />

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default Users;
