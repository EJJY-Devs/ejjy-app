import React from 'react';
import { BadgePill } from '../elements';

interface Props {
	classNames?: any;
}

export const DoneBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Done" variant="primary" />
);

export const ErrorBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Error" variant="error" />
);

export const AddedToOSBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Added to OS" variant="primary" />
);

export const NotAddedToOSBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Not Yet Added to OS" />
);

export const CompleteBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Complete" variant="primary" />
);

export const CompletedBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Completed" variant="primary" />
);

export const NewBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="New" variant="secondary" />
);

export const AvailableBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Available" variant="primary" />
);

export const ReorderBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Reorder" variant="secondary" />
);

export const OutOfStocksBadgePill = ({ classNames }: Props) => (
	<BadgePill classNames={classNames} label="Out of Stocks" variant="error" />
);
