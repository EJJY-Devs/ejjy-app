import { Table } from 'antd';
import { Content } from 'components';
import { Box } from 'components/elements';
import React from 'react';

const columns = [
	{
		title: 'Account Code',
		dataIndex: 'code',
		key: 'code',
	},
	{
		title: 'Account Name',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: 'Actions',
		dataIndex: 'actions',
		key: 'actions',
	},
];

export const ChartOfAccounts = () => (
	<Content title="Chart of Accounts">
		<Box padding>
			<Table columns={columns} dataSource={[]} pagination={false} bordered />
		</Box>
	</Content>
);
