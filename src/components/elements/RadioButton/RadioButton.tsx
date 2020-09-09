import { Field } from 'formik';
import * as React from 'react';
import './style.scss';

interface Item {
	id: string;
	label: string;
	value: string;
}

interface Props {
	items: Item[];
	name: string;
}

const RadioButton = ({ items, name }: Props) => (
	<div className="RadioButton">
		{items.map(({ id, value, label }) => (
			<div className="item" key={id}>
				<Field type="radio" id={id} name={name} value={value} className="radio-button" />
				<label htmlFor={id}>
					<img src={require('../../../assets/images/icon-check-white.svg')} alt="check icon" />
					{label}
				</label>
			</div>
		))}
	</div>
);

export default RadioButton;
