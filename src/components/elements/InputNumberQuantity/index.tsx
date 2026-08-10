import { InputNumber, InputNumberProps } from 'antd';
import _ from 'lodash';
import React from 'react';

interface Props extends InputNumberProps<string> {
	isWeighing: boolean;
}

// eslint-disable-next-line react/display-name
const InputNumberQuantity = React.forwardRef<HTMLInputElement, any>(
	(props: Props, ref) => {
		const precision = props.isWeighing ? 3 : 0;

		return (
			<InputNumber
				ref={ref}
				decimalSeparator="."
				formatter={(value, info) => {
					if (value === '' || value === null || value === undefined) {
						return '';
					}

					// While typing, only enforce whole numbers for non-weighing items;
					// leave weighing items alone so decimals can be typed freely.
					if (info.userTyping) {
						return props.isWeighing
							? value.toString()
							: _.round(Number(value), 0).toString();
					}

					// Custom `formatter` bypasses antd's own `precision` rounding, so
					// enforce it here: 3 decimals for weighing, whole numbers otherwise.
					const num = Number(value);
					return Number.isNaN(num) ? '' : num.toFixed(precision);
				}}
				precision={precision}
				{...props}
			/>
		);
	},
);

export default InputNumberQuantity;
