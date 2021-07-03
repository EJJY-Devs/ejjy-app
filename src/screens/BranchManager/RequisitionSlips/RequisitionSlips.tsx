/* eslint-disable no-underscore-dangle */
import { Pagination } from 'antd';
import { upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Table, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { selectors as authSelectors } from '../../../ducks/auth';
import { EMPTY_CELL } from '../../../global/constants';
import { requisitionSlipActionsOptionsWithAll } from '../../../global/options';
import {
	request,
	requisitionSlipActions,
	userTypes,
} from '../../../global/types';
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

const PAGE_SIZE = 10;

const RequisitionSlips = () => {
	// STATES
	const [data, setData] = useState([]);
	const [selectedStatus, setSelectedStatus] = useState('all');
	const [createModalVisible, setCreateModalVisible] = useState(false);

	// CUSTOM HOOKS
	const user = useSelector(authSelectors.selectUser());
	const {
		requisitionSlips,
		pageCount,
		currentPage,
		getRequisitionSlipsExtended,
		status: requisitionSlipsStatus,
	} = useRequisitionSlips();
	const {
		branchProducts,
		getBranchProducts,
		status: branchProductsStatus,
	} = useBranchProducts();

	// METHODS
	useEffect(() => {
		getRequisitionSlipsExtended(
			{
				branchId: user?.branch?.id,
				status: selectedStatus === 'all' ? null : selectedStatus,
				page: 1,
			},
			true,
		);
		getBranchProducts({ branchId: user?.branch?.id, page: 1 });
	}, []);

	// Effect: Format requisitionSlips to be rendered in Table
	useEffect(() => {
		const formattedProducts = requisitionSlips.map((requisitionSlip) => {
			const {
				id,
				type,
				requesting_user,
				progress,
				action: prAction,
			} = requisitionSlip;
			const { datetime_created, action } = prAction;
			const dateTime = formatDateTime(datetime_created);

			const isOwnRequisitionSlip =
				user?.branch?.id === requesting_user?.branch?.id;
			const _action = isOwnRequisitionSlip
				? getRequisitionSlipStatus(action, userTypes.BRANCH_MANAGER)
				: EMPTY_CELL;
			let _progress = progress
				? `${progress.current} / ${progress.total}`
				: EMPTY_CELL;
			_progress = isOwnRequisitionSlip ? _progress : EMPTY_CELL;

			return {
				_id: id,
				_datetime_created: dateTime,
				_type: type,
				_status: action,
				id: <Link to={`/requisition-slips/${id}`}>{id}</Link>,
				datetime_created: dateTime,
				requestor: requesting_user?.branch?.name,
				type: upperFirst(type),
				action: _action,
				progress: _progress,
			};
		});

		setData(formattedProducts);
	}, [requisitionSlips]);

	const getPendingCount = useCallback(
		() =>
			requisitionSlips.filter(
				({ action, requesting_user }) =>
					pendingRequisitionSlipActions.includes(action?.action) &&
					user?.branch?.id === requesting_user?.branch?.id,
			).length,
		[requisitionSlips],
	);

	const onCreateRequisitionSlipSuccess = () => {
		getRequisitionSlipsExtended(
			{
				branchId: user?.branch?.id,
				status: selectedStatus === 'all' ? null : selectedStatus,
				page: 1,
			},
			true,
		);
		getBranchProducts({ branchId: user?.branch?.id, page: 1 });
	};

	const onPageChange = (page) => {
		getRequisitionSlipsExtended(
			{
				branchId: user?.branch?.id,
				status: selectedStatus === 'all' ? null : selectedStatus,
				page,
			},
			true,
		);
	};

	return (
		<Container title="Requisition Slips">
			<section className="RequisitionSlips">
				<Box>
					<TableHeader
						buttonName="Create Requisition Slip"
						statuses={requisitionSlipActionsOptionsWithAll}
						onStatusSelect={(status) => setSelectedStatus(status)}
						onCreate={() => setCreateModalVisible(true)}
						pending={getPendingCount()}
					/>

					<Table
						columns={columns}
						dataSource={data}
						scroll={{ y: calculateTableHeight(data.length), x: '100%' }}
						loading={[requisitionSlipsStatus, branchProductsStatus].includes(
							request.REQUESTING,
						)}
					/>

					<Pagination
						className="table-pagination"
						current={currentPage}
						total={pageCount}
						pageSize={PAGE_SIZE}
						onChange={onPageChange}
						disabled={!data}
					/>

					<CreateRequisitionSlipModal
						branchProducts={branchProducts}
						visible={createModalVisible}
						onSuccess={onCreateRequisitionSlipSuccess}
						onClose={() => setCreateModalVisible(false)}
						loading={branchProductsStatus === request.REQUESTING}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default RequisitionSlips;
