import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { convertToBulk, formatQuantity } from 'utils';
import { TableHeader } from '../../../../../components';
import { Box } from '../../../../../components/elements';
import { selectors as branchesSelectors } from '../../../../../ducks/OfficeManager/branches';
import { types as orderSlipsTypes } from '../../../../../ducks/order-slips';
import { actions as prActions } from '../../../../../ducks/requisition-slips';
import { MAX_PAGE_SIZE } from '../../../../../global/constants';
import {
	orderSlipStatus,
	quantityTypes,
	request,
	requisitionSlipActions,
	requisitionSlipProductStatus,
} from '../../../../../global/types';
import { useActionDispatch } from '../../../../../hooks/useActionDispatch';
import { useBranchProducts } from '../../../../../hooks/useBranchProducts';
import { useDeliveryReceipt } from '../../../hooks/useDeliveryReceipt';
import { useOrderSlips } from '../../../hooks/useOrderSlips';
import { OrderSlipsTable } from './OrderSlipsTable';
import { SetOutOfStockModal } from './SetOutOfStockModal';
import { ViewOrderSlipModal } from './ViewOrderSlipModal';

interface Props {
	requisitionSlip: any;
	// fetchRequisitionSlip: any;
}

const pendingOrderSlipStatus = [orderSlipStatus.PREPARED];

