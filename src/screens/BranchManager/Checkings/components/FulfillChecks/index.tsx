import { Tag } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import {
	AddButtonIcon,
	FulfillCheckModal,
	RequestErrors,
	TableHeader,
} from 'components';
import { Box } from 'components/elements';
import dayjs from 'dayjs';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	pageSizeOptions,
	productCheckingTypes,
} from 'global';
import { useProductChecks, useQueryParams } from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, formatDateTime } from 'utils';

const columns: ColumnsType = [
	{ title: 'Date & Time Requested', dataIndex: 'datetimeRequested' },
	{ title: 'Type', dataIndex: 'type' },
	{ title: 'Actions', dataIndex: 'action' },
];

export const FulfillChecking = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [selectedProductCheck, setSelectedProductCheck] = useState(null);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { productChecks: dailyProductChecks },
		isFetching: isFetchingDailyProductChecks,
		error: dailyProductChecksErrors,
	} = useProductChecks({
		params: {
			isFilledUp: false,
			type: productCheckingTypes.DAILY,
			onlyOfToday: true,
		},
	});
	const {
		data: { productChecks: randomProductChecks, total },
		isFetching: isFetchingRandomProductChecks,
		error: randomProductChecksErrors,
	} = useProductChecks({
		params: {
			type: productCheckingTypes.RANDOM,
			isFilledUp: false,
		},
	});

	// METHODS
	useEffect(() => {
		const productChecks = [...dailyProductChecks, ...randomProductChecks];

		// TODO: Refactor action into the new version
		const data = productChecks
			.filter((productCheck) => dayjs(productCheck.datetime_created).isToday())
			.map((productCheck) => ({
				datetimeRequested: formatDateTime(productCheck?.datetime_created),
				type:
					productCheck.type === productCheckingTypes.DAILY ? (
						<Tag color="purple">Daily Check</Tag>
					) : (
						<Tag color="blue">Random Check</Tag>
					),
				action: (
					<AddButtonIcon
						tooltip="Fulfill"
						onClick={() => setSelectedProductCheck(productCheck)}
					/>
				),
			}));

		setDataSource(data);
	}, [dailyProductChecks, randomProductChecks]);

	return (
		<>
			<Box>
				<TableHeader title="Unfulfilled Checks" />

				<RequestErrors
					errors={[
						...convertIntoArray(
							dailyProductChecksErrors,
							'Daily Product Checks',
						),
						...convertIntoArray(
							randomProductChecksErrors,
							'Random Product Checks',
						),
					]}
					withSpaceBottom
				/>

				<Table
					columns={columns}
					dataSource={dataSource}
					loading={
						isFetchingRandomProductChecks || isFetchingDailyProductChecks
					}
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
					scroll={{ x: 650 }}
					bordered
				/>
			</Box>

			{selectedProductCheck && (
				<FulfillCheckModal
					productCheck={selectedProductCheck}
					onClose={() => setSelectedProductCheck(null)}
				/>
			)}
		</>
	);
};
