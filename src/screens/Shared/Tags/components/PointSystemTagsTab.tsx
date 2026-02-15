import {
	DeleteOutlined,
	EditFilled,
	LoadingOutlined,
	MenuOutlined,
} from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { arrayMoveImmutable } from 'array-move';
import cn from 'classnames';
import {
	ConnectionAlert,
	ModifyPointSystemTagModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import { appTypes, MAX_PAGE_SIZE } from 'global';
import {
	usePingOnlineServer,
	usePointSystemTagDelete,
	usePointSystemTagEdit,
	usePointSystemTags,
} from 'hooks';
import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import {
	SortableContainer,
	SortableElement,
	SortableHandle,
} from 'react-sortable-hoc';
import { useDebouncedCallback } from 'use-debounce';
import { convertIntoArray, getAppType, getId } from 'utils';

const DragHandle = SortableHandle(() => (
	<MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
));

const SortableItem = SortableElement(
	(props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />,
);
const SortableBody = SortableContainer(
	(props: React.HTMLAttributes<HTMLTableSectionElement>) => (
		<tbody {...props} />
	),
);

export const PointSystemTagsTab = () => {
	const [dataSource, setDataSource] = useState([]);
	const [selectedPointSystemTag, setSelectedPointSystemTag] = useState(null);
	const [
		modifyPointSystemTagModalVisible,
		setModifyPointSystemTagModalVisible,
	] = useState(false);

	const { isConnected } = usePingOnlineServer();
	const {
		data: { pointSystemTags },
		isFetching: isFetchingPointSystemTags,
		error: pointSystemTagsError,
	} = usePointSystemTags({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		mutate: editPointSystemTag,
		isLoading: isEditingPointSystemTag,
		error: editPointSystemTagError,
	} = usePointSystemTagEdit();
	const {
		mutateAsync: deletePointSystemTag,
		isLoading: isDeletingPointSystemTag,
		error: deletePointSystemTagError,
	} = usePointSystemTagDelete();

	useEffect(() => {
		const sortedPointSystemTags = cloneDeep(pointSystemTags);
		sortedPointSystemTags.sort((a, b) => a.priority_level - b.priority_level);

		const data = sortedPointSystemTags.map((pointSystemTag, index) => ({
			id: pointSystemTag.id,
			name: pointSystemTag.name,
			priorityLevel: pointSystemTag.priority_level,
			online_id: pointSystemTag.online_id,
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
			index,
		}));

		setDataSource(data);
	}, [pointSystemTags, isConnected]);

	const handleSaveEdits = useDebouncedCallback((sortedTags) => {
		sortedTags.forEach((pointSystemTag, index) => {
			if (pointSystemTag.priorityLevel !== index) {
				editPointSystemTag({
					id: getId(pointSystemTag),
					name: pointSystemTag.name,
					priorityLevel: index,
				});
			}
		});
	}, 500);

	const getColumns = useCallback(() => {
		const columns: ColumnsType = [
			{ title: 'Name', dataIndex: 'name', className: 'drag-visible' },
		];

		if (getAppType() === appTypes.HEAD_OFFICE) {
			columns.unshift({
				title: isEditingPointSystemTag && (
					<LoadingOutlined style={{ fontSize: 16 }} spin />
				),
				dataIndex: 'sort',
				width: 80,
				className: 'drag-visible',
				align: 'center',
				render: () => <DragHandle />,
			});
			columns.push({ title: 'Actions', dataIndex: 'actions' });
		}

		return columns;
	}, [isEditingPointSystemTag]);

	const handleSortEnd = ({ oldIndex, newIndex }) => {
		if (oldIndex !== newIndex) {
			const newData = arrayMoveImmutable(
				dataSource.slice(),
				oldIndex,
				newIndex,
			).filter((el) => !!el);

			setDataSource(newData);
			handleSaveEdits(newData);
		}
	};

	const renderDraggableContainer = (props) => (
		<SortableBody
			helperClass="row-dragging"
			disableAutoscroll
			useDragHandle
			onSortEnd={handleSortEnd}
			{...props}
		/>
	);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const renderDraggableBodyRow = ({ className, style, ...restProps }) => {
		const index = dataSource.findIndex(
			(x) => x.index === restProps['data-row-key'],
		);
		return <SortableItem index={index} {...restProps} />;
	};

	return (
		<>
			<ConnectionAlert />

			<Box padding>
				{getAppType() === appTypes.HEAD_OFFICE && (
					<TableHeader
						buttonName="Create Patronage System Tag"
						onCreate={() => {
							setSelectedPointSystemTag(null);
							setModifyPointSystemTagModalVisible(true);
						}}
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
						...convertIntoArray(editPointSystemTagError?.errors),
					]}
					withSpaceBottom
				/>

				<Table
					columns={getColumns()}
					components={{
						body: {
							wrapper: renderDraggableContainer,
							row: renderDraggableBodyRow,
						},
					}}
					dataSource={dataSource}
					loading={isFetchingPointSystemTags || isDeletingPointSystemTag}
					pagination={false}
					rowKey="index"
				/>
			</Box>

			{modifyPointSystemTagModalVisible && (
				<ModifyPointSystemTagModal
					pointSystemTag={selectedPointSystemTag}
					onClose={() => {
						setSelectedPointSystemTag(null);
						setModifyPointSystemTagModalVisible(false);
					}}
				/>
			)}
		</>
	);
};
