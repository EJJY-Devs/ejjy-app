import { Spin, Tooltip } from 'antd';
import cn from 'classnames';
import React, { ReactNode } from 'react';
import {
	NO_INDEX_SELECTED,
	PRODUCT_LENGTH_PER_PAGE,
	ROW_HEIGHT,
} from '../../../../data';
import { useBoundStore } from '../../../../stores/useBoundStore';
import './style.scss';

interface Column {
	name: string | ReactNode;
	width?: string;
	rightAligned?: boolean;
	tooltip?: string;
	loading?: boolean;
	alignment?: string;
}

interface Props {
	columns: Column[];
	data: any;
	activeRow?: number;
	loading?: any;
}

export const Table = ({ columns, data, activeRow, loading }: Props) => {
	// CUSTOM HOOKS
	const pageNumber = useBoundStore((state: any) => state.pageNumber);

	// METHODS
	const getStyleAlignment = (alignment) =>
		({
			textAlign: alignment || 'left',
		} as React.CSSProperties);

	const calculateTableHeight = (listLength) => {
		const MAX_ROW_COUNT = 6;
		return (
			ROW_HEIGHT * (listLength <= MAX_ROW_COUNT ? listLength : MAX_ROW_COUNT)
		);
	};

	return (
		<Spin spinning={loading}>
			<div
				className="TableProducts"
				style={{ height: calculateTableHeight(data?.length + 1) }}
			>
				{!data.length && (
					<img
						alt="logo"
						className="placeholder"
						src={require('assets/images/logo.png')}
					/>
				)}

				<table>
					<thead>
						<tr>
							{columns.map(
								({ name, width, alignment, tooltip = null }, index) => (
									<th
										key={`th-${index}`}
										style={{ width, ...getStyleAlignment(alignment) }}
									>
										{tooltip ? <Tooltip title={tooltip}>{name}</Tooltip> : name}
									</th>
								),
							)}
						</tr>
					</thead>
					<tbody>
						{data?.map((row, index) => (
							<tr
								key={`tr-${index}`}
								className={cn({
									active:
										activeRow ===
										(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE + index,
								})}
								style={{ height: `${ROW_HEIGHT}px` }}
							>
								{row.map((item, rowIndex) => (
									<td
										key={`td-${rowIndex}`}
										style={getStyleAlignment(columns?.[rowIndex]?.alignment)}
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

Table.defaultProps = {
	activeRow: NO_INDEX_SELECTED,
};
