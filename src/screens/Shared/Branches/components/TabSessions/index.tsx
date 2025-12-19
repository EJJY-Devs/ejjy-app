import { Col, Descriptions, Radio, Row, Select, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import { Label } from 'components/elements';
import { ServiceType, filterOption, getFullName, useUsers } from 'ejjy-global';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	appTypes,
	closingTypes,
	pageSizeOptions,
	refetchOptions,
	timeRangeTypes,
} from 'global';
import {
	useBranchMachines,
	useBranches,
	useQueryParams,
	useSessions,
} from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import {
	convertIntoArray,
	formatDateTimeShortMonth,
	formatTimeRange,
	getAppType,
	getLocalApiUrl,
	getLocalBranchId,
	isStandAlone,
} from 'utils';

const sessionTypes = {
	ALL: 'all',
	AUTHORIZED: 'authorized',
	UNAUTHORIZED: 'unauthorized',
};

interface Props {
	branchId?: number;
	branchMachineId?: number;
}

export const TabSessions = ({ branchId, branchMachineId }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { sessions, total },
		error: sessionsError,
		isFetching: isFetchingSessions,
		isFetchedAfterMount: isSessionsFetchedAfterMount,
	} = useSessions({
		params: {
			...params,
			branchId: branchId || params?.branchId,
			branchMachineId: branchMachineId || params?.branchMachineId,
			timeRange: params?.timeRange || timeRangeTypes.DAILY,
			isAutomaticallyClosed: (() => {
				let isAutomaticallyClosed;
				if (params.closingType === closingTypes.AUTOMATIC) {
					isAutomaticallyClosed = true;
				} else if (params.closingType === closingTypes.MANUAL) {
					isAutomaticallyClosed = false;
				}

				return isAutomaticallyClosed;
			})(),
			isUnauthorized: (() => {
				let isUnauthorized;
				if (params.type === sessionTypes.UNAUTHORIZED) {
					isUnauthorized = true;
				} else if (params.type === sessionTypes.AUTHORIZED) {
					isUnauthorized = false;
				}

				return isUnauthorized;
			})(),
		},
		options: refetchOptions,
	});

	// METHODS
	useEffect(() => {
		const data = sessions.map((session) => {
			const {
				id,
				branch_machine: branchMachine,
				user: sessionUser,
				datetime_started: datetimeStarted,
				datetime_ended: datetimeEnded,
				is_automatically_closed: isAutomaticallyClosed,
				is_unauthorized,
				is_unauthorized_datetime_ended,
			} = session;

			const datetime = renderDateTime({
				datetimeStarted,
				datetimeEnded,
				isAutomaticallyClosed,
			});

			let unauthorizedTimeRange: any = EMPTY_CELL;
			if (is_unauthorized_datetime_ended) {
				unauthorizedTimeRange = renderDateTime({
					datetimeStarted,
					datetimeEnded: is_unauthorized_datetime_ended,
					isAutomaticallyClosed,
				});
			} else if (is_unauthorized) {
				unauthorizedTimeRange = formatTimeRange(datetimeStarted, datetimeEnded);
			}

			return {
				key: id,
				branch: branchMachine.branch?.name,
				branchMachine: branchMachine.name,
				user: getFullName(sessionUser),
				datetime,
				unauthorizedTimeRange,
				status: is_unauthorized ? (
					<Tag color="red">Unauthorized</Tag>
				) : (
					<Tag color="green">Authorized</Tag>
				),
			};
		});

		setDataSource(data);
	}, [sessions]);

	const renderDateTime = ({
		datetimeStarted,
		datetimeEnded,
		isAutomaticallyClosed,
	}) => (
		<Descriptions column={1} size="small" bordered>
			<Descriptions.Item label="Start">
				{datetimeStarted
					? formatDateTimeShortMonth(datetimeStarted)
					: EMPTY_CELL}
			</Descriptions.Item>
			<Descriptions.Item label="End">
				{datetimeEnded ? (
					<>
						{formatDateTimeShortMonth(datetimeEnded)}{' '}
						{isAutomaticallyClosed && <Tag color="blue">Auto</Tag>}
					</>
				) : (
					EMPTY_CELL
				)}
			</Descriptions.Item>
		</Descriptions>
	);

	const getColumns = useCallback(() => {
		const columns: ColumnsType = [
			{ title: 'User', dataIndex: 'user' },
			{ title: 'Date & Time', dataIndex: 'datetime' },
			{ title: 'Unauthorized Time Range', dataIndex: 'unauthorizedTimeRange' },
			{ title: 'Status', dataIndex: 'status' },
		];

		if (!branchMachineId) {
			columns.unshift({ title: 'Branch Machine', dataIndex: 'branchMachine' });
		}

		if (!branchId && !branchMachineId) {
			columns.unshift({ title: 'Branch', dataIndex: 'branch' });
		}

		return columns;
	}, [branchId, branchMachineId]);

	return (
		<div className="ViewBranchMachineSessions">
			<TableHeader title="Sessions" wrapperClassName="pt-2 px-0" />

			<Filter
				branchId={branchId}
				branchMachineId={branchMachineId}
				isLoading={isFetchingSessions && !isSessionsFetchedAfterMount}
			/>

			<RequestErrors errors={convertIntoArray(sessionsError)} withSpaceBottom />

			<Table
				columns={getColumns()}
				dataSource={dataSource}
				loading={isFetchingSessions && !isSessionsFetchedAfterMount}
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
					pageSizeOptions,
				}}
				scroll={{ x: 800 }}
				bordered
			/>
		</div>
	);
};

