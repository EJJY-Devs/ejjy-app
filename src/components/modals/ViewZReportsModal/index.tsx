import { Button, Col, Modal, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors } from 'components/RequestErrors';
import { TimeRangeFilter } from 'components/TimeRangeFilter';
import {
	AUTOMATIC_GENERATED_REPORT_USER_NAME,
	BranchMachine,
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	User,
	ViewZReadReportModal,
	ZReadReport,
	convertIntoArray,
	formatDate,
	getFullName,
	useZReadReports,
	userTypes,
} from 'ejjy-global';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { useQueryParams, useSiteSettingsNew } from 'hooks';
import React, { useEffect, useState } from 'react';
import { getLocalApiUrl } from 'utils';

type TableRow = {
	key: number;
	datetimeCreated: React.ReactElement;
};

const columns: ColumnsType<TableRow> = [
	{ title: 'Date', dataIndex: 'datetimeCreated' },
];

const TIME_RANGE_PARAM_KEY = 'zreadTimeRange';

interface Props {
	branchMachine: BranchMachine;
	onClose: () => void;
}

export const ViewZReportsModal = ({ branchMachine, onClose }: Props) => {
	// STATES
	const [selectedZReadReport, setSelectedZReadReport] = useState<ZReadReport>();
	const [dataSource, setDataSource] = useState<TableRow[]>([]);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);
	const [userPrinter, setUserPrinter] = useState<User | null>(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: zReadReportsData,
		isFetching: isFetchingZReadReports,
		error: zReadReportsError,
	} = useZReadReports({
		params: {
			...params,
			branchMachineName: branchMachine.name,
			timeRange: params[TIME_RANGE_PARAM_KEY] as string,
		},
		serviceOptions: { baseURL: getLocalApiUrl() },
	});

	// METHODS
	useEffect(() => {
		if (zReadReportsData?.list) {
			const data = zReadReportsData.list.map((report) => ({
				key: report.id,
				datetimeCreated: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => {
							setAuthorizeConfig({
								description: 'Authorize Viewing of Z-Read Report',
								userTypes: [
									userTypes.ADMIN,
									userTypes.OFFICE_MANAGER,
									userTypes.BRANCH_MANAGER,
								],
								onSuccess: (user) => {
									setUserPrinter(user);
									setSelectedZReadReport(report);
									setAuthorizeConfig(null);
								},
							});
						}}
					>
						{report.generation_datetime
							? formatDate(report.generation_datetime)
							: EMPTY_CELL}
					</Button>
				),
				user: report.generated_by
					? getFullName(report.generated_by)
					: AUTOMATIC_GENERATED_REPORT_USER_NAME,
			}));

			setDataSource(data);
		}
	}, [zReadReportsData?.list]);

	return (
		<Modal
			className="Modal__hasFooter"
			footer={<Button onClick={onClose}>Close</Button>}
			title="Z-report Reports"
			width={500}
			centered
			closable
			open
			onCancel={onClose}
		>
			<Filter isLoading={isFetchingZReadReports} />

			<RequestErrors
				errors={convertIntoArray(zReadReportsError)}
				withSpaceBottom
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingZReadReports}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: zReadReportsData?.total || 0,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page) => {
						setQueryParams({ page }, { shouldResetPage: false });
					},
					disabled: !dataSource,
					showSizeChanger: false,
					position: ['bottomCenter'],
				}}
			/>

			{selectedZReadReport && siteSettings && (
				<ViewZReadReportModal
					report={selectedZReadReport}
					siteSettings={siteSettings}
					user={userPrinter}
					onClose={() => setSelectedZReadReport(undefined)}
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
