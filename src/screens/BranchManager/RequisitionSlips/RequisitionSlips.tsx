/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase, upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Table, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { selectors as authSelectors } from '../../../ducks/auth';
import { EMPTY_CELL } from '../../../global/constants';
import { requisitionSlipActionsOptionsWithAll } from '../../../global/options';
import { request, requisitionSlipActions, userTypes } from '../../../global/types';
import { useBranchProducts } from '../../../hooks/useBranchProducts';
import { useRequisitionSlips } from '../../../hooks/useRequisitionSlips';
import {
	calculateTableHeight,
	formatDateTime,
	getRequisitionSlipStatus,
} from '../../../utils/function';
import { CreateRequisitionSlipModal } from './components/CreateRequisitionSlipModal';
import './style.scss';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date Requested', dataIndex: 'datetime_created' },
	{ title: 'Requestor', dataIndex: 'requestor' },
	{ title: 'Request Type', dataIndex: 'type' },
	{ title: 'Actions', dataIndex: 'action' },
	{ title: 'Progress', dataIndex: 'progress' },
];

const pendingRequisitionSlipActions = [
	requisitionSlipActions.F_DS1_CREATING,
	requisitionSlipActions.F_DS1_CREATED,
	requisitionSlipActions.F_DS1_DELIVERING,
];

const RequisitionSlips = () => {
	const user = useSelector(authSelectors.selectUser());

	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [createModalVisible, setCreateModalVisible] = useState(false);

	const { requisitionSlips, getRequisitionSlipsExtended, status } = useRequisitionSlips();

	const {
		branchProducts,
		getBranchProductsByBranch,
		status: branchProductsStatus,
	} = useBranchProducts();

	useEffect(() => {
		getRequisitionSlipsExtended(user?.branch?.id);
		getBranchProductsByBranch({ branchId: user?.branch?.id, page: 1 });
	}, []);

	// Effect: Format requisitionSlips to be rendered in Table
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const { id, type, requesting_user, progress, action: prAction } = requisitionSlip;
			const { datetime_created, action } = prAction;
			const dateTime = formatDateTime(datetime_created);

			const isOwnRequisitionSlip = user?.branch?.id === requesting_user.branch.id;
			const _action = isOwnRequisitionSlip
				? getRequisitionSlipStatus(action, userTypes.BRANCH_MANAGER)
				: EMPTY_CELL;
			let _progress = progress ? `${progress.current} / ${progress.total}` : EMPTY_CELL;
			_progress = isOwnRequisitionSlip ? _progress : EMPTY_CELL;

			return {
				_id: id,
				_datetime_created: dateTime,
				_type: type,
				_status: action,
				id: <Link to={`/requisition-slips/${id}`}>{id}</Link>,
				datetime_created: dateTime,
				requestor: requesting_user.branch.name,
				type: upperFirst(type),
				action: _action,
				progress: _progress,
			};
		});

		setData(formattedProducts);
		setTableData(formattedProducts);
	}, [requisitionSlips]);

	const getPendingCount = useCallback(
		() =>
			requisitionSlips.filter(
				({ action, requesting_user }) =>
					pendingRequisitionSlipActions.includes(action?.action) &&
					user?.branch?.id === requesting_user.branch.id,
			).length,
		[requisitionSlips],
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

	const onStatusSelect = (selectedStatus) => {
		const filteredData =
			selectedStatus !== 'all' ? data.filter(({ _status }) => _status === selectedStatus) : data;
		setTableData(filteredData);
	};

	return (
		<Container title="Requisition Slips">
			<section className="RequisitionSlips">
				<Box>
					<TableHeader
						buttonName="Create Requisition Slip"
						statuses={requisitionSlipActionsOptionsWithAll}
						onStatusSelect={onStatusSelect}
						onSearch={onSearch}
						onCreate={() => setCreateModalVisible(true)}
						pending={getPendingCount()}
					/>

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
						loading={status === request.REQUESTING || branchProductsStatus === request.REQUESTING}
					/>

					<CreateRequisitionSlipModal
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

export default RequisitionSlips;
