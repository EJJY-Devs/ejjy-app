import React from 'react';
import { AddIcon } from '../../../../components';
import { Box, Button } from '../../../../components/elements';
import { formatDateTime } from '../../../../utils/function';

interface Props {
	onDailyCheck?: any;
	dateTimeRequested?: any;
}

export const DailyCheckCard = ({ onDailyCheck, dateTimeRequested }: Props) => (
	<Box>
		<div className="daily-check-container">
			<div>
				<p className="title">Daily Check</p>
				<span className="date">{formatDateTime(dateTimeRequested)}</span>
			</div>

			<Button
				text="Input Daily Check"
				variant="primary"
				onClick={onDailyCheck}
				iconDirection="left"
				icon={<AddIcon />}
			/>
		</div>
	</Box>
);
