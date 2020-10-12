import React from 'react';
import { quantityTypeOptions } from '../../global/options';
import { quantityTypes } from '../../global/types';
import { Select } from '../elements';
import './style.scss';

interface Props {
	quantityText?: string;
	onQuantityTypeChange: any;
}

export const QuantitySelect = ({ quantityText, onQuantityTypeChange }: Props) => {
	return (
		<div className="QuantitySelect">
			<span>{quantityText}</span>
			<Select
				classNames="quantity-select"
				options={quantityTypeOptions}
				placeholder="quantity"
				value={quantityTypes.PIECE}
				onChange={onQuantityTypeChange}
			/>
		</div>
	);
};

QuantitySelect.defaultProps = {
	quantityText: 'Quantity',
};
