/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase, upperFirst } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Table, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { selectors as authSelectors } from '../../../ducks/auth';
import { EMPTY_CELL } from '../../../global/constants';
import { purchaseRequestActionsOptionsWithAll } from '../../../global/options';
import { request } from '../../../global/types';
import { useBranchProducts } from '../../../hooks/useBranchProducts';
import { usePurchaseRequests } from '../../../hooks/usePurchaseRequests';
import {
	calculateTableHeight,
	formatDateTime,
	getPurchaseRequestStatus,
} from '../../../utils/function';
import { CreatePurchaseRequestModal } from './components/CreatePurchaseRequestModal';
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
	const user = useSelector(authSelectors.selectUser());

	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [createModalVisible, setCreateModalVisible] = useState(false);

	const { purchaseRequests, getPurchaseRequestsExtended, status } = usePurchaseRequests();

	const {
		branchProducts,
		getBranchProductsByBranch,
		status: branchProductsStatus,
	} = useBranchProducts();

	useEffect(() => {
		getPurchaseRequestsExtended(user?.branch?.id);
		getBranchProductsByBranch(user?.branch?.id);
	}, []);

	// Effect: Format purchaseRequests to be rendered in Table
	useEffect(() => {
		const formattedProducts = purchaseRequests.map((purchaseRequest) => {
			const { id, type, requesting_user, progress, action: prAction } = purchaseRequest;
			const { datetime_created, action } = prAction;
			const dateTime = formatDateTime(datetime_created);

			const isOwnPurchaseRequest = user?.branch?.id === requesting_user.branch.id;
			const _action = isOwnPurchaseRequest ? getPurchaseRequestStatus(action) : EMPTY_CELL;
			let _progress = progress ? `${progress.current} / ${progress.total}` : EMPTY_CELL;
			_progress = isOwnPurchaseRequest ? _progress : EMPTY_CELL;

			return {
				_id: id,
				_datetime_created: dateTime,
				_type: type,
				_status: action,
				id: <Link to={`/purchase-requests/${id}`}>{id}</Link>,
				datetime_created: dateTime,
				requestor: requesting_user.branch.name,
				type: upperFirst(type),
				action: _action,
				progress: _progress,
			};
		});

		setData(formattedProducts);
		setTableData(formattedProducts);
	}, [purchaseRequests]);

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

	const onStatusSelect = (selectedStatus) => {
		const filteredData =
			selectedStatus !== 'all' ? data.filter(({ _status }) => _status === selectedStatus) : data;
		setTableData(filteredData);
	};

	return (
		<Container title="Purchase Requests">
			<section className="PurchaseRequests">
				<Box>
					<TableHeader
						buttonName="Create Purchase Request"
						statuses={purchaseRequestActionsOptionsWithAll}
						onStatusSelect={onStatusSelect}
						onSearch={onSearch}
						onCreate={() => setCreateModalVisible(true)}
					/>

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
						loading={status === request.REQUESTING || branchProductsStatus === request.REQUESTING}
					/>

					<CreatePurchaseRequestModal
						branchProducts={branchProducts}
						visible={createModalVisible}
						onClose={() => setCreateModalVisible(false)}
						loading={branchProductsStatus === request.REQUESTING}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default PurchaseRequests;
