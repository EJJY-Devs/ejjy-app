import { InputNumber, InputNumberProps } from 'antd';
import React from 'react';

const numberFormatter = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const FormattedInputNumber = ({
	onChange,
	onKeyDown,
	...props
}: InputNumberProps) => {
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const input = e.currentTarget;
		const { value, selectionStart, selectionEnd } = input;
		const start = selectionStart ?? 0;
		const end = selectionEnd ?? 0;

		if (/^\d$/.test(e.key) && start === end) {
			const dotIndex = value.indexOf('.');
			if (
				dotIndex !== -1 &&
				value.slice(dotIndex + 1).length >= 2 &&
				start > dotIndex
			) {
				e.preventDefault();
				return;
			}
		}

		onKeyDown?.(e);
	};

	const handleChange = (value: number | string | null) => {
		if (value === null || value === undefined) {
			onChange?.(value);
			return;
		}
		const str = String(value);
		const dotIndex = str.indexOf('.');
		const truncated =
			dotIndex !== -1 && str.length - dotIndex - 1 > 2
				? parseFloat(str.slice(0, dotIndex + 3))
				: value;
		onChange?.(truncated as number);
	};

	return (
		<InputNumber
			decimalSeparator="."
			formatter={(value, info) => {
				let formattedValue = '';
				if (info.userTyping) {
					const str = `${value}`;
					const dotIndex = str.indexOf('.');
					if (dotIndex !== -1) {
						const intPart = str.slice(0, dotIndex);
						const decPart = str.slice(dotIndex + 1, dotIndex + 3);
						formattedValue = `${intPart.replace(
							/\B(?=(\d{3})+(?!\d))/g,
							',',
						)}.${decPart}`;
					} else {
						formattedValue = str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
					}
				} else {
					formattedValue = value ? numberFormatter.format(Number(value)) : '';
				}

				return formattedValue;
			}}
			parser={(value) => {
				const stripped = value.replace(/\$\s?|(,*)/g, '');
				const dotIndex = stripped.indexOf('.');
				if (dotIndex !== -1) {
					return stripped.slice(0, dotIndex + 3);
				}
				return stripped;
			}}
			precision={2}
			prefix="₱"
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			{...props}
		/>
	);
};

export default FormattedInputNumber;
