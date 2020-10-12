/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase, upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { types } from '../../../ducks/requisition-slips';
import { EMPTY_CELL } from '../../../global/constants';
import { requisitionSlipActionsOptionsWithAll } from '../../../global/options';
import { request } from '../../../global/types';
import { useRequisitionSlips } from '../../../hooks/useRequisitionSlips';
import {
	calculateTableHeight,
	formatDateTime,
	getRequisitionSlipStatus,
} from '../../../utils/function';
import './style.scss';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date Requested', dataIndex: 'datetime_created' },
	{ title: 'Requestor', dataIndex: 'requestor' },
	{ title: 'Request Type', dataIndex: 'type' },
	{ title: 'Actions', dataIndex: 'action' },
	{ title: 'Progress', dataIndex: 'progress' },
];

const RequisitionSlips = () => {
	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);

	const {
		requisitionSlips,
		getRequisitionSlipsExtended,
		status,
		recentRequest,
	} = useRequisitionSlips();

	useEffect(() => {
		getRequisitionSlipsExtended();
	}, []);

	// Effect: Format requisitionSlips to be rendered in Table
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const { id, type, requesting_user, progress, action: prAction } = requisitionSlip;
			const { datetime_created, action } = prAction;

			const dateTime = formatDateTime(datetime_created);

			return {
				_id: id,
				_datetime_created: dateTime,
				_type: type,
				_status: action,
				id: <Link to={`/requisition-slips/${id}`}>{id}</Link>,
				datetime_created: dateTime,
				requestor: requesting_user.branch.name,
				type: upperFirst(type),
				action: getRequisitionSlipStatus(action),
				progress: progress ? `${progress.current} / ${progress.total}` : EMPTY_CELL,
			};
		});

		setData(formattedProducts);
		setTableData(formattedProducts);
	}, [requisitionSlips]);

	const getFetchLoading = useCallback(
		() => status === request.REQUESTING && recentRequest === types.GET_REQUISITION_SLIPS_EXTENDED,
		[status, recentRequest],
	);

	const onSearch = (keyword) => {
		keyword = lowerCase(keyword);
		const filteredData =
			keyword.length > 0
				? data.filter(
						({ _id, _datetime_created, _type }) =>
							_id.toString() === keyword ||
							_datetime_created.includes(keyword) ||
							_type.includes(keyword),
				  )
				: data;

		setTableData(filteredData);
	};

	const onStatusSelect = (status) => {
		const filteredData = status !== 'all' ? data.filter(({ _status }) => _status === status) : data;
		setTableData(filteredData);
	};

	return (
		<Container
			title="F-RS1"
			description="Requests from branches"
			loading={getFetchLoading()}
			loadingText="Fetching requisition slips..."
		>
			<section className="RequisitionSlips">
				<Box>
					<TableHeader
						buttonName="Create Requisition Slip"
						statuses={requisitionSlipActionsOptionsWithAll}
						onStatusSelect={onStatusSelect}
						onSearch={onSearch}
					/>

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
						loading={status === request.REQUESTING}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default RequisitionSlips;
