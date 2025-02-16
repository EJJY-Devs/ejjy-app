import cn from 'classnames';
import { debounce } from 'lodash';
import React, { useCallback } from 'react';
import { SearchInput, Select } from '../../elements';
import { Option } from '../../elements/Select/Select';
import { UnlinkedRS } from '../../UnlinkedRS/UnlinkedRS';
import './style.scss';

const SEARCH_DEBOUNCE_TIME = 250; // 250ms

interface Props {
	title?: string;
	searchPlaceholder?: string;
	statuses?: Option[];
	branches?: Option[];
	onStatusSelect?: any;
	pending?: number;

	onBranchSelect?: any;
	onSearch?: any;
}

export const TableHeaderRequisitionSlip = ({
	title,
	searchPlaceholder,
	onStatusSelect,
	statuses,
	branches,
	onBranchSelect,
	onSearch,
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

				<div className="selects">
					{onStatusSelect && (
						<Select
							classNames="status-select"
							options={statuses}
							placeholder="Status"
							onChange={onStatusSelect}
						/>
					)}

					{onBranchSelect && (
						<Select
							classNames="branch-select"
							options={branches}
							placeholder="Branches"
							onChange={onBranchSelect}
						/>
					)}
				</div>

				<UnlinkedRS value={0} />
			</div>
		</div>
	);
};

TableHeaderRequisitionSlip.defaultProps = {
	title: null,
	onSearch: null,
	searchPlaceholder: 'Search',
	pending: null,
};
