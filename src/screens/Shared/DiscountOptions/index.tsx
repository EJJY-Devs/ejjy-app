import { DeleteOutlined, EditFilled } from '@ant-design/icons';
import {
	Button,
	List,
	message,
	Popconfirm,
	Space,
	Tooltip,
	Typography,
} from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import cn from 'classnames';
import {
	ConnectionAlert,
	Content,
	ModifyDiscountOptionModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import {
	DiscountOption,
	ServiceType,
	useDiscountOptions,
	User,
} from 'ejjy-global';
import {
	appTypes,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	pageSizeOptions,
} from 'global';
import {
	useDiscountOptionDelete,
	usePingOnlineServer,
	useQueryParams,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getAppType,
	getId,
	getLocalApiUrl,
	isStandAlone,
} from 'utils';

interface DataType {
	key: React.Key;
	name: string;
	code: string;
	type: string;
	percentage: string;
	isSpecialDiscount: string | React.ReactNode;
	fields?: string;
}

export const DiscountOptions = () => {
	// STATES
	const [selectedDiscountOption, setSelectedDiscountOption] = useState(null);
	const [
		modifyDiscountOptionModalVisible,
		setModifyDiscountOptionModalVisible,
	] = useState(false);

	// CUSTOM HOOKS
	const { isConnected } = usePingOnlineServer();
	const user = useUserStore((state) => state.user);
	const {
		mutate: deleteDiscountOption,
		isLoading: isDeletingDiscountOption,
		error: deleteDiscountOptionError,
	} = useDiscountOptionDelete();

	const handleSelect = (discountOption: DiscountOption) => {
		setSelectedDiscountOption(discountOption);
		setModifyDiscountOptionModalVisible(true);
	};

	const handleDelete = (discountOption: DiscountOption) => {
		deleteDiscountOption(getId(discountOption));
		message.success('Discount option was deleted successfully');
	};

	return (
		<Content title="Discount Options">
			<ConnectionAlert />

			<Box padding>
				{getAppType() === appTypes.HEAD_OFFICE && (
					<TableHeader
						buttonName="Create Discount Option"
						onCreate={() => setModifyDiscountOptionModalVisible(true)}
						onCreateDisabled={isConnected === false}
					/>
				)}

				<RequestErrors
					className={cn('px-6', {
						'mt-6': getAppType() !== appTypes.HEAD_OFFICE,
					})}
					errors={convertIntoArray(deleteDiscountOptionError?.errors)}
					withSpaceBottom
				/>

				<DiscountOptionTable
					isConnected={isConnected}
					isLoading={isDeletingDiscountOption}
					title="Special Discounts"
					user={user}
					isSpecialDiscount
					onDelete={handleDelete}
					onSelect={handleSelect}
				/>

				<div className="mt-8">
					<DiscountOptionTable
						isConnected={isConnected}
						isLoading={isDeletingDiscountOption}
						isSpecialDiscount={false}
						title="Non-special Discounts"
						user={user}
						onDelete={handleDelete}
						onSelect={handleSelect}
					/>
				</div>

				{modifyDiscountOptionModalVisible && (
					<ModifyDiscountOptionModal
						discountOption={selectedDiscountOption}
						onClose={() => {
							setSelectedDiscountOption(null);
							setModifyDiscountOptionModalVisible(false);
						}}
					/>
				)}
			</Box>
		</Content>
	);
};

type DiscountOptionTableProps = {
	isConnected: boolean;
	isLoading: boolean;
	isSpecialDiscount: boolean;
	title: string;
	user: User;
	onSelect: (discountOption: DiscountOption) => void;
	onDelete: (discountOption: DiscountOption) => void;
};

const DiscountOptionTable = ({
	isConnected,
	isLoading,
	isSpecialDiscount,
	title,
	user,
	onDelete,
	onSelect,
}: DiscountOptionTableProps) => {
	const [dataSource, setDataSource] = useState<DataType[]>([]);

	const { params, setQueryParams } = useQueryParams();
	const {
		data: discountOptionsData,
		isFetching: isFetchingDiscountOptions,
		error: discountOptionsError,
	} = useDiscountOptions({
		params: {
			...params,
			isSpecialDiscount,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	useEffect(() => {
		if (discountOptionsData?.list) {
			const data = discountOptionsData.list.map((discountOption) => ({
				key: discountOption.id,
				name: discountOption.name,
				code: discountOption.code,
				type: _.upperFirst(discountOption.type),
				percentage: discountOption.percentage
					? `${Number(discountOption.percentage)}%`
					: EMPTY_CELL,
				isSpecialDiscount: discountOption.is_special_discount ? 'Yes' : 'No',
				fields: discountOption.additional_fields,
				actions: !discountOption.is_special_discount && (
					<Space>
						{getAppType() === appTypes.HEAD_OFFICE && (
							<Tooltip title="Edit">
								<Button
									disabled={isConnected === false}
									icon={<EditFilled />}
									type="primary"
									ghost
									onClick={() => onSelect(discountOption)}
								/>
							</Tooltip>
						)}
						{getAppType() === appTypes.HEAD_OFFICE && (
							<Popconfirm
								cancelText="No"
								disabled={isConnected === false}
								okText="Yes"
								placement="left"
								title="Are you sure to remove this?"
								onConfirm={() => onDelete(discountOption)}
							>
								<Tooltip title="Remove">
									<Button
										icon={<DeleteOutlined />}
										type="primary"
										danger
										ghost
									/>
								</Tooltip>
							</Popconfirm>
						)}
					</Space>
				),
			}));

			setDataSource(data);
		}
	}, [discountOptionsData?.list, isConnected]);

	const getColumns = useCallback(() => {
		const columns: ColumnsType<DataType> = [
			{ title: 'Name', dataIndex: 'name' },
			{ title: 'Code', dataIndex: 'code' },
			{ title: 'Type', dataIndex: 'type' },
			{ title: 'Percentage', dataIndex: 'percentage', align: 'center' },
		];

		if (getAppType() === appTypes.HEAD_OFFICE && !isSpecialDiscount) {
			columns.push({ title: 'Actions', dataIndex: 'actions' });
		}

		return columns;
	}, [user]);

	return (
		<>
			<RequestErrors
				className="px-6"
				errors={convertIntoArray(discountOptionsError)}
				withSpaceBottom
			/>

			<Table
				columns={getColumns()}
				dataSource={dataSource}
				expandable={{
					expandedRowRender: (item) => (
						<List
							dataSource={item.fields.split(',')}
							header={<Typography.Text strong>FIELDS:</Typography.Text>}
							renderItem={(field) => <List.Item>{field}</List.Item>}
							size="small"
							bordered
						/>
					),
					rowExpandable: (item) => !_.isEmpty(item.fields),
				}}
				loading={isFetchingDiscountOptions || isLoading}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: discountOptionsData?.total,
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
				scroll={{ x: 800 }}
				title={() => (
					<Typography.Text className="pl-4" strong>
						{title}
					</Typography.Text>
				)}
				bordered
			/>
		</>
	);
};
