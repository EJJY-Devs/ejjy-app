/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase, upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { types } from '../../../ducks/purchase-requests';
import { EMPTY_PR_PROGRESS } from '../../../global/constants';
import { purchaseRequestActionsOptionsWithAll } from '../../../global/options';
import { request } from '../../../global/types';
import { usePurchaseRequests } from '../../../hooks/usePurchaseRequests';
import {
	calculateTableHeight,
	formatDateTime,
	getPurchaseRequestStatus,
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

const PurchaseRequests = () => {
	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);

	const {
		purchaseRequests,
		getPurchaseRequestsExtended,
		status,
		recentRequest,
	} = usePurchaseRequests();
	console.log(purchaseRequests);
	useEffect(() => {
		getPurchaseRequestsExtended();
	}, []);

	// Effect: Format purchaseRequests to be rendered in Table
	useEffect(() => {
		const formattedProducts = purchaseRequests.map((purchaseRequest) => {
			const { id, type, requesting_user, progress, action: prAction } = purchaseRequest;
			const { datetime_created, action } = prAction;

			const dateTime = formatDateTime(datetime_created);

			return {
				_id: id,
				_datetime_created: dateTime,
				_type: type,
				_status: action,
				id: <Link to={`/purchase-requests/${id}`}>{id}</Link>,
				datetime_created: dateTime,
				requestor: requesting_user.branch.name,
				type: upperFirst(type),
				action: getPurchaseRequestStatus(action),
				progress: progress ? `${progress.current} / ${progress.total}` : EMPTY_PR_PROGRESS,
			};
		});

		setData(formattedProducts);
		setTableData(formattedProducts);
	}, [purchaseRequests]);

	const getFetchLoading = useCallback(
		() => status === request.REQUESTING && recentRequest === types.GET_PURCHASE_REQUESTS_EXTENDED,
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
			loadingText="Fetching purchase requests..."
		>
			<section className="PurchaseRequests">
				<Box>
					<TableHeader
						buttonName="Create Purchase Request"
						statuses={purchaseRequestActionsOptionsWithAll}
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

export default PurchaseRequests;
