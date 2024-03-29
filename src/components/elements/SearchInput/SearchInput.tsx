/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable jsx-a11y/tabindex-no-positive */
import { SearchOutlined } from '@ant-design/icons';
import * as React from 'react';
import './style.scss';
import cn from 'classnames';

interface Props {
	placeholder?: string;
	onChange: any;
	classNames?: any;
	autoFocus?: boolean;
	disabled?: boolean;
}

const SearchInput = ({
	onChange,
	placeholder,
	autoFocus,
	disabled,
	classNames,
}: Props) => (
	<div className={cn('SearchInput', classNames)}>
		<SearchOutlined className="icon" />
		<input
			autoFocus={autoFocus}
			disabled={disabled}
			placeholder={placeholder}
			tabIndex={1}
			onChange={onChange}
		/>
	</div>
);

export default SearchInput;
