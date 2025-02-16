import { PlusOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import cn from 'classnames';
import { debounce } from 'lodash';
import React, { ReactNode, useCallback } from 'react';
import { SearchInput, Select } from '../../elements';
import { Option } from '../../elements/Select/Select';
import { UnlinkedRS } from '../../UnlinkedRS/UnlinkedRS';
import './style.scss';

const SEARCH_DEBOUNCE_TIME_MS = 250;

interface Props {
	buttons?: ReactNode;
	buttonName?: string;
	onCreate?: any;
	onCreateDisabled?: boolean;
	onCreateIcon?: ReactNode;
	onCreateLoading?: boolean;
	onCreateTooltip?: string;
	onSearch?: any;
	onStatusSelect?: any;
	pending?: number;
	searchDisabled?: boolean;
	searchPlaceholder?: string;
	statusDisabled?: boolean;
	statuses?: Option[];
	title?: string;
	wrapperClassName?: string;
}

export const TableHeader = ({
	buttons,
	buttonName,
	onCreate,
	onCreateDisabled,
	onCreateIcon,
	onCreateLoading,
	onCreateTooltip,
	onSearch,
	onStatusSelect,
	pending,
	searchDisabled,
	searchPlaceholder,
	statusDisabled,
	statuses,
	title,
	wrapperClassName,
}: Props) => {
	const debounceSearchedChange = useCallback(
		debounce((keyword) => onSearch(keyword), SEARCH_DEBOUNCE_TIME_MS),
		[onSearch],
	);

	return (
		<div className={cn('TableHeader', wrapperClassName)}>
			{title && <p className="title">{title}</p>}
			<div
				className={cn('controls', {
					'no-title': !title,
					'only-button': !title && !onSearch,
				})}
			>
				<div className="main-controls">
					{onSearch && (
						<SearchInput
							classNames="search-input"
							disabled={searchDisabled}
							placeholder={searchPlaceholder}
							onChange={(event) => {
								debounceSearchedChange(event.target.value.trim());
							}}
						/>
					)}

					{onStatusSelect && (
						<Select
							classNames="status-select"
							disabled={statusDisabled}
							options={statuses}
							placeholder="Status"
							onChange={onStatusSelect}
						/>
					)}
				</div>

				<div className="pending-button">
					{pending >= 0 && <UnlinkedRS value={pending} />}

					{buttons}

					{onCreate && (
						<Tooltip title={onCreateTooltip}>
							<Button
								disabled={onCreateDisabled}
								icon={onCreateIcon || <PlusOutlined />}
								loading={onCreateLoading}
								type="primary"
								onClick={onCreate}
							>
								{buttonName}
							</Button>
						</Tooltip>
					)}
				</div>
			</div>
		</div>
	);
};

TableHeader.defaultProps = {
	title: null,
	onSearch: null,
	onCreate: null,
	searchPlaceholder: 'Search',
};
