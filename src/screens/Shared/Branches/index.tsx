import { DeleteOutlined, EditFilled } from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Tooltip } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import {
	ConnectionAlert,
	Content,
	ModifyBranchModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import { MAX_PAGE_SIZE } from 'global';
import { useBranchDelete, useBranches, usePingOnlineServer } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { convertIntoArray, getId } from 'utils';
import './style.scss';

const LIST_QUERY_KEY = 'BranchesScreen';

const columns: ColumnsType = [
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Server URL', dataIndex: 'url' },
	{ title: 'Store Name', dataIndex: 'storeName' },
	{ title: 'Store Address', dataIndex: 'storeAddress' },
	{ title: 'Proprietor', dataIndex: 'proprietor' },
	{ title: 'Contact Number', dataIndex: 'contactNumber' },
	{ title: 'Vat Type', dataIndex: 'vatType' },
	{ title: 'Tin', dataIndex: 'tin' },
	{ title: 'Actions', dataIndex: 'actions' },
];

export const Branches = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [modifyBranchModalVisible, setModifyBranchModalVisible] = useState(
		false,
	);
	const [selectedBranch, setSelectedBranch] = useState(null);

	// CUSTOM HOOKS
	const queryClient = useQueryClient();
	const { isConnected } = usePingOnlineServer();
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		key: LIST_QUERY_KEY,
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		mutateAsync: deleteBranch,
		isLoading: isDeletingBranch,
		error: deleteBranchError,
	} = useBranchDelete();

	// METHODS
	useEffect(() => {
		const formattedBranches = branches.map((branch) => ({
			key: branch.id,
			name: <Link to={`branches/${branch.id}`}>{branch.name}</Link>,
			url: branch.server_url,
			storeName: branch.store_name,
			storeAddress: branch.store_address,
			proprietor: branch.proprietor,
			contactNumber: branch.contact_number,
			vatType: branch.vat_type,
			tin: branch.tin,
			actions: (
				<Space>
					<Tooltip title="Edit">
						<Button
							disabled={isConnected === false}
							icon={<EditFilled />}
							type="primary"
							ghost
							onClick={() => {
								setSelectedBranch(branch);
								setModifyBranchModalVisible(true);
							}}
						/>
					</Tooltip>
					<Popconfirm
						cancelText="No"
						disabled={isConnected === false}
						okText="Yes"
						placement="left"
						title="Are you sure to remove this?"
						onConfirm={async () => {
							await deleteBranch(getId(branch));
							message.success('Branch was deleted successfully');
							queryClient.invalidateQueries(['useBranches', LIST_QUERY_KEY]);
						}}
					>
						<Tooltip title="Remove">
							<Button icon={<DeleteOutlined />} type="primary" danger ghost />
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		}));

		setDataSource(formattedBranches);
	}, [branches, isConnected]);

	return (
		<Content title="Branches">
			<ConnectionAlert />

			<Box>
				<TableHeader
					buttonName="Create Branch"
					onCreate={() => setModifyBranchModalVisible(true)}
					onCreateDisabled={isConnected === false}
				/>

				<RequestErrors
					className="px-6"
					errors={[
						...convertIntoArray(branchesError),
						...convertIntoArray(deleteBranchError?.errors),
					]}
					withSpaceBottom
				/>

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={isFetchingBranches || isDeletingBranch}
					pagination={false}
					scroll={{ x: 650 }}
					bordered
				/>

				{modifyBranchModalVisible && (
					<ModifyBranchModal
						branch={selectedBranch}
						onClose={() => {
							setSelectedBranch(null);
							setModifyBranchModalVisible(false);
						}}
						onSuccess={() => {
							queryClient.invalidateQueries(['useBranches', LIST_QUERY_KEY]);
						}}
					/>
				)}
			</Box>
		</Content>
	);
};