type FilterProps = {
	branchId?: number;
	branchMachineId?: number;
	isLoading: boolean;
};

const Filter = ({ branchId, branchMachineId, isLoading }: FilterProps) => {
	const { params, setQueryParams } = useQueryParams();
	const paramBranchId = params.branchId ? Number(params.branchId) : undefined;
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchErrors,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: !branchId },
	});
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: {
			branchId: branchId || params.branchId,
			pageSize: MAX_PAGE_SIZE,
		},
	});
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: userErrors,
	} = useUsers({
		params: {
			branchId:
				getAppType() === appTypes.BACK_OFFICE
					? paramBranchId
					: Number(getLocalBranchId()),
			pageSize: MAX_PAGE_SIZE,
		},
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	return (
		<>
			<RequestErrors
				errors={[
					...convertIntoArray(userErrors, 'Users'),
					...convertIntoArray(branchMachinesError, 'Branch Machines'),
					...convertIntoArray(branchErrors, 'Branches'),
				]}
				withSpaceBottom
			/>

			<Row className="mb-4" gutter={[16, 16]}>
				{!branchId && !branchMachineId && (
					<Col md={12}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
							value={params.branchId ? Number(params.branchId) : null}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams({ branchId: value }, { shouldResetPage: true });
							}}
						>
							{branches.map((b) => (
								<Select.Option key={b.id} value={b.id}>
									{b.name}
								</Select.Option>
							))}
						</Select>
					</Col>
				)}

				{!branchMachineId && (
					<Col lg={12} span={24}>
						<Label label="Branch Machine" spacing />
						<Select
							className="w-100"
							defaultValue={params.branchMachineId}
							filterOption={filterOption}
							loading={isFetchingBranchMachines}
							optionFilterProp="children"
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams(
									{ branchMachineId: value },
									{ shouldResetPage: true },
								);
							}}
						>
							{branchMachines.map(({ id, name }) => (
								<Select.Option key={id} value={id}>
									{name}
								</Select.Option>
							))}
						</Select>
					</Col>
				)}

				<Col lg={12} span={24}>
					<Label label="User" spacing />
					<Select
						className="w-100"
						defaultValue={params.userId}
						disabled={isFetchingUsers || isLoading}
						filterOption={filterOption}
						optionFilterProp="children"
						allowClear
						showSearch
						onChange={(value) => {
							setQueryParams({ userId: value }, { shouldResetPage: true });
						}}
					>
						{usersData?.list.map((u) => (
							<Select.Option key={u.id} value={u.id}>
								{getFullName(u)}
							</Select.Option>
						))}
					</Select>
				</Col>

				<Col lg={12} span={24}>
					<TimeRangeFilter disabled={isFetchingUsers || isLoading} />
				</Col>

				<Col lg={12} span={24}>
					<Label label="Closing Type" spacing />
					<Radio.Group
						defaultValue={params.closingType || closingTypes.ALL}
						disabled={isFetchingUsers || isLoading}
						options={[
							{ label: 'All', value: closingTypes.ALL },
							{ label: 'Automatic', value: closingTypes.AUTOMATIC },
							{ label: 'Manual', value: closingTypes.MANUAL },
						]}
						optionType="button"
						onChange={(e) => {
							setQueryParams(
								{ closingType: e.target.value },
								{ shouldResetPage: true },
							);
						}}
					/>
				</Col>

				<Col lg={12} span={24}>
					<Label label="Authorization" spacing />
					<Radio.Group
						defaultValue={params.type || sessionTypes.ALL}
						disabled={isFetchingUsers || isLoading}
						options={[
							{ label: 'All', value: sessionTypes.ALL },
							{ label: 'Authorized', value: sessionTypes.AUTHORIZED },
							{ label: 'Unauthorized', value: sessionTypes.UNAUTHORIZED },
						]}
						optionType="button"
						onChange={(e) => {
							setQueryParams(
								{ type: e.target.value },
								{ shouldResetPage: true },
							);
						}}
					/>
				</Col>
			</Row>
		</>
	);
};
