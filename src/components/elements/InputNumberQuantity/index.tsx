import { InputNumber, InputNumberProps } from 'antd';
import _ from 'lodash';
import React from 'react';

interface Props extends InputNumberProps<string> {
	isWeighing: boolean;
}

// eslint-disable-next-line react/display-name
const InputNumberQuantity = React.forwardRef<HTMLInputElement, any>(
	(props: Props, ref) => (
		<InputNumber
			ref={ref}
			decimalSeparator="."
			formatter={(value, info) => {
				let formattedValue = value || '';
				if (info.userTyping && !props.isWeighing) {
					formattedValue = _.round(Number(value), 0).toString();
				}

				return formattedValue;
			}}
			precision={props.isWeighing ? 3 : 0}
			{...props}
		/>
	),
);

export default InputNumberQuantity;
