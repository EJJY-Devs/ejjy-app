/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, TableActions, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { request } from '../../../global/types';
import { calculateTableHeight, sleep } from '../../../utils/function';
import { useBranches } from '../../OfficeManager/hooks/useBranches';
import { CreateEditBranchModal } from './components/Branch/CreateEditBranchModal';
import './style.scss';

const columns = [
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Online URL', dataIndex: 'url' },
	{ title: 'Actions', dataIndex: 'actions' },
];

const Branches = () => {
	// STATES
	const [data, setData] = useState([]);
	const [createEditBranchModalVisible, setCreateEditBranchModalVisible] = useState(false);
	const [selectedBranch, setSelectedBranch] = useState(null);

	// CUSTOM HOOKS
	const { branches, getBranches, removeBranch, status } = useBranches();

	// EFFECTS
	useEffect(() => {
		getBranches();
	}, []);

	// Effect: Format branches to be rendered in Table
	useEffect(() => {
		const formattedBranches = branches.map((branch) => {
			const { id, name, online_url } = branch;

			return {
				name: <Link to={`/branches/${id}`}>{name}</Link>,
				url: online_url,
				actions: <TableActions onEdit={() => onEdit(branch)} onRemove={() => removeBranch(id)} />,
			};
		});

		sleep(500).then(() => setData(formattedBranches));
	}, [branches]);

	const onCreate = () => {
		setSelectedBranch(null);
		setCreateEditBranchModalVisible(true);
	};

	const onEdit = (branch) => {
		setSelectedBranch(branch);
		setCreateEditBranchModalVisible(true);
	};

	return (
		<Container title="Branches">
			<section className="Branches">
				<Box>
					<TableHeader buttonName="Create Branch" onCreate={onCreate} />

					<Table
						columns={columns}
						dataSource={data}
						scroll={{ y: calculateTableHeight(data.length), x: '100%' }}
						loading={status === request.REQUESTING}
					/>

					<CreateEditBranchModal
						branch={selectedBranch}
						visible={createEditBranchModalVisible}
						onClose={() => setCreateEditBranchModalVisible(false)}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default Branches;
