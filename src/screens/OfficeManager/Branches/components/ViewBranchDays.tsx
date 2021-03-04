/* eslint-disable react-hooks/exhaustive-deps */
import { Pagination } from 'antd';
import React, { useEffect, useState } from 'react';
import { TableHeader, TableNormal } from '../../../../components';
import { FieldError, FieldWarning } from '../../../../components/elements';
import { EMPTY_CELL } from '../../../../global/constants';
import { formatDateTimeShortMonth } from '../../../../utils/function';
import { useBranchesDays } from '../../../../hooks/useBranchesDays';
import { request } from '../../../../global/types';

interface Props {
	branchId: any;
}

const PAGE_SIZE = 5;

const columns = [{ name: 'User' }, { name: 'Date & Time' }];

export const ViewBranchDays = ({ branchId }: Props) => {
	// STATES
	const [tableData, setTableData] = useState([]);

	// CUSTOM HOOKS
	const {
		branchDays,
		pageCount,
		currentPage,

		listBranchDays,
		status,
		errors,
		warnings,
	} = useBranchesDays({
		pageSize: PAGE_SIZE,
	});

	// METHODS
	useEffect(() => {
		listBranchDays({ branchId, page: 1 });
	}, []);

	// Effect: Format branch days to be rendered in Table
	useEffect(() => {
		const formattedBranchDays = branchDays.map((branchDay) => {
			const { started_by, ended_by, datetime_created, datetime_ended } = branchDay;

			return [
				{ isHidden: true }, // TODO: For searching functionality (payload)
				getUser(started_by, ended_by),
				getDateTime(datetime_created, datetime_ended),
			];
		});

		setTableData(formattedBranchDays);
	}, [branchDays]);

	const getUser = (startedBy, endedBy) => {
		const startedByUser = `${startedBy.first_name} ${startedBy.last_name}`;
		const endedByUser = `${endedBy?.first_name} ${endedBy?.last_name}`;

		return (
			<div className="branch-day-column">
				<div className="first-row">
					<span className="label">Start: </span>
					<span className="value">{startedBy ? startedByUser : EMPTY_CELL}</span>
				</div>
				<div>
					<span className="label">End: </span>
					<span className="value">{endedBy ? endedByUser : EMPTY_CELL}</span>
				</div>
			</div>
		);
	};

	const getDateTime = (datetime_created, datetime_ended) => {
		return (
			<div className="branch-day-column">
				<div className="first-row">
					<span className="label">Start: </span>
					<span className="value">
						{datetime_created ? formatDateTimeShortMonth(datetime_created) : EMPTY_CELL}
					</span>
				</div>
				<div>
					<span className="label">End: </span>
					<span className="value">
						{datetime_ended ? formatDateTimeShortMonth(datetime_ended) : EMPTY_CELL}
					</span>
				</div>
			</div>
		);
	};

	const onPageChange = (page) => {
		listBranchDays({ branchId, page });
	};

	return (
		<div className="ViewBranchDays">
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}
			{warnings.map((warning, index) => (
				<FieldWarning key={index} error={warning} />
			))}

			<TableHeader title="Days" />

			<TableNormal columns={columns} data={tableData} loading={status === request.REQUESTING} />

			<Pagination
				className="table-pagination"
				current={currentPage}
				total={pageCount}
				pageSize={PAGE_SIZE}
				onChange={onPageChange}
				disabled={!tableData}
			/>
		</div>
	);
};
