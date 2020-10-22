import { Spin, Tooltip } from 'antd';
import cn from 'classnames';
import React, { ReactNode } from 'react';
import { calculateTableHeight } from '../../utils/function';
import { ROW_HEIGHT } from '../Table/Table';
import './style.scss';

interface Column {
	name: string | ReactNode;
	width?: string;
	center?: boolean;
	tooltip?: string;
}

interface Props {
	columns: Column[];
	data: any;
	loading?: boolean;
	displayInPage?: boolean;
	selectedProduct?: any;
}

export const BarcodeTable = ({ columns, data, loading, displayInPage, selectedProduct }: Props) => {
	return (
		<Spin size="large" spinning={loading}>
			<div
				className={cn('BarcodeTable', { page: displayInPage })}
				style={{ height: calculateTableHeight(data?.length + 1) + 25 }}
			>
				<table>
					<thead>
						<tr>
							{columns.map(({ name, width, center = false, tooltip = null }, index) => (
								<th key={`th-${index}`} style={{ width, textAlign: center ? 'center' : 'left' }}>
									{tooltip ? <Tooltip title={tooltip}>{name}</Tooltip> : name}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data?.map(({ payload, value }, index) => (
							<tr
								className={cn({ active: selectedProduct?.id === payload.id })}
								key={`tr-${index}`}
								style={{ height: `${ROW_HEIGHT}px` }}
							>
								{value.map((item, index) => (
									<td
										key={`td-${index}`}
										style={{ textAlign: columns?.[index].center ? 'center' : 'left' }}
									>
										{item}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Spin>
	);
};

BarcodeTable.defaultProps = {
	loading: false,
	displayInPage: false,
};
