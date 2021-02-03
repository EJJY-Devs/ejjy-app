/* eslint-disable react-hooks/exhaustive-deps */
import { message, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, TableActions } from '../../../components';
import { Box } from '../../../components/elements';
import { request } from '../../../global/types';
import { getUserTypeName } from '../../../utils/function';
import { useBranches } from '../hooks/useBranches';
import { useUsers } from '../hooks/useUsers';
import { BranchUsers } from './components/BranchUsers';
import './style.scss';

const { TabPane } = Tabs;

const Users = () => {
	// STATES
	const [data, setData] = useState([]);
	const [queriedBranches, setQueriedBranches] = useState([]);
	const [recentQueriedBranchId, setRecentQueriedBranchId] = useState(null);

	// CUSTOM HOOKS
	const history = useHistory();
	const { branches } = useBranches();
	const { users, getUsers, status, errors, reset } = useUsers();

	// METHODS
	useEffect(() => {
		if (branches?.length) {
			onTabClick(branches?.[0]?.id);
		}
	}, [branches]);

	useEffect(() => {
		if (users?.length && recentQueriedBranchId) {
			const newUsers = users
				?.filter((user) => !data.find((item) => item.id === user.id))
				?.map((user) => ({ ...user, branch_id: Number(recentQueriedBranchId) }));

			setData((value) => [...value, ...newUsers]);
		}
	}, [users]);

	useEffect(() => {
		if (status === request.ERROR && errors?.length) {
			errors.forEach((error) => {
				message.error(error);
			});

			reset();
		}
	}, [status, errors]);

	const getTableDataSource = (branchId) => {
		let newData = data
			?.filter(({ branch_id }) => branch_id === branchId)
			?.map((user) => {
				const { id, first_name, last_name, user_type } = user;

				return [
					`${first_name} ${last_name}`,
					getUserTypeName(user_type),
					<TableActions onEdit={() => history.push(`/users/assign/${id}`)} />,
				];
			});
		return newData;
	};

	const onTabClick = (branchId) => {
		setRecentQueriedBranchId(branchId);

		if (!queriedBranches.includes(branchId) && branchId) {
			setQueriedBranches((value) => [...value, branchId.toString()]);
			getUsers({ branchId, fields: 'id,first_name,last_name,user_type' });
		}
	};

	return (
		<Container title="Users" loading={status === request.REQUESTING}>
			<section>
				<Box>
					<Tabs
						defaultActiveKey={branches?.[0]?.id}
						style={{ padding: '20px 25px' }}
						type="card"
						onTabClick={onTabClick}
					>
						{branches.map(({ name, id, online_url }) => (
							<TabPane key={id} tab={name} disabled={!online_url}>
								<BranchUsers dataSource={getTableDataSource(id)} />
							</TabPane>
						))}
					</Tabs>
				</Box>
			</section>
		</Container>
	);
};

export default Users;
