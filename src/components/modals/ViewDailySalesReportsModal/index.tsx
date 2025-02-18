import { Button, Col, Modal, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors } from 'components/RequestErrors';
import { TimeRangeFilter } from 'components/TimeRangeFilter';
import {
	AuthorizationModal,
	BranchMachine,
	DailySales,
	DATE_FORMAT,
	formatDate,
	useDailySales,
	User,
	userTypes,
	ViewDailySalesModal,
} from 'ejjy-global';
import { Props as AuthorizationModalProps } from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
import { useQueryParams, useSiteSettingsNew } from 'hooks';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, getLocalApiUrl } from 'utils';

const TIME_RANGE_PARAM_KEY = 'dailySalesTimeRange';

type TableRow = {
	key: number;
	datetimeCreated: React.ReactElement;
};

const columns: ColumnsType<TableRow> = [
	{ title: 'Date', dataIndex: 'datetimeCreated' },
];

interface Props {
	branchMachine: BranchMachine;
	onClose: () => void;
}

export const ViewDailySalesReportsModal = ({
	branchMachine,
	onClose,
}: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState<TableRow[]>([]);
	const [
		selectedDailySales,
		setSelectedDailySales,
	] = useState<DailySales | null>(null);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);
	const [userPrinter, setUserPrinter] = useState<User | null>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: dailySalesData,
		isFetching: isFetchingDailySales,
		error: dailySalesErrors,
	} = useDailySales({
		params: {
			...params,
			isWithDailySalesData: true,
			branchMachineName: branchMachine.name,
			timeRange: params[TIME_RANGE_PARAM_KEY] as string,
		},
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	// METHODS
	useEffect(() => {
		const firstDate = moment().clone().startOf('month').format(DATE_FORMAT);
		const lastDate = moment().clone().endOf('month').format(DATE_FORMAT);

		setQueryParams(
			{ [TIME_RANGE_PARAM_KEY]: [firstDate, lastDate].join(',') },
			{ shouldResetPage: true },
		);
	}, []);

	useEffect(() => {
		if (dailySalesData?.list) {
			const formattedDailySales = dailySalesData.list.map((dailySale) => {
				const { daily_sales_data: dsData } = dailySale;

				return {
					key: dailySale.id,
					datetimeCreated: (
						<Button
							className="pa-0"
							type="link"
							onClick={() => {
								setAuthorizeConfig({
									description: 'Authorize Viewing of Daily Sales',
									userTypes: [userTypes.ADMIN],
									onSuccess: (user) => {
										setUserPrinter(user);
										setSelectedDailySales(dailySale);
										setAuthorizeConfig(null);
									},
								});
							}}
						>
							{formatDate(dsData.date)}
						</Button>
					),
				};
			});

			setDataSource(formattedDailySales);
		}
	}, [dailySalesData?.list]);

	return (
		<Modal
			className="Modal__hasFooter"
			footer={<Button onClick={onClose}>Close</Button>}
			title="Daily Sales"
			width={500}
			centered
			closable
			open
			onCancel={onClose}
		>
			<Filter isLoading={isFetchingDailySales} />

			<RequestErrors
				errors={convertIntoArray(dailySalesErrors)}
				withSpaceBottom
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingDailySales}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: dailySalesData?.total || 0,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page) => {
						setQueryParams({ page }, { shouldResetPage: false });
					},
					disabled: !dataSource,
					showSizeChanger: false,
					position: ['bottomCenter'],
				}}
			/>

			{selectedDailySales && siteSettings && userPrinter && (
				<ViewDailySalesModal
					dailySales={selectedDailySales}
					siteSettings={siteSettings}
					user={userPrinter}
					onClose={() => setSelectedDailySales(null)}
				/>
			)}

			{authorizeConfig && (
				<AuthorizationModal
					{...authorizeConfig}
					baseURL={getLocalApiUrl()}
					onCancel={() => setAuthorizeConfig(null)}
				/>
			)}
		</Modal>
	);
};

interface FilterProps {
	isLoading: boolean;
}

const Filter = ({ isLoading }: FilterProps) => (
	<Row className="mb-4" gutter={[16, 16]}>
		<Col span={24}>
			<TimeRangeFilter disabled={isLoading} queryName={TIME_RANGE_PARAM_KEY} />
		</Col>
	</Row>
);
