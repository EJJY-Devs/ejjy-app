import cn from 'classnames';
import { debounce } from 'lodash';
import React, { useCallback } from 'react';
import { AddIcon } from '../..';
import { Button, SearchInput, Select } from '../../elements';
import { Option } from '../../elements/Select/Select';
import { UnlinkedRS } from '../../UnlinkedRS/UnlinkedRS';
import './style.scss';

const SEARCH_DEBOUNCE_TIME = 250; // 250ms

interface Props {
	title?: string;
	searchPlaceholder?: string;
	buttonName?: string;
	statuses?: Option[];
	onOutOfStockDisabled?: boolean;
	onOutOfStockTooltip?: string;
	onCreateDisabled?: boolean;
	onCreateTooltip?: string;
	onStatusSelect?: any;
	onSearch?: any;
	onCreate?: any;
	onOutOfStock?: any;
	pending?: number;
}

export const TableHeaderOrderSlip = ({
	title,
	searchPlaceholder,
	buttonName,
	onStatusSelect,
	statuses,
	onOutOfStockDisabled,
	onOutOfStockTooltip,
	onCreateDisabled,
	onCreateTooltip,
	onSearch,
	onCreate,
	onOutOfStock,
	pending,
}: Props) => {
	const debounceSearchedChange = useCallback(
		debounce((keyword) => onSearch(keyword), SEARCH_DEBOUNCE_TIME),
		[onSearch],
	);

	return (
		<div className="TableHeader">
			{title && <p className="title">{title}</p>}
			<div
				className={cn('controls', {
					'no-title': !title,
					'only-button': !title && !onSearch,
				})}
			>
				{onSearch && (
					<SearchInput
						classNames="search-input"
						placeholder={searchPlaceholder}
						onChange={(event) => {
							debounceSearchedChange(event.target.value.trim());
						}}
					/>
				)}

				{onStatusSelect && (
					<Select
						classNames="status-select"
						options={statuses}
						placeholder="status"
						onChange={onStatusSelect}
					/>
				)}

				<UnlinkedRS value={pending} />

				{onOutOfStock && (
					<Button
						disabled={onOutOfStockDisabled}
						icon={<AddIcon />}
						iconDirection="left"
						text="Out Of Stock"
						tooltip={onOutOfStockTooltip}
						variant="primary"
						onClick={onOutOfStock}
					/>
				)}

				{onCreate && (
					<Button
						disabled={onCreateDisabled}
						icon={<AddIcon />}
						iconDirection="left"
						text={buttonName}
						tooltip={onCreateTooltip}
						variant="primary"
						onClick={onCreate}
					/>
				)}
			</div>
		</div>
	);
};

TableHeaderOrderSlip.defaultProps = {
	title: null,
	onSearch: null,
	onCreate: null,
	searchPlaceholder: 'Search',
};
