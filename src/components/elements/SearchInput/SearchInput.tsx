import { SearchOutlined } from '@ant-design/icons';
import * as React from 'react';
import './style.scss';
import cn from 'classnames';

interface Props {
	placeholder?: string;
	onChange: any;
	classNames?: any;
	autoFocus?: boolean;
}

const SearchInput = ({ onChange, placeholder, autoFocus, classNames }: Props) => (
	<div className={cn('SearchInput', classNames)}>
		<SearchOutlined className="icon" />
		<input onChange={onChange} placeholder={placeholder} tabIndex={1} autoFocus={autoFocus} />
	</div>
);

export default SearchInput;
