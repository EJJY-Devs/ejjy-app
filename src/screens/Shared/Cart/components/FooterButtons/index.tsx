import {
	CalculatorOutlined,
	CaretLeftOutlined,
	CaretRightOutlined,
	LoadingOutlined,
} from '@ant-design/icons';
import { Spin, Tooltip } from 'antd';
import cn from 'classnames';
import { ceil } from 'lodash';
import React, { ReactNode, useCallback, useEffect } from 'react';
import CartButton from 'screens/Shared/Cart/components/CartButton';
import shallow from 'zustand/shallow';
import { PRODUCT_LENGTH_PER_PAGE } from '../../data';
import { useBoundStore } from '../../stores/useBoundStore';
import './style.scss';

interface FooterButtonsProps {
	isDisabled: boolean;
	onSubmit: () => void;
	showEwtCalculator?: boolean;
	onEwtCalculatorClick?: () => void;
}

export const FooterButtons = ({
	isDisabled,
	onSubmit,
	showEwtCalculator,
	onEwtCalculatorClick,
}: FooterButtonsProps) => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'F8') {
				event.preventDefault();
				if (!isDisabled) {
					onSubmit();
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isDisabled, onSubmit]);

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

			<div className="FooterButtons_submitGroup">
				{showEwtCalculator && (
					<Tooltip title="Calculate EWT">
						{/* Plain button with a .disabled class rather than antd's Button
						with a native disabled attribute - same pattern as CartButton
						and NavigationButton below, and it keeps antd's own
						disabled-state styling (and its Tooltip's special-casing of
						disabled elements) from fighting this button's sizing. */}
						<button
							className={cn('EwtCalculatorButton', {
								disabled: products.length === 0 || isDisabled,
							})}
							type="button"
							onClick={
								products.length === 0 || isDisabled
									? null
									: onEwtCalculatorClick
							}
						>
							<CalculatorOutlined />
						</button>
					</Tooltip>
				)}

				<CartButton
					disabled={products.length === 0 || isDisabled}
					shortcutKey="F8"
					size="lg"
					text="Submit"
					variant="primary"
					onClick={onSubmit}
				/>
			</div>
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
