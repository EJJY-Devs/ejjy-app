import React from 'react';
import './style.scss';

interface Props {
	keyboardKey: string;
	label?: string;
	onClick: any;
}

export const KeyboardButton = ({ keyboardKey, label, onClick }: Props) => (
	<button className="KeyboardButton" type="button" onClick={onClick}>
		<div className="key">{keyboardKey}</div>
		<span className="label">{label}</span>
	</button>
);
