import * as React from 'react';
import './style.scss';
import cn from 'classnames';

interface Props {
	id?: string;
	value: any;
	type?: string;
	placeholder?: string;
	disabled?: boolean;
	max?: number;
	min?: number;
	onChange: any;
	autoFocus?: boolean;
	classNames?: any;
}

const ControlledInput = ({
	classNames,
	type,
	id,
	max,
	min,
	placeholder,
	onChange,
	disabled,
	autoFocus,
	value,
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
		value={value}
	/>
);

ControlledInput.defaultProps = {
	type: 'text',
	placeholder: '',
	disabled: false,
};

export default ControlledInput;
