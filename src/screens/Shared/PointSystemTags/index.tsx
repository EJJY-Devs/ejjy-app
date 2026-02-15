import { DeleteOutlined, EditFilled } from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Tooltip } from 'antd';
import Table from 'antd/lib/table';
import cn from 'classnames';
import {
	ConnectionAlert,
	Content,
	ModifyPointSystemTagModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
} from 'global';
import {
	usePingOnlineServer,
	usePointSystemTagDelete,
	usePointSystemTags,
	useQueryParams,
} from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray, formatInPeso, getAppType, getId } from 'utils';

export const PointSystemTags = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedPointSystemTag, setSelectedPointSystemTag] = useState(null);
	const [
		modifyPointSystemTagModalVisible,
		setModifyPointSystemTagModalVisible,
	] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { isConnected } = usePingOnlineServer();
	const user = useUserStore((state) => state.user);
	const {
		data: { pointSystemTags, total },
		isFetching: isFetchingPointSystemTags,
		error: pointSystemTagsError,
	} = usePointSystemTags({ params });
	const {
		mutateAsync: deletePointSystemTag,
		isLoading: isDeletingPointSystemTag,
		error: deletePointSystemTagError,
	} = usePointSystemTagDelete();

	// METHODS
	useEffect(() => {
		const data = pointSystemTags.map((pointSystemTag) => ({
			key: pointSystemTag.id,
			name: pointSystemTag.name,
			divisorAmount: formatInPeso(pointSystemTag.divisor_amount),
			actions: (
				<Space>
					<Tooltip title="Edit">
						<Button
							disabled={isConnected === false}
							icon={<EditFilled />}
							type="primary"
							ghost
							onClick={() => {
								setSelectedPointSystemTag(pointSystemTag);
								setModifyPointSystemTagModalVisible(true);
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
							await deletePointSystemTag(getId(pointSystemTag));
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
	}, [pointSystemTags, isConnected]);

	const getColumns = useCallback(() => {
		const columns = [
			{ title: 'Name', dataIndex: 'name' },
			{ title: 'Divisor Amount', dataIndex: 'divisorAmount' },
		];

		if (getAppType() === appTypes.HEAD_OFFICE) {
			columns.push({ title: 'Actions', dataIndex: 'actions' });
		}

		return columns;
	}, [user]);

	return (
		<Content title="Patronage System">
			<ConnectionAlert />

			<Box padding>
				{getAppType() === appTypes.HEAD_OFFICE && (
					<TableHeader
						buttonName="Create Patronage System Tag"
						onCreate={() => setModifyPointSystemTagModalVisible(true)}
						onCreateDisabled={isConnected === false}
					/>
				)}

				<RequestErrors
					className={cn('px-6', {
						'mt-6': getAppType() !== appTypes.HEAD_OFFICE,
					})}
					errors={[
						...convertIntoArray(pointSystemTagsError),
						...convertIntoArray(deletePointSystemTagError?.errors),
					]}
					withSpaceBottom
				/>

				<Table
					columns={getColumns()}
					dataSource={dataSource}
					loading={isFetchingPointSystemTags || isDeletingPointSystemTag}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total,
						pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
						onChange: (page, newPageSize) => {
							setQueryParams({
								page,
								pageSize: newPageSize,
							});
						},
						disabled: !dataSource,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					bordered
				/>

				{modifyPointSystemTagModalVisible && (
					<ModifyPointSystemTagModal
						pointSystemTag={selectedPointSystemTag}
						onClose={() => {
							setSelectedPointSystemTag(null);
							setModifyPointSystemTagModalVisible(false);
						}}
					/>
				)}
			</Box>
		</Content>
	);
};
