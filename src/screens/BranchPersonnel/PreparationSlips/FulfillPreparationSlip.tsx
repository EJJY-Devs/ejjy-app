import { Col, Divider, message, Row } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import BarcodeReader from 'react-barcode-reader';
import {
	BarcodeTable,
	CheckIcon,
	Container,
	TableNormal,
} from '../../../components';
import { Box, Button, SearchInput } from '../../../components/elements';
import { KeyboardButton } from '../../../components/KeyboardButton/KeyboardButton';
import { selectors as authSelectors } from '../../../ducks/auth';
import { types } from '../../../ducks/BranchPersonnel/preparation-slips';
import { preparationSlipStatus, request } from '../../../global/types';
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

interface Props {
	match: any;
}

const PreparationSlips = ({ match }: Props) => {
	const preparationSlipId = match?.params?.id;
	const history = useHistory();

	const user = useSelector(authSelectors.selectUser());
	const {
		preparationSlip,
		fulfillPreparationSlip,
		getPreparationSlipById,
		status: prepSlipStatus,
		recentRequest,
		reset,
	} = usePreparationSlips();

	const [products, setProducts] = useState([]);
	const [allProducts, setAllProducts] = useState([]);
	const [inputtedProducts, setInputtedProducts] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	// eslint-disable-next-line no-unused-vars
	const [selectedProductIndex, setSelectedProductIndex] = useState(null);
	const [fulfillPreparationSlipVisible, setFulfillPreparationSlipVisible] =
		useState(false);

	useEffect(() => {
		fetchPreparationSlip();
	}, []);

	// Effect: Format preparation slip products
	useEffect(() => {
		if (
			prepSlipStatus === request.SUCCESS &&
			recentRequest === types.GET_PREPARATION_SLIP_BY_ID &&
			preparationSlip
		) {
			if (preparationSlip.status === preparationSlipStatus.COMPLETED) {
				history.replace('/preparation-slips');
				return;
			}

			reset();
			searchProducts('');
			formatAllProducts();
			formatOrderedProducts();
		}
	}, [preparationSlip, recentRequest, prepSlipStatus]);

	// Effect: Fulfill success
	useEffect(() => {
		if (
			prepSlipStatus === request.SUCCESS &&
			recentRequest === types.FULFILL_PREPARATION_SLIP
		) {
			fetchPreparationSlip();
		}
	}, [prepSlipStatus, recentRequest]);

	const getFetchLoadingText = useCallback(() => {
		if (prepSlipStatus === request.REQUESTING) {
			if (recentRequest === types.GET_PREPARATION_SLIP_BY_ID) {
				return 'Fetching preparation slip...';
			}

			if (recentRequest === types.FULFILL_PREPARATION_SLIP) {
				return 'Submitting preparation slip...';
			}
		}

		return '';
	}, [prepSlipStatus, recentRequest]);

	const fetchPreparationSlip = () => {
		getPreparationSlipById(preparationSlipId, user?.id, ({ status }) => {
			if (status === request.ERROR) {
				history.replace('/404');
			}
		});
	};

	const searchProducts = (keyword) => {
		const lowerCaseKeyword = keyword?.toLowerCase();

		const formattedProducts = preparationSlip?.products
			?.filter(({ product }) => {
				const name = product?.name?.toLowerCase() ?? '';
				const barcode = product?.barcode?.toLowerCase() ?? '';
				const textcode = product?.textcode?.toLowerCase() ?? '';

				return (
					name.includes(lowerCaseKeyword) ||
					barcode.includes(lowerCaseKeyword) ||
					textcode.includes(lowerCaseKeyword)
				);
			})
			?.sort((a, b) => a.fulfilled_quantity_piece - b.fulfilled_quantity_piece)
			?.map((requestedProduct) => {
				const {
					id,
					product,
					quantity_piece,
					fulfilled_quantity_piece = 0,
					assigned_person,
				} = requestedProduct;
				const { id: product_id, name, barcode } = product;

				const productName = (
					<div className="product-name">
						{fulfilled_quantity_piece > 0 ? <CheckIcon /> : null}
						<span>{name}</span>
					</div>
				);

				return {
					payload: {
						preparation_slip_id: preparationSlip.id,
						id,
						barcode,
						name,
						order_slip_product_id: id,
						product_id,
						assigned_person_id: assigned_person?.id,
						quantity_piece,
						fulfilled_quantity_piece,
					},
					value: [productName, quantity_piece],
				};
			});

		setProducts(formattedProducts);
		setSelectedProduct(formattedProducts?.[0]?.payload);
		setSelectedProductIndex(0);
	};

	const formatAllProducts = () => {
		const formattedProducts = preparationSlip?.products?.map(
			(requestedProduct) => {
				const {
					id,
					product,
					quantity_piece,
					fulfilled_quantity_piece = 0,
					assigned_person,
				} = requestedProduct;
				const { id: product_id, name } = product;

				return {
					preparation_slip_id: preparationSlip.id,
					id,
					name,
					order_slip_product_id: id,
					product_id,
					assigned_person_id: assigned_person?.id,
					quantity_piece,
					fulfilled_quantity_piece,
				};
			},
		);

		setAllProducts(formattedProducts);
	};

	const formatOrderedProducts = () => {
		const formattedProducts = preparationSlip?.products
			?.filter(({ fulfilled_quantity_piece }) => fulfilled_quantity_piece > 0)
			?.map((requestedProduct) => [
				requestedProduct?.product?.name,
				requestedProduct?.fulfilled_quantity_piece,
			]);

		setInputtedProducts(formattedProducts);
	};

	const debounceSearched = useCallback(
		debounce((keyword) => searchProducts(keyword), SEARCH_DEBOUNCE_TIME),
		[preparationSlip],
	);

	const handleKeyPress = (key) => {
		if (key === 'up') {
			setSelectedProductIndex((value) => {
				const newValue = value > 0 ? value - 1 : value;
				setSelectedProduct(products?.[newValue]?.payload);
				return newValue;
			});
		} else if (key === 'down') {
			setSelectedProductIndex((value) => {
				if (products?.length > 0) {
					const newValue = value < products.length - 1 ? value + 1 : value;
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

	const onFulfill = () => {
		const fulfilledPrepSlipProducts = allProducts?.map((product) => ({
			order_slip_product_id: product?.order_slip_product_id,
			product_id: product?.product_id,
			assigned_person_id: product?.assigned_person_id,
			quantity_piece: product?.quantity_piece,
			fulfilled_quantity_piece: product?.fulfilled_quantity_piece || undefined,
		}));

		fulfillPreparationSlip({
			id: preparationSlip.id,
			is_prepared: true,
			assigned_store_id: user.branch.id,
			products: fulfilledPrepSlipProducts,
		});
	};

	const handleScan = (test) => {
		let data = `${test}`;
		if (test === '4800047820182') {
			data = 'PRODUCT0002';
		}

		const product = preparationSlip.products.find(
			({ product: prepSlipProduct }) => {
				const barcode = prepSlipProduct?.barcode?.toLowerCase() || '';
				const scannedBarcode = data?.toLowerCase() || '';

				return barcode === scannedBarcode;
			},
		);

		if (product) {
			const newQuantity = product?.fulfilled_quantity_piece
				? product?.fulfilled_quantity_piece + 1
				: 1;

			if (newQuantity > product.quantity_piece) {
				message.error(
					`Total quantity must not be greater than ${product.quantity_piece}`,
				);
				return;
			}

			const prepSlipProducts = preparationSlip.products
				?.filter(({ id }) => id !== product.id)
				?.map((prepSlipProduct) => ({
					order_slip_product_id: prepSlipProduct?.id,
					product_id: prepSlipProduct?.product?.id,
					assigned_person_id: prepSlipProduct?.assigned_person?.id,
					quantity_piece: prepSlipProduct?.quantity_piece,
					fulfilled_quantity_piece:
						prepSlipProduct?.fulfilled_quantity_piece || undefined,
				}));

			reset();

			fulfillPreparationSlip({
				id: preparationSlip.id,
				is_prepared: false,
				assigned_store_id: user.branch.id,
				products: [
					{
						order_slip_product_id: product?.id,
						product_id: product?.product?.id,
						assigned_person_id: product?.assigned_person?.id,
						quantity_piece: product?.quantity_piece,
						fulfilled_quantity_piece: newQuantity,
					},
					...prepSlipProducts,
				],
			});
		} else {
			message.error(`Cannot find the scanned product: ${data}`);
		}
	};

	const handleError = (err) => {
		message.error(err);
	};

	return (
		<Container
			title="Fulfill Preparation Slip"
			loading={prepSlipStatus === request.REQUESTING}
			loadingText={getFetchLoadingText()}
		>
			<BarcodeReader onError={handleError} onScan={handleScan} />
			<KeyboardEventHandler
				handleKeys={['up', 'down', 'f1', 'f2']}
				onKeyEvent={(key) => handleKeyPress(key)}
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
								onChange={(event) => {
									debounceSearched(event.target.value.trim());
								}}
								autoFocus={false}
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
								<TableNormal
									columns={columnsRight}
									data={inputtedProducts}
									displayInPage
								/>
							</Col>
						</Row>

						<div className="btn-fulfill-container">
							<Divider className="divider" dashed />

							<Button
								classNames="btn-fulfill"
								text="Fulfill"
								variant="primary"
								onClick={onFulfill}
								disabled={
									preparationSlip?.status === preparationSlipStatus.COMPLETED
								}
							/>
						</div>
					</Box>

					<FulfillSlipModal
						preparationSlipProduct={selectedProduct}
						otherProducts={allProducts}
						updatePreparationSlipsByFetching={fetchPreparationSlip}
						visible={fulfillPreparationSlipVisible}
						onClose={() => setFulfillPreparationSlipVisible(false)}
					/>
				</section>
			</KeyboardEventHandler>
		</Container>
	);
};

export default PreparationSlips;
