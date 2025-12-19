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
	useBranchDays,
	useBranchMachines,
	useBranches,
	useQueryParams,
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

const branchDayTypes = {
	ALL: 'all',
	AUTHORIZED: 'authorized',
	UNAUTHORIZED: 'unauthorized',
};

type Props = {
	branchId?: number;
	branchMachineId?: number;
};

export const TabDays = ({ branchId, branchMachineId }: Props) => {
	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branchDays, total },
		error: branchDaysError,
		isFetching: isFetchingBranchDays,
		isFetchedAfterMount: isBranchDaysFetchedAfterMount,
	} = useBranchDays({
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
				if (params.type === branchDayTypes.UNAUTHORIZED) {
					isUnauthorized = true;
				} else if (params.type === branchDayTypes.AUTHORIZED) {
					isUnauthorized = false;
				}

				return isUnauthorized;
			})(),
		},
		options: refetchOptions,
	});

	// METHODS
	useEffect(() => {
		const data = branchDays.map((branchDay) => {
			const {
				id,
				started_by,
				ended_by,
				datetime_created: datetimeCreated,
				datetime_ended: datetimeEnded,
				is_automatically_closed: isAutomaticallyClosed,
				is_unauthorized,
				is_unauthorized_datetime_ended,
			} = branchDay;

			const datetime = renderDateTime({
				datetimeStarted: datetimeCreated,
				datetimeEnded,
				isAutomaticallyClosed,
			});

			let unauthorizedTimeRange: any = EMPTY_CELL;
			if (is_unauthorized_datetime_ended) {
				unauthorizedTimeRange = renderDateTime({
					datetimeStarted: datetimeCreated,
					datetimeEnded: is_unauthorized_datetime_ended,
					isAutomaticallyClosed,
				});
			} else if (is_unauthorized) {
				unauthorizedTimeRange = formatTimeRange(datetimeCreated, datetimeEnded);
			}

			return {
				key: id,
				branch: branchDay.branch_machine?.branch?.name,
				branchMachine: branchDay.branch_machine?.name,
				user: renderUser({
					startedBy: started_by,
					endedBy: ended_by,
					isAutomaticallyClosed,
				}),
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
	}, [branchDays]);

	const renderUser = ({ startedBy, endedBy, isAutomaticallyClosed }) => {
		const startedByUser = startedBy ? getFullName(startedBy) : EMPTY_CELL;

		let endedByUser: any = EMPTY_CELL;
		if (isAutomaticallyClosed) {
			endedByUser = <Tag color="blue">Auto</Tag>;
		} else if (endedBy) {
			endedByUser = getFullName(endedBy);
		}

		return (
			<Descriptions column={1} size="small" bordered>
				<Descriptions.Item label="Open">
					{startedBy ? startedByUser : EMPTY_CELL}
				</Descriptions.Item>
				<Descriptions.Item label="Close">{endedByUser}</Descriptions.Item>
			</Descriptions>
		);
	};

	const renderDateTime = ({
		datetimeStarted,
		datetimeEnded,
		isAutomaticallyClosed,
	}) => (
		<Descriptions column={1} size="small" bordered>
			<Descriptions.Item label="Open">
				{datetimeStarted
					? formatDateTimeShortMonth(datetimeStarted)
					: EMPTY_CELL}
			</Descriptions.Item>
			<Descriptions.Item label="Close">
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
		<div className="ViewBranchMachineDays">
			<TableHeader title="Days" wrapperClassName="pt-2 px-0" />

			<Filter
				branchId={branchId}
				branchMachineId={branchMachineId}
				isLoading={isFetchingBranchDays && !isBranchDaysFetchedAfterMount}
			/>

			<RequestErrors
				errors={convertIntoArray(branchDaysError)}
				withSpaceBottom
			/>

			<Table
				columns={getColumns()}
				dataSource={dataSource}
				loading={isFetchingBranchDays && !isBranchDaysFetchedAfterMount}
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
	// CUSTOM HOOKS
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
						defaultValue={params.type || branchDayTypes.ALL}
						disabled={isFetchingUsers || isLoading}
						options={[
							{ label: 'All', value: branchDayTypes.ALL },
							{ label: 'Authorized', value: branchDayTypes.AUTHORIZED },
							{ label: 'Unauthorized', value: branchDayTypes.UNAUTHORIZED },
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
