/* eslint-disable react-hooks/exhaustive-deps */
import { lowerCase } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AddButtonIcon, Container, Table, TableHeader } from '../../../components';
import { Box, ButtonLink } from '../../../components/elements';
import { selectors as authSelectors } from '../../../ducks/auth';
import { types } from '../../../ducks/BranchPersonnel/preparation-slips';
import { preparationSlipStatusOptions } from '../../../global/options';
import { preparationSlipStatus, request } from '../../../global/types';
import {
	calculateTableHeight,
	formatDateTime,
	getPreparationSlipStatus,
} from '../../../utils/function';
import { usePreparationSlips } from '../hooks/usePreparationSlips';
import { ViewPreparationSlipModal } from './components/ViewPreparationSlipModal';
import './style.scss';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time Created', dataIndex: 'datetime_created' },
	{ title: 'Status', dataIndex: 'status' },
	{ title: 'Actions', dataIndex: 'action' },
];

const PreparationSlips = () => {
	let history = useHistory();
	const user = useSelector(authSelectors.selectUser());
	const { preparationSlips, getPreparationSlips, status, recentRequest } = usePreparationSlips();

	const [data, setData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [viewPreparationSlipModalVisible, setViewPreparationSlipModalVisible] = useState(false);
	const [selectedPreparationSlip, setSelectedPreparationSlip] = useState(null);

	useEffect(() => {
		getPreparationSlips(user?.id);
	}, []);

	// Effect: Format preparation slips to be rendered in Table
	useEffect(() => {
		const formattedPreparationSlips = preparationSlips.map((preparationSlip) => {
			const { id, datetime_created, status } = preparationSlip;
			const dateTime = formatDateTime(datetime_created);

			const action =
				status === preparationSlipStatus.NEW ? (
					<AddButtonIcon
						onClick={() => history.push(`/preparation-slips/${preparationSlip.id}`)}
						tooltip="Fulfill"
					/>
				) : null;

			return {
				_id: id,
				_datetime_created: dateTime,
				_status: status,
				id: <ButtonLink text={id} onClick={() => onView(preparationSlip)} />,
				datetime_created: dateTime,
				status: getPreparationSlipStatus(status),
				action,
			};
		});

		setData(formattedPreparationSlips);
		setTableData(formattedPreparationSlips);
	}, [preparationSlips]);

	const getFetchLoading = useCallback(
		() => status === request.REQUESTING && recentRequest === types.GET_PREPARATION_SLIPS,
		[status, recentRequest],
	);

	const onView = (preparationSlip) => {
		setSelectedPreparationSlip(preparationSlip);
		setViewPreparationSlipModalVisible(true);
	};

	const onSearch = (keyword) => {
		keyword = lowerCase(keyword);
		const filteredData =
			keyword.length > 0
				? data.filter(
						({ _id, _datetime_created }) =>
							_id.toString() === keyword || _datetime_created.includes(keyword),
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
			title="Preparation Slips"
			loading={getFetchLoading()}
			loadingText="Fetching preparation slips..."
		>
			<section>
				<Box>
					<TableHeader
						statuses={preparationSlipStatusOptions}
						onStatusSelect={onStatusSelect}
						onSearch={onSearch}
					/>

					<Table
						columns={columns}
						dataSource={tableData}
						scroll={{ y: calculateTableHeight(tableData.length), x: '100%' }}
					/>

					<ViewPreparationSlipModal
						preparationSlip={selectedPreparationSlip}
						visible={viewPreparationSlipModalVisible}
						onClose={() => setViewPreparationSlipModalVisible(false)}
					/>
				</Box>
			</section>
		</Container>
	);
};

export default PreparationSlips;
