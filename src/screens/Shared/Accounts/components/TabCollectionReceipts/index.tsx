import { Button, Col, Row, Select, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import {
	CollectionReceipt,
	formatDateTime,
	getFullName,
	SEARCH_DEBOUNCE_TIME,
	timeRangeTypes,
	useAccounts,
	useCollectionReceipts,
	ViewCollectionReceiptModal,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	refetchOptions,
} from 'global';
import { useQueryParams, useSiteSettings } from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { convertIntoArray, formatInPeso, getLocalApiUrl } from 'utils';

const columns: ColumnsType = [
	{ title: 'CR #', dataIndex: 'id' },
	{ title: 'OP #', dataIndex: 'orderOfPaymentId' },
	{ title: 'Date & Time Created', dataIndex: 'datetime' },
	{ title: 'Payor', dataIndex: 'payor' },
	{ title: 'Amount', dataIndex: 'amount' },
];

export const TabCollectionReceipts = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [
		selectedCollectionReceipt,
		setSelectedCollectionReceipt,
	] = useState<CollectionReceipt | null>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: siteSettings,
		isFetching: isFetchingSiteSettings,
		error: siteSettingsError,
	} = useSiteSettings();
	const {
		data: collectionReceiptsData,
		isFetching: isFetchingCollectionReceipts,
		error: collectionReceiptsError,
	} = useCollectionReceipts({
		params: {
			...params,
			timeRange: (params?.timeRange || timeRangeTypes.DAILY) as string,
		},
		options: refetchOptions,
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	// METHODS
	useEffect(() => {
		const data = collectionReceiptsData?.list.map((collectionReceipt) => {
			const {
				id,
				amount,
				order_of_payment,
				datetime_created,
			} = collectionReceipt;
			const { payor, id: orderOfPaymentId } = order_of_payment;

			return {
				key: id,
				id: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => setSelectedCollectionReceipt(collectionReceipt)}
					>
						{id}
					</Button>
				),
				orderOfPaymentId,
				datetime: formatDateTime(datetime_created),
				payor: getFullName(payor),
				amount: formatInPeso(amount),
			};
		});

		setDataSource(data);
	}, [collectionReceiptsData?.list]);

	return (
		<>
			<TableHeader title="Collection Receipts" wrapperClassName="pt-2 px-0" />

			<RequestErrors
				errors={[
					...convertIntoArray(collectionReceiptsError, 'Collection Receipts'),
					...convertIntoArray(siteSettingsError, 'Settings'),
				]}
				withSpaceBottom
			/>

			<Filter isLoading={isFetchingCollectionReceipts} />

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingCollectionReceipts || isFetchingSiteSettings}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: collectionReceiptsData?.total || 0,
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
				bordered
			/>

			{selectedCollectionReceipt && siteSettings && (
				<ViewCollectionReceiptModal
					collectionReceipt={selectedCollectionReceipt}
					siteSettings={siteSettings}
					onClose={() => setSelectedCollectionReceipt(null)}
				/>
			)}
		</>
	);
};

type FilterProps = {
	isLoading: boolean;
};

const Filter = ({ isLoading }: FilterProps) => {
	// STATES
	const [accountSearch, setAccountSearch] = useState('');

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: accountsData, isFetching: isFetchingAccounts } = useAccounts({
		params: { search: accountSearch },
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	// METHODS
	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setAccountSearch(search);
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<Row className="mb-4" gutter={[16, 16]}>
			<Col lg={12} span={24}>
				<Label label="Payor" spacing />
				<Select
					className="w-100"
					defaultActiveFirstOption={false}
					filterOption={false}
					notFoundContent={isFetchingAccounts ? <Spin size="small" /> : null}
					value={params.payorId ? Number(params.payorId) : null}
					allowClear
					showSearch
					onChange={(value) => {
						setQueryParams({ payorId: value }, { shouldResetPage: true });
					}}
					onSearch={handleSearchDebounced}
				>
					{accountsData?.list?.map((account) => (
						<Select.Option key={account.id} value={account.id}>
							{getFullName(account)}
						</Select.Option>
					))}
				</Select>
			</Col>
			<Col lg={12} span={24}>
				<TimeRangeFilter disabled={isLoading} />
			</Col>
		</Row>
	);
};
