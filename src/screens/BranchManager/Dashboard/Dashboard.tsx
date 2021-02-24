/* eslint-disable react-hooks/exhaustive-deps */
import { message } from 'antd';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container } from '../../../components';
import { CashieringCard } from '../../../components/CashieringCard/CashieringCard';
import { selectors as authSelectors } from '../../../ducks/auth';
import { request } from '../../../global/types';
import { useBranchesDays } from '../../../hooks/useBranchesDays';
import { BackupServerUrlForm } from './components/BackupServerUrlForm';
import { MachineReportTable } from './components/MachineReportTable';
import './style.scss';

const Dashboard = () => {
	// CUSTOM HOOKS
	const {
		branchDay,
		getBranchDay,
		createBranchDay,
		editBranchDay,
		status: branchesDaysStatus,
		errors: branchesDaysErrors,
	} = useBranchesDays();
	const user = useSelector(authSelectors.selectUser());

	// EFFECTS
	useEffect(() => {
		getBranchDay(user?.branch?.id);
	}, []);

	// Effect: Display errors from branch cashiering
	useEffect(() => {
		if (branchesDaysErrors?.length && branchesDaysStatus === request.ERROR) {
			message.error(branchesDaysErrors);
		}
	}, [branchesDaysErrors, branchesDaysStatus]);

	const onStartDay = () => {
		createBranchDay(user?.branch?.id, user.id);
	};

	const onEndDay = () => {
		editBranchDay(branchDay.id, user.id);
	};

	return (
		<Container title="Dashboard">
			<section className="Dashboard">
				<BackupServerUrlForm />

				<CashieringCard
					branchDay={branchDay}
					onClick={branchDay ? onEndDay : onStartDay}
					loading={branchesDaysStatus === request.REQUESTING}
				/>

				<MachineReportTable />
			</section>
		</Container>
	);
};

export default Dashboard;
