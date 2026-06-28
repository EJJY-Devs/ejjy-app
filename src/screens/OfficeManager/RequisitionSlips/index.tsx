import { Button, Col, Input, Row, Select, Table } from 'antd';
import {
	Content,
	RequestErrors,
	TableHeaderRequisitionSlip,
	TimeRangeFilter,
} from 'components';
import { ViewPOInternalModal } from 'components/modals';
import { Box, Label } from 'components/elements';
import { filterOption } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
} from 'global';
import { useQueryParams, useRequisitionSlips, useBranches } from 'hooks';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { convertIntoArray, formatDateTime } from 'utils';
import './style.scss';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
	{ title: 'Customer', dataIndex: 'branch' },
	{ title: 'Vendor', dataIndex: 'vendor' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'Remarks', dataIndex: 'overallRemarks' },
	{ title: 'PO', dataIndex: 'poAction' },
];

export const RequisitionSlips = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { requisitionSlips, total },
		isFetching: isFetchingRequisitionSlips,
		error: listError,
	} = useRequisitionSlips({
		params: {
			...params,
		},
	});

	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// METHODS
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const {
				id,
				branch,
				datetime_created,
				reference_number,
				vendor,
				overall_remarks,
				linked_purchase_order,
			} = requisitionSlip;

			return {
				key: id,
				id: (
					<Link to={`/office-manager/requisition-slips/${id}`}>
						{reference_number}
					</Link>
				),
				branch: branch?.name || EMPTY_CELL,
				vendor: vendor?.name || EMPTY_CELL,
				datetimeCreated: formatDateTime(datetime_created),
				status: EMPTY_CELL,
				overallRemarks: overall_remarks,
				poAction: linked_purchase_order ? (
					<Button
						type="link"
						onClick={() => setSelectedPurchase(requisitionSlip)}
					>
						{linked_purchase_order.reference_number}
					</Button>
				) : (
					EMPTY_CELL
				),
			};
		});

		setDataSource(formattedProducts);
	}, [requisitionSlips]);

	return (
		<>
			<Content className="RequisitionSlips" title="Requisition Slips">
				<Box className="px-6" padding>
					<TableHeaderRequisitionSlip />

					<RequestErrors
						className="px-6"
						errors={[
							...convertIntoArray(listError),
							...convertIntoArray(branchErrors),
						]}
						withSpaceBottom
					/>

					<Filter
						branches={branches}
						isLoading={isFetchingRequisitionSlips || isFetchingBranches}
					/>

					<Table
						columns={columns}
						dataSource={dataSource}
						loading={isFetchingRequisitionSlips}
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
							pageSizeOptions: ['5', '10', '15'],
						}}
						bordered
					/>
				</Box>
			</Content>

			{selectedPurchase && (
				<ViewPOInternalModal
					poReferenceNumber={
						selectedPurchase?.linked_purchase_order?.reference_number
					}
					requisitionSlip={selectedPurchase}
					onClose={() => setSelectedPurchase(null)}
				/>
			)}
		</>
	);
};

const Filter = ({ isLoading, branches }) => {
	const { params, setQueryParams } = useQueryParams();

	const handleRsSearchDebounced = useCallback(
		debounce((value) => {
			setQueryParams({ rsSearch: value }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	const handlePoSearchDebounced = useCallback(
		debounce((value) => {
			setQueryParams({ poSearch: value }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<Row className="mb-4" gutter={[24, 24]}>
			<Col span={24}>
				<div className="mb-3">
					<TimeRangeFilter disabled={isLoading} />
				</div>
				<Row gutter={16}>
					<Col style={{ minWidth: 250 }}>
						<Label label="Requisition Slip" spacing />
						<Input
							defaultValue={params.rsSearch}
							disabled={isLoading}
							placeholder="RS number..."
							allowClear
							onChange={(e) => handleRsSearchDebounced(e.target.value)}
						/>
					</Col>
					<Col style={{ minWidth: 250 }}>
						<Label label="Purchase Order" spacing />
						<Input
							defaultValue={params.poSearch}
							disabled={isLoading}
							placeholder="PO number..."
							allowClear
							onChange={(e) => handlePoSearchDebounced(e.target.value)}
						/>
					</Col>
					<Col style={{ minWidth: 250 }}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							defaultValue={
								params.branchId ? Number(params.branchId) : undefined
							}
							disabled={isLoading}
							filterOption={filterOption}
							optionFilterProp="children"
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
					<Col style={{ minWidth: 200 }}>
						<Label label="Type" spacing />
						<Select
							className="w-100"
							defaultValue={params.slipType || undefined}
							disabled={isLoading}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams({ slipType: value }, { shouldResetPage: true });
							}}
						>
							<Select.Option value="customer">Customer</Select.Option>
							<Select.Option value="vendor">Vendor</Select.Option>
						</Select>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};
