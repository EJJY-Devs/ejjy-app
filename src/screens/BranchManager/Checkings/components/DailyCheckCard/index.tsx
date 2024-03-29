import { AddIcon } from 'components';
import { Box, Button } from 'components/elements';
import React from 'react';
import { formatDateTimeExtended } from 'utils';
import './style.scss';

interface Props {
	dateTimeRequested?: any;
	onDailyCheck?: any;
}

export const DailyCheckCard = ({ dateTimeRequested, onDailyCheck }: Props) => (
	<Box className="DailyCheckCard">
		<div>
			<p className="DailyCheckCard_title">Unfulfilled Daily Check</p>
			<span className="DailyCheckCard_date">
				{formatDateTimeExtended(dateTimeRequested)}
			</span>
		</div>

		<Button
			icon={<AddIcon />}
			iconDirection="left"
			text="Input Daily Check"
			variant="primary"
			onClick={onDailyCheck}
		/>
	</Box>
);
