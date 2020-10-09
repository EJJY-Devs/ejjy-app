import React, { useEffect, useState } from 'react';
import { Table } from '../../../../../components';
import { ButtonLink } from '../../../../../components/elements';
import { calculateTableHeight, formatDateTime, sleep } from '../../../../../utils/function';

const columns = [
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Date & Time Created', dataIndex: 'datetime_created' },
];

interface Props {
	adjustmentSlips: any;
	onViewAdjustmentSlip: any;
	loading: boolean;
}

export const AdjustmentSlipsTable = ({ adjustmentSlips, onViewAdjustmentSlip, loading }: Props) => {
	const [adjustmentSlipsData, setAdjustmentSlipsData] = useState([]);

	// Effect: Format order slips to be rendered in Table
	useEffect(() => {
		if (adjustmentSlips) {
			const formattedAdjustmentSlips = adjustmentSlips.map((adjustmentSlip) => {
				const { id, datetime_created } = adjustmentSlip;

				return {
					id: <ButtonLink text={id} onClick={() => onViewAdjustmentSlip(adjustmentSlip)} />,
					datetime_created: formatDateTime(datetime_created),
				};
			});
			sleep(500).then(() => setAdjustmentSlipsData(formattedAdjustmentSlips));
		}
	}, [adjustmentSlips, onViewAdjustmentSlip]);

	return (
		<Table
			columns={columns}
			dataSource={adjustmentSlipsData}
			scroll={{ y: calculateTableHeight(adjustmentSlipsData.length), x: '100%' }}
			loading={loading}
		/>
	);
};
