/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Spin } from 'antd';
import cn from 'classnames';
import { getProductCode } from 'ejjy-global';
import React, { useEffect, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import shallow from 'zustand/shallow';
import { NO_INDEX_SELECTED } from '../../../data';
import '../style.scss';

const PRODUCT_LIST_HEIGHT = 450;

interface Props {
	searchedProducts: any;
	onSelect: any;
	loading: boolean;
}

export const SearchSuggestion = ({
	searchedProducts,
	onSelect,
	loading,
}: Props) => {
	// REFS
	const itemRefs = useRef([]);
	const scrollbarRef = useRef(null);

	// CUSTOM HOOKS
	const { activeIndex, setActiveIndex } = useBoundStore(
		(state: any) => ({
			activeIndex: state.activeIndex,
			setActiveIndex: state.setActiveIndex,
		}),
		shallow,
	);

	// METHODS
	useEffect(() => {
		if (activeIndex !== NO_INDEX_SELECTED) {
			const scrollTop = itemRefs.current?.[activeIndex]?.offsetTop || 0;

			if (scrollTop > PRODUCT_LIST_HEIGHT) {
				scrollbarRef.current?.scrollTop(scrollTop);
			} else {
				scrollbarRef.current?.scrollTop(0);
			}
		}
	}, [activeIndex, scrollbarRef]);

	return (
		<div className="ProductSearch_suggestion">
			<Spin spinning={loading}>
				<Scrollbars
					ref={scrollbarRef}
					autoHeightMax={PRODUCT_LIST_HEIGHT}
					autoHeightMin="100%"
					style={{ height: '100%' }}
					autoHeight
				>
					{searchedProducts.map((productData, index) => {
						const { product } = productData;
						return (
							<div
								key={index}
								ref={(el) => {
									itemRefs.current[index] = el;
								}}
								className={cn('ProductSearch_suggestion_wrapper', {
									ProductSearch_suggestion_wrapper___active:
										activeIndex === index,
								})}
								onClick={onSelect}
								onMouseEnter={() => setActiveIndex(index)}
							>
								<div className="ProductSearch_suggestion_product">
									<p className="ProductSearch_suggestion_product_name">
										{product.name}
									</p>
									<p className="ProductSearch_suggestion_product_code">
										{getProductCode(product)}
									</p>
								</div>
							</div>
						);
					})}
				</Scrollbars>
			</Spin>
		</div>
	);
};

// const ProductStatus = ({ status }) => {
// 	const render = useCallback(() => {
// 		let component = null;

// 		if (status === productStatus.AVAILABLE) {
// 			component = <Tag color="green">Available</Tag>;
// 		} else if (status === productStatus.REORDER) {
// 			component = <Tag color="orange">Reorder</Tag>;
// 		} else if (status === productStatus.OUT_OF_STOCK) {
// 			component = <Tag color="red">Out of Stocks</Tag>;
// 		}

// 		return component;
// 	}, [status]);

// 	return render();
// };
