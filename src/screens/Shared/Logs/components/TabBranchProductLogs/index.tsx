import { Col, Row, Select, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import { filterOption, getFullName } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
	pageSizeOptions,
	serviceTypes,
	userLogTypes,
} from 'global';
import {
	useBranchProducts,
	useBranches,
	useQueryParams,
	useUserLogs,
	useUsers,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	formatDateTimeExtended,
	getLocalBranchId,
	isStandAlone,
	isUserFromBranch,
} from 'utils';

export const TabBranchProductLogs = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { logs, total },
		isFetching: isFetchingLogs,
		error: logsError,
	} = useUserLogs({
		params: {
			...params,
			serviceType: isStandAlone() ? serviceTypes.NORMAL : serviceTypes.OFFLINE,
			type: userLogTypes.BRANCH_PRODUCTS,
		},
	});

	// METHODS
	useEffect(() => {
		const data = logs.map((log) => ({
			key: log.id,
			branch: log?.branch?.name || EMPTY_CELL,
			user: getFullName(log.acting_user),
			description: log.description,
			datetimeCreated: formatDateTimeExtended(log.datetime_created),
		}));

		setDataSource(data);
	}, [logs]);

	const getColumns = useCallback(() => {
		const columns: ColumnsType = [
			{ title: 'User', dataIndex: 'user' },
			{ title: 'Description', dataIndex: 'description' },
			{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
		];

		if (!isUserFromBranch(user.user_type)) {
			columns.unshift({ title: 'Branch', dataIndex: 'branch' });
		}

		return columns;
	}, [user]);

	return (
		<div>
			<TableHeader title="Branch Product Logs" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={convertIntoArray(logsError, 'Logs')}
				withSpaceBottom
			/>

			<Filter />

			<Table
				columns={getColumns()}
				dataSource={dataSource}
				loading={isFetchingLogs}
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
				scroll={{ x: 1000 }}
				bordered
			/>
		</div>
	);
};

const Filter = () => {
	// STATES
	const [productSearch, setProductSearch] = useState('');

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const user = useUserStore((state) => state.user);
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: !isUserFromBranch(user.user_type) },
	});
	const {
		data: { users },
		isFetching: isFetchingUsers,
		error: usersError,
	} = useUsers({
		params: {
			branchId: isUserFromBranch(user.user_type)
				? getLocalBranchId()
				: params.branchId,
			pageSize: MAX_PAGE_SIZE,
		},
	});
	const {
		data: { branchProducts },
		isFetching: isFetchingBranchProducts,
		error: branchProductsError,
	} = useBranchProducts({
		params: {
			ids: productSearch ? undefined : _.toString(params?.branchProductId),
			search: productSearch,
			branchId: isUserFromBranch(user.user_type)
				? getLocalBranchId()
				: params.branchId,
		},
	});

	// METHODS
	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setProductSearch(search);
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<>
			<RequestErrors
				errors={[
					...convertIntoArray(branchProductsError, 'Branch Products'),
					...convertIntoArray(usersError, 'Users'),
					...convertIntoArray(branchError, 'Branches'),
				]}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
				{!isUserFromBranch(user.user_type) && (
					<Col md={12}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
							value={params.branchId ? Number(params.branchId) : null}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams({ branchId: value }, { shouldResetPage: true });
							}}
						>
							{branches.map((branch) => (
								<Select.Option key={branch.id} value={branch.id}>
									{branch.name}
								</Select.Option>
							))}
						</Select>
					</Col>
				)}

				<Col md={12}>
					<Label label="User" spacing />
					<Select
						className="w-100"
						defaultValue={
							params.actingUserId ? Number(params.actingUserId) : null
						}
						filterOption={filterOption}
						loading={isFetchingUsers}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ actingUserId: value },
								{ shouldResetPage: true },
							);
						}}
					>
						{users.map((u) => (
							<Select.Option key={u.id} value={u.id}>
								{getFullName(u)}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col md={12}>
					<Label label="Product" spacing />
					<Select
						className="w-100"
						defaultActiveFirstOption={false}
						defaultValue={
							params.branchProductId ? Number(params.branchProductId) : null
						}
						filterOption={false}
						notFoundContent={isFetchingBranchProducts ? <Spin /> : null}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams(
								{ branchProductId: value },
								{ shouldResetPage: true },
							);
						}}
						onSearch={handleSearchDebounced}
					>
						{branchProducts.map((branchProduct) => (
							<Select.Option key={branchProduct.id} value={branchProduct.id}>
								{branchProduct.product.name}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col lg={12} span={24}>
					<TimeRangeFilter />
				</Col>
			</Row>
		</>
	);
};
