/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AddButtonIcon, Container, Table, TableHeader } from '../../../components';
import { Box } from '../../../components/elements';
import { selectors as authSelectors } from '../../../ducks/auth';
import { request } from '../../../global/types';
import { calculateTableHeight, formatDateTime } from '../../../utils/function';
import { useProductChecks } from '../hooks/useProductChecks';
import { DailyCheckCard } from './components/DailyCheckCard';
import { FulfillCheckModal } from './components/FulfillCheckModal';
import './style.scss';

const columns = [
	{ title: 'Date & Time Requested', dataIndex: 'datetime_requested' },
	{ title: 'Action', dataIndex: 'action' },
];

const Checking = () => {
	const user = useSelector(authSelectors.selectUser());
	const { dailyCheck, randomChecks, getDailyCheck, getRandomChecks, status } = useProductChecks();

	const [randomChecksDataSource, setRandomChecksDataSource] = useState([]);
	const [selectedProductCheck, setSelectedProductCheck] = useState(null);
	const [fulfillModalVisible, setFulfillModalVisible] = useState(false);

	useEffect(() => {
		fetchDailyCheck();
		fetchRandomChecks();
	}, []);

	// Effect: Format random checks
	useEffect(() => {
		if (randomChecks) {
			const formattedRandomChecks = randomChecks?.map((randomCheck) => ({
				datetime_requested: formatDateTime(randomCheck?.datetime_created),
				action: (
					<AddButtonIcon
						tooltip="Fulfill random check"
						onClick={() => onRandomCheck(randomCheck)}
					/>
				),
			}));

			setRandomChecksDataSource(formattedRandomChecks);
		}
	}, [randomChecks]);

	const fetchDailyCheck = () => {
		getDailyCheck(user?.branch?.id);
	};

	const fetchRandomChecks = () => {
		getRandomChecks(user?.branch?.id);
	};

	const onRandomCheck = (randomCheck) => {
		setFulfillModalVisible(true);
		setSelectedProductCheck(randomCheck);
	};

	const onDailyCheck = () => {
		setFulfillModalVisible(true);
		setSelectedProductCheck(dailyCheck);
	};

	return (
		<Container title="Checking" loading={status === request.REQUESTING}>
			<section className="Checking">
				{dailyCheck && (
					<DailyCheckCard
						onDailyCheck={onDailyCheck}
						dateTimeRequested={dailyCheck?.datetime_created}
					/>
				)}

				<Box>
					<TableHeader title="Random Checks" />
					<Table
						columns={columns}
						dataSource={randomChecksDataSource}
						scroll={{ y: calculateTableHeight(randomChecksDataSource.length), x: '100%' }}
					/>
				</Box>

				<FulfillCheckModal
					productCheck={selectedProductCheck}
					visible={fulfillModalVisible}
					onClose={() => setFulfillModalVisible(false)}
				/>
			</section>
		</Container>
	);
};

export default Checking;
