import { Spin } from 'antd';
import React from 'react';
import { calculateTableHeight } from '../../utils/function';
import { ROW_HEIGHT } from '../Table/Table';
import './style.scss';

interface Column {
	name: string;
	width?: string;
}

interface Props {
	columns: Column[];
	data: any;
	loading?: boolean;
}

export const TableNormal = ({ columns, data, loading }: Props) => {
	return (
		<Spin size="large" spinning={loading}>
			<div className="TableNormal" style={{ height: calculateTableHeight(data?.length + 1) + 25 }}>
				<table>
					<thead>
						<tr>
							{columns.map(({ name, width }, index) => (
								<th key={`th-${index}`} style={{ width }}>
									{name}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((items, index) => (
							<tr key={`tr-${index}`} style={{ height: `${ROW_HEIGHT}px` }}>
								{items.map((item, index) => (
									<td key={`td-${index}`}>{item}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Spin>
	);
};

TableNormal.defaultProps = {
	loading: false,
};
