import { Divider, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { TableHeader } from 'components';
import { Box, Label } from 'components/elements';
import { getProductCode } from 'ejjy-global';
import { requisitionSlipDetailsType } from 'global';
import React, { useEffect, useState } from 'react';
import { RequisitionSlipDetails } from 'screens/Shared/RequisitionSlips/components/RequisitionSlipDetails';

interface Props {
	requisitionSlip: any;
}

const columns: ColumnsType = [
	{ title: 'Code', dataIndex: 'code' },
	{ title: 'Name', dataIndex: 'name' },
];

export const RequestedProducts = ({ requisitionSlip }: Props) => {
	const [dataSource, setDataSource] = useState([]);

	useEffect(() => {
		const formattedProducts = requisitionSlip?.products?.map(
			(requestedProduct) => {
				const { product } = requestedProduct;

				return {
					code: getProductCode(product),
					name: product.name,
				};
			},
		);
		setDataSource(formattedProducts);
	}, [requisitionSlip]);

	return (
		<Box>
			<TableHeader
				title={`Requisition Slip [${requisitionSlip?.slip_type.toUpperCase()}]`}
			/>
			<RequisitionSlipDetails
				requisitionSlip={requisitionSlip}
				type={requisitionSlipDetailsType.SINGLE_VIEW}
			/>

			<div className="px-6 pb-3 pa-6">
				<Divider dashed />
				<Label label="Requested Products" />
			</div>

			<Table
				className="pa-6 pt-0"
				columns={columns}
				dataSource={dataSource}
				pagination={false}
				scroll={{ y: 250 }}
				bordered
			/>
		</Box>
	);
};
