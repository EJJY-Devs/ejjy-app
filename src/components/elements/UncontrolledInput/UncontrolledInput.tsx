import * as React from 'react';
import './style.scss';
import cn from 'classnames';

interface Props {
	id?: string;
	type?: string;
	placeholder?: string;
	disabled?: boolean;
	max?: number;
	min?: number;
	onChange: any;
	autoFocus?: boolean;
	classNames?: any;
}

const UncontrolledInput = ({
	classNames,
	type,
	id,
	max,
	min,
	placeholder,
	onChange,
	disabled,
	autoFocus,
}: Props) => (
	<input
		type={type}
		id={id}
		name={id}
		className={cn('Input', classNames)}
		placeholder={placeholder}
		max={max}
		min={min}
		disabled={disabled}
		onChange={(event) => onChange(event.target.value)}
		autoFocus={autoFocus}
	/>
);

UncontrolledInput.defaultProps = {
	type: 'text',
	placeholder: '',
	disabled: false,
};

export default UncontrolledInput;
