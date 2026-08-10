import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Col, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import {
	CollectionReceipt,
	formatDateTime,
	timeRangeTypes,
	useCollectionReceipts,
	ViewCollectionReceiptModal,
	ViewOrderOfPaymentModal,
} from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	pageSizeOptions,
	refetchOptions,
} from 'global';
import { useAccountRetrieve, useQueryParams, useSiteSettings } from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, formatInPeso, getLocalApiUrl } from 'utils';
import { PayorSummary } from '../PayorSummary';

const columns: ColumnsType = [
	{ title: 'CR #', dataIndex: 'referenceNumber' },
	{ title: 'OP #', dataIndex: 'orderOfPaymentReferenceNumber' },
	{ title: 'Date & Time Created', dataIndex: 'datetime' },
	{ title: 'Amount', dataIndex: 'amount' },
	{ title: 'Branch Machine', dataIndex: 'branchMachine' },
];

type Props = {
	onBack?: () => void;
};

export const TabCollectionReceipts = ({ onBack }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [
		selectedCollectionReceipt,
		setSelectedCollectionReceipt,
	] = useState<CollectionReceipt | null>(null);
	const [selectedOrderOfPayment, setSelectedOrderOfPayment] = useState<
		any | null
	>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: siteSettings,
		isFetching: isFetchingSiteSettings,
		error: siteSettingsError,
	} = useSiteSettings();
	const { data: payorAccount } = useAccountRetrieve({
		id: Number(params.payorId),
		options: { enabled: !!params.payorId },
	});
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
				reference_number,
				amount,
				order_of_payment,
				datetime_created,
				branch_machine,
			} = collectionReceipt;
			const {
				reference_number: orderOfPaymentReferenceNumber,
			} = order_of_payment;

			return {
				key: id,
				referenceNumber: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => setSelectedCollectionReceipt(collectionReceipt)}
					>
						{reference_number || id}
					</Button>
				),
				orderOfPaymentReferenceNumber: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => setSelectedOrderOfPayment(order_of_payment)}
					>
						{orderOfPaymentReferenceNumber || EMPTY_CELL}
					</Button>
				),
				datetime: formatDateTime(datetime_created),
				amount: formatInPeso(amount),
				branchMachine: branch_machine?.name || EMPTY_CELL,
			};
		});

		setDataSource(data);
	}, [collectionReceiptsData?.list]);

	return (
		<>
			{onBack && (
				<Button
					className="pa-0 mb-2"
					icon={<ArrowLeftOutlined />}
					style={{ display: 'inline-flex', alignItems: 'center' }}
					type="link"
					onClick={onBack}
				>
					Back to Credit Accounts
				</Button>
			)}

			<TableHeader title="Collection Receipts" wrapperClassName="pt-2 px-0" />

			{payorAccount && <PayorSummary account={payorAccount} />}

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

			{selectedOrderOfPayment && (
				<ViewOrderOfPaymentModal
					orderOfPayment={selectedOrderOfPayment}
					onClose={() => setSelectedOrderOfPayment(null)}
				/>
			)}
		</>
	);
};

type FilterProps = {
	isLoading: boolean;
};

const Filter = ({ isLoading }: FilterProps) => (
	<Row className="mb-4" gutter={[16, 16]}>
		<Col span={24}>
			<TimeRangeFilter disabled={isLoading} />
		</Col>
	</Row>
);
