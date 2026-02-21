import { DeleteOutlined, EditFilled } from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Table, Tooltip } from 'antd';
import cn from 'classnames';
import {
	ConnectionAlert,
	ModifyPatronageSystemTagModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import { appTypes, MAX_PAGE_SIZE } from 'global';
import {
	usePatronageSystemTagDelete,
	usePatronageSystemTags,
	usePingOnlineServer,
} from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, getAppType, getId } from 'utils';

export const PatronageTagsTab = () => {
	const [dataSource, setDataSource] = useState([]);
	const [selectedTag, setSelectedTag] = useState(null);
	const [isModalVisible, setIsModalVisible] = useState(false);

	const { isConnected } = usePingOnlineServer();
	const {
		data: { patronageSystemTags },
		isFetching: isFetchingPatronageSystemTags,
		error: patronageSystemTagsError,
	} = usePatronageSystemTags({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		mutateAsync: deletePatronageSystemTag,
		isLoading: isDeletingPatronageSystemTag,
		error: deletePatronageSystemTagError,
	} = usePatronageSystemTagDelete();

	useEffect(() => {
		const data = patronageSystemTags.map((patronageSystemTag) => ({
			key: patronageSystemTag.id,
			name: patronageSystemTag.name,
			divisorAmount: patronageSystemTag.divisor_amount,
			actions: (
				<Space>
					<Tooltip title="Edit">
						<Button
							disabled={isConnected === false}
							icon={<EditFilled />}
							type="primary"
							ghost
							onClick={() => {
								setSelectedTag(patronageSystemTag);
								setIsModalVisible(true);
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
							await deletePatronageSystemTag(getId(patronageSystemTag));
							message.success('Patronage system tag was deleted successfully');
						}}
					>
						<Tooltip title="Remove">
							<Button icon={<DeleteOutlined />} type="primary" danger ghost />
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		}));

		setDataSource(data);
	}, [patronageSystemTags, isConnected, deletePatronageSystemTag]);

	const columns = [
		{ title: 'Name', dataIndex: 'name' },
		{ title: 'Divisor Amount', dataIndex: 'divisorAmount' },
	];

	if (getAppType() === appTypes.HEAD_OFFICE) {
		columns.push({ title: 'Actions', dataIndex: 'actions' });
	}

	return (
		<>
			<ConnectionAlert />

			<Box padding>
				{getAppType() === appTypes.HEAD_OFFICE && (
					<TableHeader
						buttonName="Create Patronage System Tag"
						onCreate={() => {
							setSelectedTag(null);
							setIsModalVisible(true);
						}}
						onCreateDisabled={isConnected === false}
					/>
				)}

				<RequestErrors
					className={cn('px-6', {
						'mt-6': getAppType() !== appTypes.HEAD_OFFICE,
					})}
					errors={[
						...convertIntoArray(patronageSystemTagsError),
						...convertIntoArray(deletePatronageSystemTagError?.errors),
					]}
					withSpaceBottom
				/>

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={
						isFetchingPatronageSystemTags || isDeletingPatronageSystemTag
					}
					pagination={false}
					rowKey="key"
				/>
			</Box>

			{isModalVisible && (
				<ModifyPatronageSystemTagModal
					patronageSystemTag={selectedTag}
					onClose={() => {
						setSelectedTag(null);
						setIsModalVisible(false);
					}}
				/>
			)}
		</>
	);
};
