import React from 'react';
import { quantityTypeOptions } from '../../global/options';
import { quantityTypes } from '../../global/types';
import { Select } from '../elements';
import './style.scss';

interface Props {
	quantityText?: string;
	quantityValue?: string;
	onQuantityTypeChange: any;
}

export const QuantitySelect = ({ quantityText, quantityValue, onQuantityTypeChange }: Props) => {
	return (
		<div className="QuantitySelect">
			<span>{quantityText}</span>
			<Select
				classNames="quantity-select"
				options={quantityTypeOptions}
				placeholder="quantity"
				value={quantityValue}
				onChange={onQuantityTypeChange}
			/>
		</div>
	);
};

QuantitySelect.defaultProps = {
	quantityValue: quantityTypes.PIECE,
	quantityText: 'Quantity',
};
