import React from 'react';
import cn from 'classnames';
import { useField } from 'formik';
import iconPeso from 'assets/images/icon-peso.svg';
import { formatNumberWithCommas, formatRemoveCommas } from 'utils';
import './style.scss';

const formatMoney = (number) => Number(number).toFixed(2);

export interface IInputProps {
	id?: string;
	type?: string;
	placeholder?: string;
	max?: number;
	min?: number;
	step?: string;
	onChange?: any;
	isMoney?: boolean;
	isWholeNumber?: boolean;
	disabled?: boolean;
	onBlur?: any;
}

const FormInput = ({
	id,
	type,
	placeholder,
	max,
	min,
	step,
	onChange,
	isMoney,
	isWholeNumber,
	disabled,
}: IInputProps) => {
	const [field, , helpers] = useField(id);
	const inputRe = /^[0-9/.\b]+\.?$/g;

	const handleChangeField = (event) => {
		let { value } = event.target;

		if (isMoney) {
			value = formatRemoveCommas(value);
			if (inputRe.test(value)) {
				value = formatNumberWithCommas(value);
			}
		}

		helpers.setValue(value);
		onChange?.(value);
	};

	const handleBlur = (event) => {
		let { value } = event.target;

		if (isMoney) {
			value = formatRemoveCommas(value);
			value = formatMoney(value);
			value = formatNumberWithCommas(value);
		}

		helpers.setValue(value);
	};

	const handleKeyDown = (event) => {
		const { key } = event;

		const isNumber = type === 'number' || isMoney;
		const allowedInNumberKeys = [
			'Backspace',
			'Tab',
			'ArrowRight',
			'ArrowLeft',
			'Enter',
		];

		if (isNumber) {
			// Disregard other keys
			if (allowedInNumberKeys.includes(key)) {
				return;
			}

			// Check for double period
			if (key === '.' && (field?.value?.match(/\./g) || []).length >= 1) {
				event.preventDefault();
			}

			// Not allowed mathematical notations
			if (['e', 'E', '+', '-'].includes(key) || /[a-zA-Z\s]+/g.test(key)) {
				event.preventDefault();
			}

			// Cannot input decimal if non-weighing
			if (isWholeNumber && key === '.') {
				event.preventDefault();
			}
		}
	};

	return (
		<div className="FormInput">
			{isMoney && (
				<img alt="peso sign" className="FormInput_pesoSign" src={iconPeso} />
			)}
			<input
				// eslint-disable-next-line react/jsx-props-no-spreading
				{...field}
				className={cn('FormInput_input', {
					FormInput_input__isMoney: isMoney,
				})}
				disabled={disabled}
				id={id}
				max={max}
				min={min}
				name={id}
				placeholder={placeholder}
				step={step}
				type={type}
				onBlur={handleBlur}
				onChange={handleChangeField}
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
};

FormInput.defaultProps = {
	type: 'text',
	placeholder: '',
	disabled: false,
	isMoney: false,
	onBlur: () => {
		// Do nothing
	},
};

export default FormInput;
