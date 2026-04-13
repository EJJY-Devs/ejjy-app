import { Spin, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table/interface';
import {
	Breadcrumb,
	Content,
	RequestErrors,
	TimeRangeFilter,
} from 'components';
import { Box } from 'components/elements';
import { appTypes, EMPTY_CELL } from 'global';
import { useProductCheckRetrieve } from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray, getAppType } from 'utils';

const columns: ColumnsType = [
	{ title: 'Reference Number', dataIndex: 'id' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Captured QTY', dataIndex: 'current', align: 'center' },
	{ title: 'Inputted QTY', dataIndex: 'fulfilled', align: 'center' },
	{ title: 'Adjusted Balance', dataIndex: 'adjustedBalance', align: 'center' },
	{ title: 'Status', dataIndex: 'status', align: 'center' },
];

interface Props {
	match: any;
}

export const ViewChecking = ({ match }: Props) => {
	// VARIABLES
	const { id: productCheckId } = match?.params || {};
	const basePath =
		getAppType() === appTypes.HEAD_OFFICE
			? '/office-manager/checkings'
			: '/branch-manager/checkings';

	// STATES
	const [dataSource, setDataSource] = useState([]);

	// CUSTOM HOOKS
	const {
		data: productCheck,
		isFetching: isFetchingProductCheck,
		error: productCheckErrors,
	} = useProductCheckRetrieve({
		id: productCheckId,
		options: {
			enabled: !!productCheckId,
		},
	});

	// METHODS
	useEffect(() => {
		if (productCheck) {
			const formattedProducts = productCheck.products.map((item) => {
				const {
					id,
					product,
					current_quantity_piece,
					fulfilled_quantity_piece,
					is_match,
				} = item;

				return {
					key: id,
					id,
					name: product.name,
					current: current_quantity_piece,
					fulfilled: fulfilled_quantity_piece,
					adjustedBalance: EMPTY_CELL,
					status: is_match ? (
						<Tag color="green">Balance</Tag>
					) : (
						<Tag color="blue">Adjusted</Tag>
					),
				};
			});

			setDataSource(formattedProducts);
		}
	}, [productCheck]);

	return (
		<Content
			breadcrumb={
				<Breadcrumb
					items={[
						{ name: 'Inventory Audit', link: basePath },
						{ name: productCheckId },
					]}
				/>
			}
			title="Inventory Audit"
		>
			<Box>
				<Spin spinning={isFetchingProductCheck}>
					<RequestErrors
						className="px-6"
						errors={convertIntoArray(productCheckErrors)}
						withSpaceBottom
					/>

					<p className="InventoryAudit__section-title">Audit Logs</p>

					<div className="px-6 pb-4">
						<TimeRangeFilter />
					</div>

					<Box padding>
						<Table
							columns={columns}
							dataSource={dataSource}
							pagination={false}
							scroll={{ x: 800 }}
							bordered
						/>
					</Box>
				</Spin>
			</Box>
		</Content>
	);
};
