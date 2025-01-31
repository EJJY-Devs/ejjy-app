import {
	CaretLeftOutlined,
	CaretRightOutlined,
	LoadingOutlined,
} from '@ant-design/icons';
import { Spin } from 'antd';
import cn from 'classnames';
import { ceil } from 'lodash';
import React, { ReactNode, useCallback } from 'react';
import CartButton from 'screens/Shared/Cart/components/CartButton';
import shallow from 'zustand/shallow';
import { PRODUCT_LENGTH_PER_PAGE } from '../../data';
import { useBoundStore } from '../../stores/useBoundStore';
import './style.scss';

export const FooterButtons = ({ isDisabled, onSubmit }) => {
	// CUSTOM HOOKS
	const { products, pageNumber, nextPage, prevPage } = useBoundStore(
		(state: any) => ({
			products: state.products,
			pageNumber: state.pageNumber,
			nextPage: state.nextPage,
			prevPage: state.prevPage,
		}),
		shallow,
	);

	// METHODS
	const getMaxPage = useCallback(
		() => ceil(products.length / PRODUCT_LENGTH_PER_PAGE),
		[products],
	);

	const handleNextPage = () => {
		const maxPage = getMaxPage();
		if (pageNumber < maxPage) {
			nextPage();
		}
	};

	const handlePrevPage = () => {
		if (pageNumber > 1) {
			prevPage();
		}
	};

	return (
		<div className="FooterButtons">
			<div className="NavigationButton_wrappers">
				<NavigationButton
					className="btn-prev"
					disabled={pageNumber === 1}
					icon={<CaretLeftOutlined />}
					onClick={handlePrevPage}
				/>

				<NavigationButton
					className="btn-next"
					disabled={
						pageNumber === getMaxPage() ||
						products.length <= PRODUCT_LENGTH_PER_PAGE
					}
					icon={<CaretRightOutlined />}
					onClick={handleNextPage}
				/>
			</div>

			<CartButton
				disabled={products.length === 0 || isDisabled}
				shortcutKey="F1"
				size="lg"
				text="Submit"
				variant="primary"
				onClick={onSubmit}
			/>
		</div>
	);
};

interface Props {
	icon: ReactNode;
	onClick: any;
	className?: string;
	disabled?: boolean;
	loading?: boolean;
}

const loadingIcon = (
	<LoadingOutlined
		style={{ fontSize: 17, color: 'rgba(35, 37, 46, 0.85)' }}
		spin
	/>
);

export const NavigationButton = ({
	className,
	disabled,
	icon,
	loading,
	onClick,
}: Props) => (
	<button
		className={cn('NavigationButton', className, {
			disabled: disabled || loading,
		})}
		tabIndex={-1}
		type="button"
		onClick={onClick}
	>
		{loading ? <Spin className="spinner" indicator={loadingIcon} /> : icon}
	</button>
);
