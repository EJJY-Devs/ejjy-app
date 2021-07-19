/* eslint-disable no-underscore-dangle */
import { Table } from 'antd';
import { upperFirst } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Content, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { EMPTY_CELL } from '../../../global/constants';
import {
	pageSizeOptions,
	requisitionSlipActionsOptionsWithAll,
} from '../../../global/options';
import {
	request,
	requisitionSlipActions,
	userTypes,
} from '../../../global/types';
import { useAuth } from '../../../hooks/useAuth';
import { useBranchProducts } from '../../../hooks/useBranchProducts';
import { useRequisitionSlips } from '../../../hooks/useRequisitionSlips';
import {
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

export const RequisitionSlips = () => {
	// STATES
	const [data, setData] = useState([]);
	const [selectedStatus, setSelectedStatus] = useState('all');
	const [createModalVisible, setCreateModalVisible] = useState(false);

	// CUSTOM HOOKS
	const { user } = useAuth();
	const {
		requisitionSlips,
		pageCount,
		currentPage,
		pageSize,
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
		onFetchRequisitionSlips(1, pageSize, true);
		getBranchProducts({ branchId: user?.branch?.id, page: 1 });
	}, []);

	useEffect(() => {
		onFetchRequisitionSlips(1, pageSize, true);
	}, [selectedStatus]);

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
				id: <Link to={`/branch-manager/requisition-slips/${id}`}>{id}</Link>,
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

	const onFetchRequisitionSlips = (page, newPageSize, shouldReset) => {
		getRequisitionSlipsExtended(
			{
				branchId: user?.branch?.id,
				status: selectedStatus === 'all' ? null : selectedStatus,
				page,
				pageSize: newPageSize,
			},
			shouldReset,
		);
	};

	const onCreateRequisitionSlipSuccess = () => {
		onFetchRequisitionSlips(1, pageSize, true);
		getBranchProducts({ branchId: user?.branch?.id, page: 1 });
	};

	const onPageChange = (page, newPageSize) => {
		onFetchRequisitionSlips(page, newPageSize, newPageSize !== pageSize);
	};

	return (
		<Content className="RequisitionSlips" title="Requisition Slips">
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
					scroll={{ x: 1000 }}
					pagination={{
						current: currentPage,
						total: pageCount,
						pageSize,
						onChange: onPageChange,
						disabled: !data,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					loading={[requisitionSlipsStatus, branchProductsStatus].includes(
						request.REQUESTING,
					)}
				/>

				<CreateRequisitionSlipModal
					branchProducts={branchProducts}
					visible={createModalVisible}
					onSuccess={onCreateRequisitionSlipSuccess}
					onClose={() => setCreateModalVisible(false)}
					loading={branchProductsStatus === request.REQUESTING}
				/>
			</Box>
		</Content>
	);
};
