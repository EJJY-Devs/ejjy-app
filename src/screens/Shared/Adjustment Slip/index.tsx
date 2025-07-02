import { Button, Table, Row, Col, Select } from 'antd';
import { Content, TimeRangeFilter } from 'components';
import { Box, Label } from 'components/elements';
import { ViewAdjustmentSlipModal } from 'components/modals/ViewAdjustmentSlipModal';
import { useQueryParams, useBranches, useAdjustmentSlips } from 'hooks';
import { getAppType, formatDateTime, getLocalBranchId } from 'utils';
import React, { useState, useEffect } from 'react';
import { Cart } from 'screens/Shared/Cart';
import { EMPTY_CELL, filterOption, MAX_PAGE_SIZE } from 'ejjy-global';
import { pageSizeOptions, DEFAULT_PAGE, appTypes } from 'global';

import './style.scss';

export const AdjustmentSlip = () => {
	const [dataSource, setDataSource] = useState([]);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
	const [selectedAdjustmentSlip, setSelectedAdjustmentSlip] = useState(null);

	const { params, setQueryParams } = useQueryParams();
	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	const {
		data: adjustmentSlips,
		isFetching: isFetchingAdjustmentSlips,
	} = useAdjustmentSlips({
		params: {
			...params,
			...(!isHeadOffice && { branchId: getLocalBranchId() }),
		},
		options: { enabled: true },
	});

	const {
		data: { branches },
		isFetching: isFetchingBranches,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	const columns = [
		{ title: 'ID', dataIndex: 'id' },
		{ title: 'Date/Time', dataIndex: 'datetime' },
		{ title: 'Branch', dataIndex: 'branch' },
	];

	useEffect(() => {
		const mapped = adjustmentSlips?.adjustmentSlips?.map((item) => ({
			key: item.id,
			id: (
				<Button
					className="pa-0"
					type="link"
					onClick={() => setSelectedAdjustmentSlip(item.id)}
				>
					{item.id}
				</Button>
			),
			datetime: formatDateTime(item.datetime_created),
			branch: item.branch?.name || EMPTY_CELL,
		}));
		setDataSource(mapped);
	}, [adjustmentSlips]);

	return (
		<>
			<Content title="Adjustment Slip">
				<Box className="AdjustmentSlip_box">
					<div className="AdjustmentSlip_div">
						<Filter
							branches={branches}
							isHeadOffice={isHeadOffice}
							isLoading={isFetchingBranches || isFetchingAdjustmentSlips}
						/>

						{isHeadOffice && (
							<div className="AdjustmentSlip_create">
								<Button
									type="primary"
									onClick={() => {
										setIsCartModalVisible(true);
									}}
								>
									Create Adjustment Slip
								</Button>
							</div>
						)}
					</div>

					<Table
						className="AdjustmentSlip_tableWrapper"
						columns={columns}
						dataSource={dataSource}
						pagination={{
							current: Number(params.page) || DEFAULT_PAGE,
							pageSize: Number(params.pageSize) || 10,
							pageSizeOptions,
							showSizeChanger: true,
							position: ['bottomCenter'],
							total: adjustmentSlips?.total || 0,
						}}
						scroll={{ x: 800 }}
						bordered
						onChange={(pagination) => {
							setQueryParams({
								page: pagination.current,
								pageSize: pagination.pageSize,
							});
						}}
					/>
				</Box>

				{isCartModalVisible && (
					<Cart
						type="Adjustment Slip"
						onClose={() => setIsCartModalVisible(false)}
					/>
				)}

				{selectedAdjustmentSlip && (
					<ViewAdjustmentSlipModal
						adjustmentSlipId={selectedAdjustmentSlip}
						onClose={() => setSelectedAdjustmentSlip(null)}
					/>
				)}
			</Content>
		</>
	);
};

const Filter = ({ isLoading, branches, isHeadOffice }) => {
	const { params, setQueryParams } = useQueryParams();

	return (
		<Row>
			<Col className="AdjustmentSlip_timeRangeFilter">
				<TimeRangeFilter disabled={isLoading} />
			</Col>

			{isHeadOffice && (
				<Col className="AdjustmentSlip_branchFilter" lg={4}>
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
