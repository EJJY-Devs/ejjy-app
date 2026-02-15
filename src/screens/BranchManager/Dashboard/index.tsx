import { Divider } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import { ReportsPerMachine } from 'screens/Shared/Dashboard/components/ReportsPerMachine';
import { FastMovingProductsTile } from 'screens/Shared/Dashboard/components/FastMovingProductsTile';
import { getLocalBranchId } from 'utils';
import React from 'react';

export const Dashboard = () => {
	return (
		<Content title="Dashboard">
			<Box>
				<ReportsPerMachine branchId={getLocalBranchId()} />

				<Divider />
				<div className="px-6 pb-6">
					<FastMovingProductsTile branchId={getLocalBranchId()} />
				</div>
			</Box>
		</Content>
	);
};
