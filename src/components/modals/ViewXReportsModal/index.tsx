// import { ThunderboltOutlined } from '@ant-design/icons';
import { Button, Col, Modal, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors } from 'components/RequestErrors';
import { TimeRangeFilter } from 'components/TimeRangeFilter';
import {
	AuthorizationModal,
	AUTOMATIC_GENERATED_REPORT_USER_NAME,
	BranchMachine,
	EMPTY_CELL,
	formatDate,
	formatTime,
	getFullName,
	User,
	userTypes,
	useXReadReports,
	ViewXReadReportModal,
	XReadReport,
} from 'ejjy-global';
import { Props as AuthorizationModalProps } from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from 'global';
// import { GENERIC_ERROR_MESSAGE } from 'global';
import { useQueryParams, useSiteSettingsNew } from 'hooks';
import React, { useEffect, useState } from 'react';
// import { XReadReportsService } from 'services';
import { convertIntoArray, getReportsApiUrl } from 'utils';

const TIME_RANGE_PARAM_KEY = 'xreadTimeRange';

type TableRow = {
	key: number;
	date: React.ReactElement;
	time: string;
	user: string;
};

const columns: ColumnsType<TableRow> = [
	{ title: 'Date', dataIndex: 'date' },
	{ title: 'Time', dataIndex: 'time' },
	{ title: 'User', dataIndex: 'user' },
];

type Props = {
	branchMachine: BranchMachine;
	onClose: () => void;
};

export const ViewXReportsModal = ({ branchMachine, onClose }: Props) => {
	// STATES
	const [
		selectedXReadReport,
		setSelectedXReadReport,
	] = useState<XReadReport | null>(null);
	const [dataSource, setDataSource] = useState<TableRow[]>([]);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);
	const [userPrinter, setUserPrinter] = useState<User | null>(null);
	// const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();
	const {
		data: xReadReportsData,
		isFetching: isFetchingXReadReports,
		error: xReadReportsError,
	} = useXReadReports({
		params: {
			...params,
			branchMachineName: branchMachine.name,
			timeRange: params[TIME_RANGE_PARAM_KEY] as string,
		},
		serviceOptions: { baseURL: getReportsApiUrl() },
	});

	// METHODS
	useEffect(() => {
		if (xReadReportsData?.list) {
			const data = xReadReportsData.list.map((report) => ({
				key: report.id,
				date: (
					<Button
						className="pa-0"
						type="link"
						onClick={() => {
							setAuthorizeConfig({
								description: 'Authorize Viewing of X-Read Report',
								userTypes: [
									userTypes.ADMIN,
									userTypes.OFFICE_MANAGER,
									userTypes.BRANCH_MANAGER,
								],
								onSuccess: (user) => {
									setUserPrinter(user);
									setSelectedXReadReport(report);
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
				time: formatTime(report.generation_datetime),
				user: report.cashiering_session?.user
					? getFullName(report.cashiering_session.user)
					: AUTOMATIC_GENERATED_REPORT_USER_NAME,
			}));

			setDataSource(data);
		}
	}, [xReadReportsData?.list]);

	// GENERATE AS OF NOW (disabled)
	// const handleGeneratePreview = () => {
	// 	setAuthorizeConfig({
	// 		description: 'Authorize Generation of X-Read Report',
	// 		userTypes: [
	// 			userTypes.ADMIN,
	// 			userTypes.OFFICE_MANAGER,
	// 			userTypes.BRANCH_MANAGER,
	// 		],
	// 		onSuccess: async (user) => {
	// 			setIsGeneratingPreview(true);
	//
	// 			try {
	// 				const response = await XReadReportsService.create(
	// 					{
	// 						branch_machine_id: branchMachine.id,
	// 						user_id: user.id,
	// 						is_preview: true,
	// 					} as any,
	// 					getReportsApiUrl(),
	// 				);
	//
	// 				setUserPrinter(user);
	// 				setSelectedXReadReport(response.data);
	// 			} catch (error) {
	// 				message.error(GENERIC_ERROR_MESSAGE);
	// 			} finally {
	// 				setIsGeneratingPreview(false);
	// 				setAuthorizeConfig(null);
	// 			}
	// 		},
	// 	});
	// };

	return (
		<Modal
			className="Modal__hasFooter"
			footer={<Button onClick={onClose}>Close</Button>}
			title="X-read Reports"
			// GENERATE AS OF NOW (disabled) — swap the title above for this to re-enable:
			// title={
			// 	<Space>
			// 		<span>X-read Reports</span>
			// 		<Tooltip title="Generate As of Now">
			// 			<Button
			// 				icon={<ThunderboltOutlined />}
			// 				loading={isGeneratingPreview}
			// 				shape="circle"
			// 				size="small"
			// 				onClick={handleGeneratePreview}
			// 			/>
			// 		</Tooltip>
			// 	</Space>
			// }
			width={600}
			centered
			closable
			open
			onCancel={onClose}
		>
			<Filter isLoading={isFetchingXReadReports} />

			<RequestErrors
				errors={convertIntoArray(xReadReportsError)}
				withSpaceBottom
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={isFetchingXReadReports}
				pagination={{
					current: Number(params.page) || DEFAULT_PAGE,
					total: xReadReportsData?.total || 0,
					pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
					onChange: (page) => {
						setQueryParams({ page }, { shouldResetPage: false });
					},
					disabled: !dataSource,
					showSizeChanger: false,
					position: ['bottomCenter'],
				}}
			/>

			{selectedXReadReport && siteSettings && (
				<ViewXReadReportModal
					report={selectedXReadReport}
					siteSettings={siteSettings}
					user={userPrinter}
					onClose={() => setSelectedXReadReport(null)}
				/>
			)}

			{authorizeConfig && (
				<AuthorizationModal
					{...authorizeConfig}
					baseURL={getReportsApiUrl()}
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
