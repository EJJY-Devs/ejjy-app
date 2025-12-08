import { Button, Table, Row, Col, Select } from 'antd';
import { Content, TimeRangeFilter } from 'components';
import { Box, Label } from 'components/elements';
import {
	useQueryParams,
	useBranchProductBalanceTypeUpdateLogs,
	useBranches,
} from 'hooks';
import { formatDateTime, getAppType, getLocalBranchId } from 'utils';
import React, { useState } from 'react';
import { EMPTY_CELL, getFullName, filterOption } from 'ejjy-global';
import { pageSizeOptions, DEFAULT_PAGE, appTypes, MAX_PAGE_SIZE } from 'global';
import { ProductConversionCart } from './components/ProductConversionCart';

import './style.scss';

export const ProductConversion = () => {
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);

	const { params, setQueryParams } = useQueryParams();
	const localBranchId = getLocalBranchId();
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	// For head office, use the filter branchId if provided, otherwise show all branches
	const branchId = isHeadOffice ? params.branchId : localBranchId;

	const { data: branchesData, isFetching: isFetchingBranches } = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: isHeadOffice },
	});

	const { data, isFetching } = useBranchProductBalanceTypeUpdateLogs({
		params: {
			branchId,
			timeRange: params.timeRange,
			page: params.page,
			pageSize: params.pageSize,
		},
	});

	const logs = data?.logs || [];
	const total = data?.total || 0;

	// Group logs by conversion_group_id to show conversions together
	const groupedLogs = logs.reduce((acc, log) => {
		const key = log.conversion_group_id || `${log.id}`;
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(log);
		return acc;
	}, {});

	const dataSource = Object.entries(groupedLogs)
		.map(([key, logGroup]: [string, any[]]) => {
			// Sort by value to identify stock out (negative) and stock in (positive)
			const sortedLogs = logGroup.sort((a, b) => a.value - b.value);
			const stockOut = sortedLogs.find((log) => log.value < 0);
			const stockIn = sortedLogs.find((log) => log.value > 0);

			const datetime = stockOut?.datetime_created || stockIn?.datetime_created;

			// Get branch name from branch_id
			const getBranchName = () => {
				const logBranchId =
					stockOut?.branch_product?.branch_id ||
					stockIn?.branch_product?.branch_id;
				if (logBranchId && branchesData?.branches) {
					const branch = branchesData.branches.find(
						(b) => b.id === logBranchId,
					);
					return branch?.name || EMPTY_CELL;
				}
				return EMPTY_CELL;
			};

			return {
				key,
				datetime: formatDateTime(datetime),
				datetimeRaw: datetime,
				branchName: getBranchName(),
				stockOutProductName:
					stockOut?.branch_product?.product?.name || EMPTY_CELL,
				stockOutQty: stockOut ? Math.abs(stockOut.value) : EMPTY_CELL,
				stockInProductName:
					stockIn?.branch_product?.product?.name || EMPTY_CELL,
				stockInQty: stockIn?.value || EMPTY_CELL,
				authorizer:
					getFullName(stockOut?.authorizer) ||
					getFullName(stockIn?.authorizer) ||
					EMPTY_CELL,
			};
		})
		.sort((a, b) => {
			return (
				new Date(b.datetimeRaw).getTime() - new Date(a.datetimeRaw).getTime()
			);
		});

	const columns = [
		{
			title: 'Date & Time',
			dataIndex: 'datetime',
			key: 'datetime',
			width: 250,
		},
		...(isHeadOffice
			? [{ title: 'Branch', dataIndex: 'branchName', key: 'branchName' }]
			: []),
		{
			title: 'Stock Out',
			children: [
				{
					title: 'Product Name',
					dataIndex: 'stockOutProductName',
					key: 'stockOutProductName',
				},
				{ title: 'Qty', dataIndex: 'stockOutQty', key: 'stockOutQty' },
			],
		},
		{
			title: 'Stock In',
			children: [
				{
					title: 'Product Name',
					dataIndex: 'stockInProductName',
					key: 'stockInProductName',
				},
				{ title: 'Qty', dataIndex: 'stockInQty', key: 'stockInQty' },
			],
		},
		{ title: 'Authorizer', dataIndex: 'authorizer', key: 'authorizer' },
	];

	return (
		<>
			<Content title="Product Conversion">
				<Box className="ProductConversion_box">
					{!isHeadOffice && (
						<div className="ProductConversion_buttons">
							<Button
								type="primary"
								onClick={() => setIsCartModalVisible(true)}
							>
								Convert Product
							</Button>
						</div>
					)}

					<Filter
						branches={branchesData?.branches || []}
						isHeadOffice={isHeadOffice}
						isLoading={isFetching || isFetchingBranches}
					/>

					<Table
						className="ProductConversion_tableWrapper"
						columns={columns}
						dataSource={dataSource}
						loading={isFetching}
						pagination={{
							current: Number(params.page) || DEFAULT_PAGE,
							total,
							pageSize: Number(params.pageSize) || 10,
							position: ['bottomCenter'],
							pageSizeOptions,
							onChange: (page, newPageSize) => {
								setQueryParams({ page, pageSize: newPageSize });
							},
							disabled: !dataSource,
						}}
						scroll={{ x: 800 }}
						bordered
					/>
				</Box>

				{isCartModalVisible && (
					<ProductConversionCart onClose={() => setIsCartModalVisible(false)} />
				)}
			</Content>
		</>
	);
};

const Filter = ({ branches, isHeadOffice, isLoading }) => {
	const { params, setQueryParams } = useQueryParams();

	return (
		<Row>
			<Col className="ProductConversion_timeRangeFilter">
				<TimeRangeFilter disabled={isLoading} />
			</Col>

			{isHeadOffice && (
				<Col className="ProductConversion_timeRangeFilter" lg={4}>
					<Label label="Branch" spacing />
					<Select
						className="w-100"
						disabled={isLoading}
						filterOption={filterOption}
						optionFilterProp="children"
						placeholder="Select Branch"
						value={params.branchId ? Number(params.branchId) : undefined}
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ branchId: value }, { shouldResetPage: true });
						}}
					>
						{branches?.map(({ id, name }) => (
							<Select.Option key={id} value={id}>
								{name}
							</Select.Option>
						))}
					</Select>
				</Col>
			)}
		</Row>
	);
};
