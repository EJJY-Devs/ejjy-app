// import { Spin, Tooltip } from 'antd';
// import cn from 'classnames';
// import {
// 	ROW_HEIGHT,
// 	ServiceType,
// 	calculateTableHeight,
// 	useSiteSettings,
// } from 'ejjy-global';
// import { NO_INDEX_SELECTED, PRODUCT_LENGTH_PER_PAGE } from 'global';
// import React, { ReactElement, ReactNode } from 'react';

// import _ from 'lodash';
// import { useTableNavigationStore } from 'stores';
// import './style.scss';

// interface Column {
// 	name: string | ReactNode;
// 	width?: string;
// 	rightAligned?: boolean;
// 	tooltip?: string;
// 	loading?: boolean;
// 	alignment?: string;
// }

// interface Props {
// 	columns: Column[];
// 	data: (string | ReactElement | null)[][];
// 	activeRow?: number;
// 	loading?: boolean;
// }

// export const Table = ({
// 	columns,
// 	data,
// 	activeRow = NO_INDEX_SELECTED,
// 	loading,
// }: Props) => {
// 	// CUSTOM HOOKS
// 	const { pageNumber } = useTableNavigationStore();
// 	const { data: siteSettings } = useSiteSettings({
// 		serviceOptions: { type: ServiceType.OFFLINE },
// 	});

// 	// METHODS
// 	const getStyleAlignment = (alignment: string) =>
// 		({
// 			textAlign: alignment || 'left',
// 		} as React.CSSProperties);

// 	return (
// 		<Spin size="large" spinning={loading}>
// 			<div
// 				className="TableProducts"
// 				style={{ height: calculateTableHeight(data?.length + 1) + 25 }}
// 			>
// 				{data.length <= 0 && (
// 					<img
// 						alt="logo"
// 						className="placeholder"
// 						src={siteSettings?.logo_base64}
// 					/>
// 				)}

// 				<table>
// 					<thead>
// 						<tr>
// 							{columns.map(
// 								({ name, width, alignment, tooltip = null }, index) => (
// 									<th
// 										key={`th-${index}`}
// 										style={{
// 											width,
// 											...getStyleAlignment(_.toString(alignment)),
// 										}}
// 									>
// 										{tooltip ? <Tooltip title={tooltip}>{name}</Tooltip> : name}
// 									</th>
// 								),
// 							)}
// 						</tr>
// 					</thead>
// 					<tbody>
// 						{data?.map((row, index) => (
// 							<tr
// 								key={`tr-${index}`}
// 								className={cn({
// 									active:
// 										activeRow ===
// 										(pageNumber - 1) * PRODUCT_LENGTH_PER_PAGE + index,
// 								})}
// 								style={{ height: `${ROW_HEIGHT}px` }}
// 							>
// 								{row.map((item, rowIndex) => (
// 									<td
// 										key={`td-${rowIndex}`}
// 										style={getStyleAlignment(columns?.[rowIndex]?.alignment)}
// 									>
// 										{item}
// 									</td>
// 								))}
// 							</tr>
// 						))}
// 					</tbody>
// 				</table>
// 			</div>
// 		</Spin>
// 	);
// };
