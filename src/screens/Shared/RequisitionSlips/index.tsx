import { ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Space, Table, Tooltip } from 'antd';
import {
	Content,
	RequestErrors,
	TableHeaderRequisitionSlip,
	TimeRangeFilter,
} from 'components';
import { ViewPOInternalModal } from 'components/modals';
import { Box, Label } from 'components/elements';
import { Cart } from 'screens/Shared/Cart';
import { filterOption } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	SEARCH_DEBOUNCE_TIME,
	appTypes,
} from 'global';
import { useBranches, useQueryParams, useRequisitionSlips } from 'hooks';
import { capitalize, debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import {
	convertIntoArray,
	formatDateTime,
	getAppType,
	getLocalBranchId,
} from 'utils';

export const RequisitionSlips = () => {
	const isBackOffice = getAppType() === appTypes.BACK_OFFICE;

	const [dataSource, setDataSource] = useState([]);
	const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
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

	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: !isBackOffice },
	});

	useEffect(() => {
		const formatted = requisitionSlips.map((rs: any) => {
			const {
				id,
				datetime_created,
				reference_number,
				slip_type,
				branch,
				vendor,
				overall_remarks,
				linked_purchase_order,
			} = rs;

			return {
				key: id,
				id: (
					<Link
						to={`/${isBackOffice ? 'branch-manager' : 'office-manager'}/requisition-slips/${id}`}
					>
						{reference_number}
					</Link>
				),
				type: capitalize(slip_type) || EMPTY_CELL,
				branch: branch?.name || EMPTY_CELL,
				vendor: vendor?.name || EMPTY_CELL,
				datetimeCreated: formatDateTime(datetime_created),
				status: EMPTY_CELL,
				overallRemarks: overall_remarks,
				poAction: linked_purchase_order ? (
					<Button type="link" onClick={() => setSelectedPurchase(rs)}>
						{linked_purchase_order.reference_number}
					</Button>
				) : isBackOffice ? (
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
				) : (
					EMPTY_CELL
				),
			};
		});

		setDataSource(formatted);
	}, [requisitionSlips]);

	const columns = [
		{ title: 'ID', dataIndex: 'id' },
		{ title: 'Date & Time', dataIndex: 'datetimeCreated' },
		...(isBackOffice
			? [{ title: 'Type', dataIndex: 'type' }]
			: [
					{ title: 'Customer', dataIndex: 'branch' },
					{ title: 'Vendor', dataIndex: 'vendor' },
			  ]),
		{ title: 'Status', dataIndex: 'status' },
		{ title: 'Remarks', dataIndex: 'overallRemarks' },
		{ title: 'PO', dataIndex: 'poAction' },
	];

	return (
		<>
			<Content title="Requisition Slips">
				<Box className="px-6" padding>
					{isBackOffice ? (
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
					) : (
						<TableHeaderRequisitionSlip />
					)}

					<RequestErrors
						className="px-6"
						errors={[
							...convertIntoArray(listError),
							...convertIntoArray(branchErrors),
						]}
						withSpaceBottom
					/>

					<Filter
						branches={isBackOffice ? undefined : branches}
						isLoading={
							isFetchingRequisitionSlips ||
							(!isBackOffice && isFetchingBranches)
						}
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

			{isBackOffice && isCartModalVisible && (
				<Cart
					type="Requisition Slip"
					onClose={() => setIsCartModalVisible(false)}
					onRefetch={() =>
						queryClient.invalidateQueries('useRequisitionSlips')
					}
				/>
			)}

			{isBackOffice && isPoCartVisible && (
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
					onRefetch={() =>
						queryClient.invalidateQueries('useRequisitionSlips')
					}
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

interface FilterProps {
	branches?: any[];
	isLoading: boolean;
}

const Filter = ({ branches, isLoading }: FilterProps) => {
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
							placeholder="RS number..."
							allowClear
							onChange={(e) => handleRsSearchDebounced(e.target.value)}
						/>
					</Col>
					<Col style={{ minWidth: 250 }}>
						<Label label="Purchase Order" spacing />
						<Input
							defaultValue={params.poSearch}
							placeholder="PO number..."
							allowClear
							onChange={(e) => handlePoSearchDebounced(e.target.value)}
						/>
					</Col>
					{branches !== undefined && (
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
									setQueryParams(
										{ branchId: value },
										{ shouldResetPage: true },
									);
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
