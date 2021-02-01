/* eslint-disable react-hooks/exhaustive-deps */
import { message, Tabs } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Breadcrumb, Container } from '../../../components';
import { Box } from '../../../components/elements';
import { selectors as branchesSelectors } from '../../../ducks/OfficeManager/branches';
import { request } from '../../../global/types';
import { useBranchesDays } from '../../../hooks/useBranchesDays';
import { useBranchProducts } from '../../../hooks/useBranchProducts';
import { useSessions } from '../../../hooks/useSessions';
import { useTransactions } from '../../../hooks/useTransactions';
import { useBranchMachines } from '../hooks/useBranchMachines';
import { ViewBranchDays } from './components/ViewBranchDays';
import { ViewBranchMachines } from './components/ViewBranchMachines';
import { ViewBranchProducts } from './components/ViewBranchProducts';
import { ViewBranchSessions } from './components/ViewBranchSessions';
import { ViewBranchTransactions } from './components/ViewBranchTransactions';
import './style.scss';

interface Props {
	match: any;
}

const tabs = {
	PRODUCTS: 'Products',
	MACHINES: 'Machines',
	TRANSACTIONS: 'Transactions',
	SESSIONS: 'Sessions',
	DAYS: 'Days',
};

const ViewBranch = ({ match }: Props) => {
	// VARIABLES
	const branchId = match?.params?.id;
	const branch = useSelector(branchesSelectors.selectBranchById(Number(branchId)));

	// CUSTOM HOOKS
	const history = useHistory();
	const {
		branchProducts,
		getBranchProductsByBranch,
		status: branchProductsStatus,
	} = useBranchProducts();
	const { transactions, listTransactions, status: transactionsStatus } = useTransactions();
	const { sessions, listSessions, status: sessionsStatus } = useSessions();
	const { branchDays, listBranchDays, status: branchesDaysStatus } = useBranchesDays();
	const { branchMachines, getBranchMachines, status: branchesMachinesStatus } = useBranchMachines();

	// Effect: Fetch branch products
	useEffect(() => {
		console.log('branch?.online_url', branch?.online_url);
		if (!branch?.online_url) {
			history.replace('/branches');
			message.error('Branch has no online url.');
		} else {
			getBranchProductsByBranch(branchId);
			getBranchMachines(branchId);
			listTransactions(branchId);
			listSessions(branchId);
			listBranchDays(branchId);
		}
	}, [branchId, branch]);

	const getFetchLoading = useCallback(
		() =>
			[
				branchProductsStatus,
				transactionsStatus,
				sessionsStatus,
				branchesDaysStatus,
				branchesMachinesStatus,
			].includes(request.REQUESTING),
		[
			branchProductsStatus,
			transactionsStatus,
			sessionsStatus,
			branchesDaysStatus,
			branchesMachinesStatus,
		],
	);

	const getBreadcrumbItems = useCallback(
		() => [{ name: 'Branches', link: '/branches' }, { name: branch?.name }],
		[branch],
	);

	return (
		<Container
			title="[VIEW] Branch"
			rightTitle={branch?.name}
			breadcrumb={<Breadcrumb items={getBreadcrumbItems()} />}
			loadingText="Fetching branch details..."
			loading={getFetchLoading()}
		>
			<section>
				<Box className="ViewBranch">
					<Tabs defaultActiveKey={tabs.PRODUCTS} style={{ padding: '20px 25px' }} type="card">
						<Tabs.TabPane key={tabs.PRODUCTS} tab={tabs.PRODUCTS} disabled={!branch?.online_url}>
							<ViewBranchProducts branchProducts={branchProducts} branch={branch} />
						</Tabs.TabPane>

						<Tabs.TabPane key={tabs.MACHINES} tab={tabs.MACHINES} disabled={!branch?.online_url}>
							<ViewBranchMachines branchMachines={branchMachines} />
						</Tabs.TabPane>

						<Tabs.TabPane
							key={tabs.TRANSACTIONS}
							tab={tabs.TRANSACTIONS}
							disabled={!branch?.online_url}
						>
							<ViewBranchTransactions transactions={transactions} />
						</Tabs.TabPane>

						<Tabs.TabPane key={tabs.SESSIONS} tab={tabs.SESSIONS} disabled={!branch?.online_url}>
							<ViewBranchSessions sessions={sessions} />
						</Tabs.TabPane>

						<Tabs.TabPane key={tabs.DAYS} tab={tabs.DAYS} disabled={!branch?.online_url}>
							<ViewBranchDays branchDays={branchDays} />
						</Tabs.TabPane>
					</Tabs>
				</Box>
			</section>
		</Container>
	);
};

export default ViewBranch;
