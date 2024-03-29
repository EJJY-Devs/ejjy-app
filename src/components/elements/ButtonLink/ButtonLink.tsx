import * as React from 'react';
import './style.scss';

interface Props {
	text: string;
	onClick?: any;
}

const ButtonLink = ({ text, onClick }: Props) => (
	<button className="ButtonLink" type="button" onClick={onClick}>
		{text}
	</button>
);

export default ButtonLink;
