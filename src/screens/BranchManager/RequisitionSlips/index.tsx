/* eslint-disable no-underscore-dangle */
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Space, Table, Tooltip } from 'antd';
import { Content, RequestErrors, TimeRangeFilter } from 'components';
import { ViewPOInternalModal } from 'components/modals';
import { Box, Label } from 'components/elements';
import { Cart } from 'screens/Shared/Cart';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	SEARCH_DEBOUNCE_TIME,
} from 'global';
import { useQueryParams, useRequisitionSlips } from 'hooks';
import { capitalize, debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { convertIntoArray, formatDateTime, getLocalBranchId } from 'utils';

export const RequisitionSlips = () => {
	const [dataSource, setDataSource] = useState([]);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
	const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
	const [isPoCartVisible, setIsPoCartVisible] = useState(false);
	const [selectedRsId, setSelectedRsId] = useState<number | null>(null);
	const [rsProductsForPo, setRsProductsForPo] = useState<any[]>([]);

	const queryClient = useQueryClient();
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { requisitionSlips, total },
		isFetching: isFetchingRequisitionSlips,
		error: listError,
	} = useRequisitionSlips({ params: { ...params } });

	useEffect(() => {
		const formatted = requisitionSlips.map((rs: any) => {
			const {
				id,
				datetime_created,
				reference_number,
				slip_type,
				overall_remarks,
				linked_purchase_order,
			} = rs;

			return {
				key: id,
				id: (
					<Link to={`/branch-manager/requisition-slips/${id}`}>
						{reference_number}
					</Link>
				),
				type: capitalize(slip_type) || EMPTY_CELL,
				datetimeCreated: formatDateTime(datetime_created),
				status: EMPTY_CELL,
				overallRemarks: overall_remarks,
				poAction: linked_purchase_order ? (
					<Button type="link" onClick={() => setSelectedPurchase(rs)}>
						{linked_purchase_order.reference_number}
					</Button>
				) : (
					<Tooltip title="Create Purchase Order">
						<Button
							icon={<ShoppingCartOutlined />}
							shape="circle"
							size="small"
							type="primary"
							onClick={() => {
								setSelectedRsId(id);
								setRsProductsForPo(rs.products || []);
								setIsPoCartVisible(true);
							}}
						/>
					</Tooltip>
				),
			};
		});

		setDataSource(formatted);
	}, [requisitionSlips]);

	const columns = [
		{ title: 'ID', dataIndex: 'id' },
		{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
		{ title: 'Type', dataIndex: 'type' },
		{ title: 'Status', dataIndex: 'status' },
		{ title: 'Remarks', dataIndex: 'overallRemarks' },
		{ title: 'PO', dataIndex: 'poAction' },
	];

	return (
		<>
			<Content title="Requisition Slips">
				<Box className="px-6" padding>
					<div className="pa-6 d-flex justify-end">
						<Space>
							<Button
								type="primary"
								onClick={() => setIsCartModalVisible(true)}
							>
								Create Requisition Slip
							</Button>
						</Space>
					</div>

					<RequestErrors
						className="px-6"
						errors={[...convertIntoArray(listError)]}
						withSpaceBottom
					/>

					<Filter isLoading={isFetchingRequisitionSlips} />

					<Table
						columns={columns}
						dataSource={dataSource}
						loading={isFetchingRequisitionSlips}
						pagination={{
							current: Number(params.page) || DEFAULT_PAGE,
							total,
							pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
							onChange: (page, newPageSize) => {
								setQueryParams({ page, pageSize: newPageSize });
							},
							disabled: !dataSource,
							position: ['bottomCenter'],
							pageSizeOptions: ['5', '10', '15'],
						}}
						scroll={{ x: 1000 }}
						bordered
					/>
				</Box>
			</Content>

			{isCartModalVisible && (
				<Cart
					type="Requisition Slip"
					onClose={() => setIsCartModalVisible(false)}
					onRefetch={() => queryClient.invalidateQueries('useRequisitionSlips')}
				/>
			)}

			{isPoCartVisible && (
				<Cart
					branchId={getLocalBranchId()}
					requisitionSlipId={selectedRsId}
					rsProducts={rsProductsForPo}
					type="Purchase Order"
					onClose={() => {
						setIsPoCartVisible(false);
						setSelectedRsId(null);
						setRsProductsForPo([]);
					}}
					onRefetch={() => queryClient.invalidateQueries('useRequisitionSlips')}
				/>
			)}

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

const Filter = ({ isLoading }) => {
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
