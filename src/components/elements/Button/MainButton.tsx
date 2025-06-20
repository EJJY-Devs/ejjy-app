import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import cn from 'classnames';
import React, { ReactNode } from 'react';
import './style.scss';

interface Props {
	className?: string;
	disabled?: boolean;
	isHidden?: boolean;
	isWide?: boolean;
	loading?: boolean;
	onClick: () => void;
	shortcutKey?: string;
	tabIndex?: number;
	title: string | ReactNode;
}

const MainButton = ({
	className,
	disabled,
	isHidden,
	isWide,
	loading,
	onClick,
	shortcutKey,
	tabIndex,
	title,
}: Props) => (
	<button
		className={cn('MainButton', className, {
			MainButton___disabled: disabled,
			MainButton___loading: loading,
			MainButton___wide: isWide,
			MainButton___hidden: isHidden,
		})}
		tabIndex={tabIndex}
		type="button"
		onClick={onClick}
	>
		{loading ? (
			<Spin
				className="MainButton_spinner"
				indicator={
					<LoadingOutlined style={{ fontSize: 17, color: 'white' }} spin />
				}
			/>
		) : (
			<>
				<span>{title}</span>
				<span className="MainButton_shortcutKey">{shortcutKey}</span>
			</>
		)}
	</button>
);

export default MainButton;
