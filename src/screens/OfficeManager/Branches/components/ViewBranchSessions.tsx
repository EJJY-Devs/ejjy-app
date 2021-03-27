/* eslint-disable react-hooks/exhaustive-deps */
import { Pagination } from 'antd';
import React, { useEffect, useState } from 'react';
import { TableHeader, TableNormal } from '../../../../components';
import { FieldError, FieldWarning } from '../../../../components/elements';
import { EMPTY_CELL } from '../../../../global/constants';
import { request } from '../../../../global/types';
import { useSessions } from '../../../../hooks/useSessions';
import { formatDateTimeShortMonth } from '../../../../utils/function';

interface Props {
	branchId: any;
}

const PAGE_SIZE = 10;

const columns = [{ name: 'User' }, { name: 'Machine' }, { name: 'Date & Time' }];

export const ViewBranchSessions = ({ branchId }: Props) => {
	// STATES
	const [tableData, setTableData] = useState([]);

	// CUSTOM HOOKS
	const {
		sessions,
		pageCount,
		currentPage,

		listSessions,
		status,
		errors,
		warnings,
	} = useSessions({
		pageSize: PAGE_SIZE,
	});

	// METHODS
	useEffect(() => {
		listSessions({ branchId, page: 1 });
	}, []);

	// Effect: Format branch sessions to be rendered in Table
	useEffect(() => {
		const formattedBranchSession = sessions.map((session) => {
			const { user, branch_machine, datetime_started, datetime_ended } = session;

			return [
				{ isHidden: true }, // TODO: For searching functionality (payload)
				`${user.first_name} ${user.last_name}`,
				branch_machine.name,
				getDateTime(datetime_started, datetime_ended),
			];
		});

		setTableData(formattedBranchSession);
	}, [sessions]);

	const getDateTime = (datetime_started, datetime_ended) => {
		return (
			<div className="branch-session-column">
				<div className="first-row">
					<span className="label">Start: </span>
					<span className="value">
						{datetime_started ? formatDateTimeShortMonth(datetime_started) : EMPTY_CELL}
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
		listSessions({ branchId, page });
	};

	return (
		<div className="ViewBranchSessions">
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}
			{warnings.map((warning, index) => (
				<FieldWarning key={index} error={warning} />
			))}

			<TableHeader title="Sessions" />

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
