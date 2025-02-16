import cn from 'classnames';
import React from 'react';
import './style.scss';

interface Props {
	value: string | number;
	classNames?: string;
}

export const UnlinkedRS = ({ value, classNames }: Props) => (
	<p className={cn('UnlinkedRS', classNames)}>{`Unlinked RS: ${value}`}</p>
);