export const OrderSlips = ({ requisitionSlip }: Props) => {
	// State: Selection
	const [selectedBranchId, setSelectedBranchId] = useState(null);
	const [selectedOrderSlip, setSelectedOrderSlip] = useState(null);

	// State: Table Data
	const [requisitionSlipProducts, setRequisitionSlipProducts] = useState([]);

	// State: Modal
	const [viewOrderSlipVisible, setViewOrderSlipVisible] = useState(false);
	const [createEditOrderSlipVisible, setCreateEditOrderSlipVisible] = useState(
		false,
	);
	const [createOutOfStockVisible, setCreateOutOfStockVisible] = useState(false);

	// CUSTOM HOOKS
	const {
		createDeliveryReceipt,
		status: deliveryReceiptStatus,
	} = useDeliveryReceipt();
	const {
		orderSlips,
		getOrderSlipsExtended,
		status: orderSlipRequestStatus,
		recentRequest: orderSlipRecentRequest,
	} = useOrderSlips();
	const {
		branchProducts,
		getBranchProducts,
		status: branchProductsStatus,
		resetAll: branchProductsReset,
		warnings: branchProductsWarnings,
		errors: branchProducstErrors,
	} = useBranchProducts();
	// const {
	// 	users: branchPersonnels,
	// 	getUsers,
	// 	status: usersStatus,
	// 	warnings: userWarnings,
	// 	errors: userErrors,
	// 	reset: userReset,
	// } = useUsers();

	const branches = useSelector(branchesSelectors.selectBranches());
	const setRequisitionSlipAction = useActionDispatch(
		prActions.setRequisitionSlipAction,
	);

	// METHODS
	// Effect: Fetch order slips
	useEffect(() => {
		if (requisitionSlip) {
			getOrderSlipsExtended(requisitionSlip.id);
		}
	}, [requisitionSlip]);

	// Effect: Format requested products in Create/Edit Order Slip form
	useEffect(() => {
		processOrderSlip(
			requisitionSlip,
			branchProducts,
			// branchPersonnels,
			selectedOrderSlip,
		);
	}, [
		requisitionSlip,
		branchProducts,
		// branchPersonnels,
		selectedBranchId,
		selectedOrderSlip,
	]);

	// Effect: Update requisition slip status if status is "New/Seen" after creating order slip
	useEffect(() => {
		if (
			orderSlipRequestStatus === request.SUCCESS &&
			orderSlipRecentRequest === orderSlipsTypes.CREATE_ORDER_SLIP
		) {
			const actionRequiresUpdate = [
				requisitionSlipActions.NEW,
				requisitionSlipActions.SEEN,
			];
			if (actionRequiresUpdate.includes(requisitionSlip?.action?.action)) {
				setRequisitionSlipAction({
					action: requisitionSlipActions.F_OS1_CREATED,
				});
			}
		}
	}, [orderSlipRequestStatus, orderSlipRecentRequest]);

	const getFirstBranchOptionId = useCallback(
		() =>
			branches.find(
				(branch) => branch.id !== requisitionSlip?.requesting_user?.branch?.id,
			)?.id,
		[branches, requisitionSlip],
	);

	const hasAvailableProducts = useCallback(
		() =>
			requisitionSlip?.products?.some(
				({ is_out_of_stock, status }) =>
					status === requisitionSlipProductStatus.NOT_ADDED_TO_OS &&
					!is_out_of_stock,
			),
		[requisitionSlip],
	);

	const processOrderSlip = (
		reqSlip,
		bProducts,
		bPersonnels,
		orderSlip = null,
	) => {
		let requestedProducts = [];

		if (orderSlip) {
			const findBranchProduct = (productId) =>
				bProducts.find((item) => item.product.id === productId);

			const findRequisitionSlipProduct = (productId) =>
				orderSlip.requisition_slip.products.find(
					({ product_id }) => product_id === productId,
				);

			requestedProducts = orderSlip.products.map((product) => {
				const { id: productId } = product.product;
				const branchProduct = findBranchProduct(productId);

				return processedOrderSlipProduct(
					product.id,
					product.product,
					{
						current: branchProduct?.current_balance,
						max_balance: branchProduct?.max_balance,
					},
					product.quantity_piece,
					findRequisitionSlipProduct(productId).quantity_piece,
					product.assigned_person?.id,
				);
			});
		} else {
			requestedProducts = reqSlip?.products
				?.filter(({ is_out_of_stock, status, product_id }) => {
					// Condition: Not yet added to OS
					// Condition: Not out of stock
					// Condition: Has branch products
					const branchProduct = bProducts.find(
						(item) => item.product.id === product_id,
					);

					return (
						status === requisitionSlipProductStatus.NOT_ADDED_TO_OS &&
						!is_out_of_stock &&
						!!branchProduct
					);
				})
				?.map((product) => {
					const branchProduct = bProducts.find(
						(item) => item.product.id === product.product_id,
					);

					return processedOrderSlipProduct(
						null,
						product.product,
						{
							current: branchProduct.current_balance,
							max_balance: branchProduct.max_balance,
						},
						'',
						product.quantity_piece,
						bPersonnels?.[0]?.id,
					);
				});
		}
		setRequisitionSlipProducts(requestedProducts);
	};

	const processedOrderSlipProduct = (
		orderSlipProductId,
		product,
		branchBalance,
		quantityPiece,
		orderedQuantityPiece,
		assignedPersonnel,
	) => {
		const {
			id: productId,
			name,
			barcode,
			textcode,
			pieces_in_bulk,
			unit_of_measurement,
		} = product;
		const { current = '', max_balance = '' } = branchBalance;

		return {
			order_slip_product_id: orderSlipProductId,
			selected: true,
			product,
			product_id: productId,
			product_name: name,
			product_barcode: barcode,
			product_textcode: textcode,
			product_pieces_in_bulk: pieces_in_bulk,
			quantity: quantityPiece,
			ordered_quantity_piece: formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: orderedQuantityPiece,
			}),
			ordered_quantity_bulk: convertToBulk(
				orderedQuantityPiece,
				pieces_in_bulk,
			),
			quantity_type: quantityTypes.PIECE,
			branch_current: formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: current,
			}),
			branch_max_balance: formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: max_balance,
			}),
			branch_current_bulk: formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: convertToBulk(current, pieces_in_bulk),
			}),
			branch_max_balance_bulk: formatQuantity({
				unitOfMeasurement: unit_of_measurement,
				quantity: convertToBulk(max_balance, pieces_in_bulk),
			}),
			assigned_personnel: assignedPersonnel,
		};
	};

	const handleChangePreparingBranch = (branchId) => {
		if (selectedBranchId !== branchId) {
			setSelectedBranchId(branchId);
			// userReset();
			branchProductsReset();

			// TODO: Requires refactoring once this feature is revisited
			// getUsers(
			// 	{
			// 		page: 1,
			// 		pageSize: MAX_PAGE_SIZE,
			// 		branchId,
			// 		userType: userTypes.BRANCH_PERSONNEL,
			// 	},
			// 	true,
			// );

			const productIds = requisitionSlip.products
				.map(({ product_id }) => product_id)
				.join(',');

			getBranchProducts(
				{ page: 1, pageSize: MAX_PAGE_SIZE, productIds, branchId },
				true,
			);
		}
	};

	const handleCreateOrderSlip = () => {
		setSelectedOrderSlip(null);
		handleChangePreparingBranch(getFirstBranchOptionId());
		setCreateEditOrderSlipVisible(true);
	};

	const handleCreateOutOfStock = () => {
		setSelectedOrderSlip(null);
		setCreateOutOfStockVisible(true);
	};

	const handleViewOrderSlip = (orderSlip) => {
		setSelectedOrderSlip(orderSlip);
		setViewOrderSlipVisible(true);
	};

	const handleEditOrderSlip = (orderSlip) => {
		handleChangePreparingBranch(orderSlip?.assigned_store?.id);
		setSelectedOrderSlip(orderSlip);
		setCreateEditOrderSlipVisible(true);
	};

	const handleCreateDeliveryReceipt = (id) => {
		createDeliveryReceipt(id);
	};

	const getPendingCount = useCallback(
		() =>
			orderSlips.filter(({ status }) =>
				pendingOrderSlipStatus.includes(status?.value),
			).length,
		[orderSlips],
	);

	return (
		<Box className="px-6">
			<TableHeader title="Linked Transactions" />
			{/* 
			<OrderSlipsTable
				orderSlips={orderSlips}
				orderSlipStatus={orderSlipRequestStatus}
				onReceiveDeliveryReceipt={handleReceiveDeliveryReceipt}
				onViewOrderSlip={handleViewOrderSlip}
			/> */}

			{/* <ViewOrderSlipModal
				orderSlip={selectedOrderSlip}
				visible={viewOrderSlipVisible}
				onClose={() => setViewOrderSlipVisible(false)}
			/> */}

			{/* <ReceiveDeliveryReceiptModal
				orderSlip={selectedOrderSlip}
				orderSlips={orderSlips}
				requisitionSlip={requisitionSlip}
				visible={receiveDeliveryReceiptVisible}
				onClose={() => setReceiveDeliveryReceiptVisible(false)}
				onSuccess={handleReceiveDeliveryReceiptSuccess}
			/> */}
		</Box>
	);
};
