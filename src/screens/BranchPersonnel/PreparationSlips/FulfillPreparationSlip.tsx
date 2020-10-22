/* eslint-disable react-hooks/exhaustive-deps */
import { Col, message, Row } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { useSelector } from 'react-redux';
import { BarcodeTable, Container } from '../../../components';
import { Box, SearchInput } from '../../../components/elements';
import { KeyboardButton } from '../../../components/KeyboardButton/KeyboardButton';
import { selectors as authSelectors } from '../../../ducks/auth';
import { types } from '../../../ducks/BranchPersonnel/preparation-slips';
import { request } from '../../../global/types';
import { usePreparationSlips } from '../hooks/usePreparationSlips';
import { FulfillSlipModal } from './components/FulfillSlipModal';
import { PreparationSlipDetails } from './components/PreparationSlipDetails';
import './style.scss';

const SEARCH_DEBOUNCE_TIME = 500;

const columnsLeft = [{ name: 'Name' }, { name: 'Ordered' }];
const columnsRight = [{ name: 'Name' }, { name: 'Inputted' }];

export const fulfillType = {
	ADD: 1,
	DEDUCT: 2,
};

const PreparationSlips = ({ match }) => {
	const preparationSlipId = match?.params?.id;

	const user = useSelector(authSelectors.selectUser());
	const { preparationSlip, getPreparationSlipById, status, recentRequest } = usePreparationSlips();

	const [products, setProducts] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [selectedProductIndex, setSelectedProductIndex] = useState(null);
	const [fulfillPreparationSlipVisible, setFulfillPreparationSlipVisible] = useState(false);

	useEffect(() => {
		fetchPreparationSlip();
	}, []);

	// Effect: Format preparation slip products
	useEffect(() => {
		if (status === request.SUCCESS && preparationSlip) {
			searchProducts('');
		}
	}, [preparationSlip, status]);

	const getFetchLoading = useCallback(
		() => status === request.REQUESTING && recentRequest === types.GET_PREPARATION_SLIP_BY_ID,
		[status, recentRequest],
	);

	const fetchPreparationSlip = () => {
		getPreparationSlipById(preparationSlipId, user?.id);
	};

	const searchProducts = (searchedText) => {
		const formattedProducts = preparationSlip?.products
			?.filter(({ product }) => {
				const barcode = product?.barcode?.toLowerCase() ?? '';
				const name = product?.name?.toLowerCase() ?? '';
				return barcode.includes(searchedText) || name.includes(searchedText);
			})
			?.map((requestedProduct) => {
				const {
					id,
					product,
					quantity_piece,
					fulfilled_quantity_piece = 0,
					assigned_person,
				} = requestedProduct;
				const { id: product_id, name } = product;

				return {
					payload: {
						preparation_slip_id: preparationSlip.id,
						id,
						name,
						order_slip_product_id: id,
						product_id,
						assigned_person_id: assigned_person?.id,
						quantity_piece,
						fulfilled_quantity_piece,
					},
					value: [name, quantity_piece],
				};
			});

		setProducts(formattedProducts);
		setSelectedProduct(formattedProducts?.[0]?.payload);
		setSelectedProductIndex(0);
	};

	const debounceSearched = useCallback(
		debounce((keyword) => searchProducts(keyword), SEARCH_DEBOUNCE_TIME),
		[],
	);

	const handleKeyPress = (key) => {
		if (key === 'up') {
			setSelectedProductIndex((value) => {
				let newValue = value > 0 ? value - 1 : value;
				setSelectedProduct(products?.[newValue]?.payload);
				return newValue;
			});
		} else if (key === 'down') {
			setSelectedProductIndex((value) => {
				if (products?.length > 0) {
					let newValue = value < products.length - 1 ? value + 1 : value;
					setSelectedProduct(products?.[newValue]?.payload);

					return newValue;
				}
				return value;
			});
		} else if (key === 'f1') {
			onModifyQuantity(fulfillType.ADD);
		} else if (key === 'f2') {
			onModifyQuantity(fulfillType.DEDUCT);
		}
	};

	const onModifyQuantity = (type) => {
		if (selectedProduct) {
			setFulfillPreparationSlipVisible(true);
			setSelectedProduct((value) => ({ ...value, type }));
		} else {
			message.error('Select a product first');
		}
	};

	const onCloseFulfillPreparationSlip = () => {
		setFulfillPreparationSlipVisible(false);
	};

	return (
		<Container
			title="Fulfill Preparation Slip"
			loading={getFetchLoading()}
			loadingText="Fetching preparation slip..."
		>
			<KeyboardEventHandler
				handleKeys={['up', 'down', 'f1', 'f2']}
				onKeyEvent={(key, e) => handleKeyPress(key)}
			>
				<section className="FulfillPreparationSlip">
					<Box>
						<div className="details">
							<PreparationSlipDetails preparationSlip={preparationSlip} />
						</div>

						<div className="keyboard-keys">
							<KeyboardButton
								keyboardKey="F1"
								label="Add Quantity"
								onClick={() => onModifyQuantity(fulfillType.ADD)}
							/>
							<KeyboardButton
								keyboardKey="F2"
								label="Deduct Quantity"
								onClick={() => onModifyQuantity(fulfillType.DEDUCT)}
							/>
						</div>

						<div className="search-input-container">
							<SearchInput
								classNames="search-input"
								placeholder="Search product"
								onChange={(event) => debounceSearched(event.target.value.trim())}
								autoFocus
							/>
						</div>

						<Row gutter={25}>
							<Col xs={24} md={12}>
								<BarcodeTable
									columns={columnsLeft}
									data={products}
									selectedProduct={selectedProduct}
									displayInPage
								/>
							</Col>

							<Col xs={24} md={12}>
								{/* <BarcodeTable columns={columnsRight} data={[]} displayInPage /> */}
							</Col>
						</Row>
					</Box>

					<FulfillSlipModal
						preparationSlipProduct={selectedProduct}
						otherProducts={products}
						updatePreparationSlipsByFetching={fetchPreparationSlip}
						visible={fulfillPreparationSlipVisible}
						onClose={onCloseFulfillPreparationSlip}
					/>
				</section>
			</KeyboardEventHandler>
		</Container>
	);
};

export default PreparationSlips;
