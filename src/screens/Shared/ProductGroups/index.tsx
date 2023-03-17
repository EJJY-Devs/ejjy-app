import { DeleteOutlined, EditFilled } from '@ant-design/icons';
import { Button, message, Popconfirm, Space, Tooltip } from 'antd';
import Table from 'antd/lib/table';
import cn from 'classnames';
import { ConnectionAlert, Content, RequestErrors } from 'components';
import { Box } from 'components/elements';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, pageSizeOptions } from 'global';
import {
	usePingOnlineServer,
	useProductGroupDelete,
	useProductGroups,
	useQueryParams,
} from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from 'stores';
import { convertIntoArray, getId, isCUDShown } from 'utils';

export const ProductGroups = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { isConnected } = usePingOnlineServer();
	const user = useUserStore((state) => state.user);
	const {
		data: { productGroups, total },
		isFetching: isFetchingProductGroups,
		error: productGroupsError,
	} = useProductGroups({
		params,
		shouldFetchOfflineFirst: true,
	});
	const {
		mutate: deleteProductGroup,
		isLoading: isDeletingProductGroup,
		error: deleteProductGroupError,
	} = useProductGroupDelete();

	// METHODS
	useEffect(() => {
		const data = productGroups.map((productGroup) => ({
			key: productGroup.id,
			name: productGroup.name,
			actions: (
				<Space>
					<Tooltip title="Edit">
						<Link to={`product-groups/edit/${productGroup.id}`}>
							<Button
								disabled={isConnected === false}
								icon={<EditFilled />}
								type="primary"
								ghost
							/>
						</Link>
					</Tooltip>
					<Popconfirm
						cancelText="No"
						disabled={isConnected === false}
						okText="Yes"
						placement="left"
						title="Are you sure to remove this?"
						onConfirm={async () => {
							await deleteProductGroup(getId(productGroup));
							message.success('Product group was deleted successfully');
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
	}, [productGroups, isConnected]);

	const getColumns = useCallback(() => {
		const columns = [{ title: 'Name', dataIndex: 'name' }];

		if (isCUDShown(user.user_type)) {
			columns.push({ title: 'Actions', dataIndex: 'actions' });
		}

		return columns;
	}, [user]);

	return (
		<Content title="Product Groups">
			<ConnectionAlert />

			<Box>
				{isCUDShown(user.user_type) && (
					<div className="pa-6 d-flex justify-end">
						<Link to="product-groups/create">
							<Button disabled={isConnected === false} type="primary">
								Create Product Group
							</Button>
						</Link>
					</div>
				)}

				<RequestErrors
					className={cn('px-6', {
						'mt-6': !isCUDShown(user.user_type),
					})}
					errors={[
						...convertIntoArray(productGroupsError),
						...convertIntoArray(deleteProductGroupError?.errors),
					]}
					withSpaceBottom
				/>

				<Table
					columns={getColumns()}
					dataSource={dataSource}
					loading={isFetchingProductGroups || isDeletingProductGroup}
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

				{/* {modifyProductGroupModalVisible && (
					<ModifyProductGroupModal
						productGroup={selectedProductGroup}
						onClose={() => {
							setSelectedProductGroup(null);
							setModifyProductGroupModalVisible(false);
						}}
					/>
				)} */}
			</Box>
		</Content>
	);
};
