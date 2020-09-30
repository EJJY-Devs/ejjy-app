import React from 'react';
import './styles.scss';
import cn from 'classnames';

interface Props {
	classNames?: any;
	size?: 'default' | 'small';
}

export const EmptyIcon = ({ classNames, size }: Props) => (
	<div className={cn('Icon', 'empty', classNames, size)}></div>
);

export const CheckIcon = ({ classNames, size }: Props) => (
	<div className={cn('Icon', 'primary', classNames, size)}>
		<img src={require('../../assets/images/icon-check-white.svg')} alt="icon" />
	</div>
);

export const ErrorIcon = ({ classNames, size }: Props) => (
	<div className={cn('Icon', 'error', classNames, size)}>
		<img src={require('../../assets/images/icon-x-white.svg')} alt="icon" />
	</div>
);

export const AddIcon = ({ classNames }: Props) => (
	<img
		src={require('../../assets/images/icon-add-white.svg')}
		width="16"
		alt="icon"
		className={classNames}
	/>
);

export const InfoIcon = ({ classNames }: Props) => (
	<img src={require('../../assets/images/icon-info.svg')} alt="icon" className={classNames} />
);
