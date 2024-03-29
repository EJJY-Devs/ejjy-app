/* eslint-disable no-confusing-arrow */
import { Spin, Tooltip } from 'antd';
import cn from 'classnames';
import { NOT_FOUND_INDEX, ROW_HEIGHT } from 'global/';
import React, { ReactNode, useEffect, useRef } from 'react';
import './style.scss';

const calculateTableHeight = (listLength) => {
	const MAX_ROW_COUNT = 6;
	return (
		ROW_HEIGHT * (listLength <= MAX_ROW_COUNT ? listLength : MAX_ROW_COUNT)
	);
};

interface Column {
	name: string | ReactNode;
	width?: string;
	center?: boolean;
	tooltip?: string;
}

interface Props {
	columns: Column[];
	data: any;
	activeRow?: number;
	loading?: boolean;
	displayInPage?: boolean;
	hasCustomHeaderComponent?: boolean;
}

export const TableNormal = ({
	columns,
	data,
	activeRow,
	loading,
	displayInPage,
	hasCustomHeaderComponent,
}: Props) => {
	const rowRefs = useRef([]);

	// Effect: Focus active item
	useEffect(() => {
		if (activeRow !== NOT_FOUND_INDEX) {
			rowRefs.current?.[activeRow]?.focus();
		}
	}, [activeRow]);

	return (
		<Spin spinning={loading}>
			<div
				className={cn('TableNormal', {
					page: displayInPage,
					hasCustomHeaderComponent,
				})}
				style={{ height: calculateTableHeight(data?.length + 1) + 25 }}
			>
				<table>
					<thead>
						<tr>
							{columns.map(
								({ name, width, center = false, tooltip = null }, index) => (
									<th
										key={`th-${index}`}
										style={{ width, textAlign: center ? 'center' : 'left' }}
									>
										{tooltip ? <Tooltip title={tooltip}>{name}</Tooltip> : name}
									</th>
								),
							)}
						</tr>
					</thead>
					<tbody>
						{data?.map((row, rowIndex) =>
							row?.isCustom ? (
								<tr
									key={`tr-${rowIndex}`}
									style={{ height: `${row?.height || ROW_HEIGHT}px` }}
								>
									<td key={`td-${rowIndex}`} colSpan={row.span}>
										{row.content}
									</td>
								</tr>
							) : (
								<tr
									key={`tr-${rowIndex}`}
									ref={(el) => {
										rowRefs.current[rowIndex] = el;
									}}
									className={cn({ active: rowIndex === activeRow })}
									style={{ height: `${ROW_HEIGHT}px` }}
									tabIndex={rowIndex}
								>
									{row
										.filter((item) => !item?.isHidden)
										.map((item, columnIndex) => (
											<td
												key={`td-${columnIndex}`}
												style={{
													textAlign: columns?.[columnIndex].center
														? 'center'
														: 'left',
												}}
											>
												{item}
											</td>
										))}
								</tr>
							),
						)}
					</tbody>
				</table>
			</div>
		</Spin>
	);
};

TableNormal.defaultProps = {
	loading: false,
	displayInPage: false,
	activeRow: NOT_FOUND_INDEX,
};
