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
	Content,
	ModifyProductCategoryModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import { MAX_PAGE_SIZE } from 'global';
import {
	usePingOnlineServer,
	useProductCategories,
	useProductCategoryDelete,
	useProductCategoryEdit,
} from 'hooks';
import { cloneDeep } from 'lodash';

import React, { useCallback, useEffect, useState } from 'react';
import {
	SortableContainer,
	SortableElement,
	SortableHandle,
} from 'react-sortable-hoc';
import { useUserStore } from 'stores';
import { useDebouncedCallback } from 'use-debounce';
import { convertIntoArray, getId, isCUDShown } from 'utils';

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

export const ProductCategories = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedProductCategory, setSelectedProductCategory] = useState(null);
	const [
		modifyProductCategoryModalVisible,
		setModifyProductCategoryModalVisible,
	] = useState(false);

	// CUSTOM HOOKS
	const { isConnected } = usePingOnlineServer();
	const user = useUserStore((state) => state.user);
	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
		error: productCategoriesError,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		mutate: editProductCategory,
		isLoading: isEditingProductCategory,
		error: editProductCategoryError,
	} = useProductCategoryEdit();
	const {
		mutateAsync: deleteProductCategory,
		isLoading: isDeletingProductCategory,
		error: deleteProductCategoryError,
	} = useProductCategoryDelete();

	// METHODS
	useEffect(() => {
		const sortedProductCategories = cloneDeep(productCategories);
		sortedProductCategories.sort((a, b) => a.priority_level - b.priority_level);

		const data = sortedProductCategories.map((productCategory, index) => ({
			id: productCategory.id,
			name: productCategory.name,
			priorityLevel: productCategory.priority_level,
			online_id: productCategory.online_id,
			actions: (
				<Space>
					<Tooltip title="Edit">
						<Button
							disabled={isConnected === false}
							icon={<EditFilled />}
							type="primary"
							ghost
							onClick={() => {
								setSelectedProductCategory(productCategory);
								setModifyProductCategoryModalVisible(true);
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
							await deleteProductCategory(getId(productCategory));
							message.success('Product category was deleted successfully');
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
	}, [productCategories, isConnected]);

	const handleSaveEdits = useDebouncedCallback((sortedProductCategories) => {
		sortedProductCategories.forEach((productCategory, index) => {
			if (productCategory.priorityLevel !== index) {
				editProductCategory({
					id: getId(productCategory),
					name: productCategory.name,
					priorityLevel: index,
				});
			}
		});
	}, 500);

	const getColumns = useCallback(() => {
		const columns: ColumnsType = [
			{ title: 'Name', dataIndex: 'name', className: 'drag-visible' },
		];

		if (isCUDShown(user.user_type)) {
			columns.unshift({
				title: isEditingProductCategory && (
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
	}, [user, isEditingProductCategory]);

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
		// function findIndex base on Table rowKey props and should always be a right array index
		const index = dataSource.findIndex(
			(x) => x.index === restProps['data-row-key'],
		);
		return <SortableItem index={index} {...restProps} />;
	};

	return (
		<Content title="Product Categories">
			<ConnectionAlert />

			<Box>
				{isCUDShown(user.user_type) && (
					<TableHeader
						buttonName="Create Product Category"
						onCreate={() => {
							setSelectedProductCategory(null);
							setModifyProductCategoryModalVisible(true);
						}}
						onCreateDisabled={isConnected === false}
					/>
				)}

				<RequestErrors
					className={cn('px-6', {
						'mt-6': !isCUDShown(user.user_type),
					})}
					errors={[
						...convertIntoArray(productCategoriesError),
						...convertIntoArray(deleteProductCategoryError?.errors),
						...convertIntoArray(editProductCategoryError?.errors),
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
					loading={isFetchingProductCategories || isDeletingProductCategory}
					pagination={false}
					// Intentionally used `index` as row key to make the draggable work
					rowKey="index"
				/>
			</Box>

			{modifyProductCategoryModalVisible && (
				<ModifyProductCategoryModal
					productCategory={selectedProductCategory}
					onClose={() => {
						setSelectedProductCategory(null);
						setModifyProductCategoryModalVisible(false);
					}}
				/>
			)}
		</Content>
	);
};
