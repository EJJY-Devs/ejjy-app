import cn from 'classnames';
import React from 'react';
import './style.scss';

export const coloredTextType = {
	DEFAULT: 'default',
	PRIMARY: 'primary',
	ERROR: 'error',
};

interface Props {
	text: string;
	type: string;
	size?: 'default' | 'small';
}

export const ColoredText = ({ text, type, size }: Props) => {
	return <span className={cn('ColoredText', type, size)}>{text}</span>;
};

ColoredText.defaultProps = {
	size: 'default',
};
