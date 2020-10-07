/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableHeader } from '../../../../../components';
import { Box } from '../../../../../components/elements';
import { selectors as branchesSelectors } from '../../../../../ducks/OfficeManager/branches';
import { types as orderSlipsTypes } from '../../../../../ducks/order-slips';
import {
	actions as prActions,
	selectors as prSelectors,
	types as prTypes,
} from '../../../../../ducks/purchase-requests';
import {
	purchaseRequestActions,
	purchaseRequestProductStatus,
	quantityTypes,
	request,
} from '../../../../../global/types';
import { useActionDispatch } from '../../../../../hooks/useActionDispatch';
import { usePurchaseRequests } from '../../../../../hooks/usePurchaseRequests';
import { convertToBulk } from '../../../../../utils/function';
import { useDeliveryReceipt } from '../../../hooks/useDeliveryReceipt';
import { useOrderSlips } from '../../../hooks/useOrderSlips';
import { CreateEditOrderSlipModal } from './CreateEditOrderSlipModal';
import { OrderSlipsTable } from './OrderSlipsTable';
import { ViewOrderSlipModal } from './ViewOrderSlipModal';

interface Props {
	purchaseRequestId: number;
}

export const OrderSlips = ({ purchaseRequestId }: Props) => {
	// State: Selection
	const [selectedBranchId, setSelectedBranchId] = useState(null);
	const [selectedOrderSlip, setSelectedOrderSlip] = useState(null);

	// State: Table Data
	const [purchaseRequestProducts, setPurchaseRequestProducts] = useState([]);

	// State: Modal
	const [viewOrderSlipVisible, setViewOrderSlipVisible] = useState(false);
	const [createEditOrderSlipVisible, setCreateEditOrderSlipVisible] = useState(false);

	const branches = useSelector(branchesSelectors.selectBranches());

	const {
		getPurchaseRequestsByIdAndBranch,
		status: purchaseRequestStatus,
		recentRequest: purchaseRequestRecentRequest,
	} = usePurchaseRequests();

	const { createDeliveryReceipt, status: deliveryReceiptStatus } = useDeliveryReceipt();

	const {
		orderSlips,
		getOrderSlipsExtended,
		status: orderSlipStatus,
		recentRequest: orderSlipRecentRequest,
	} = useOrderSlips();

	const purchaseRequest = useSelector(prSelectors.selectPurchaseRequest());
	const purchaseRequestsByBranch = useSelector(prSelectors.selectPurchaseRequestsByBranch());
	const setPurchaseRequestAction = useActionDispatch(prActions.setPurchaseRequestAction);

	// Effect: Fetch purchase request
	useEffect(() => {
		if (purchaseRequestId) {
			getOrderSlipsExtended(purchaseRequestId);
		}
	}, [purchaseRequestId]);

	// Effect: Format requested products in Create/Edit Order Slip form
	useEffect(() => {
		if (
			selectedBranchId &&
			purchaseRequestStatus === request.SUCCESS &&
			purchaseRequestRecentRequest === prTypes.GET_PURCHASE_REQUEST_BY_ID_AND_BRANCH
		) {
			processOrderSlip(purchaseRequestsByBranch?.[selectedBranchId], selectedOrderSlip);
		}
	}, [
		selectedBranchId,
		selectedOrderSlip,
		purchaseRequestsByBranch,
		purchaseRequestStatus,
		purchaseRequestRecentRequest,
	]);

	// Effect: Update purchase request status if status is "New/Seen" after creating order slip
	useEffect(() => {
		if (
			orderSlipStatus === request.SUCCESS &&
			orderSlipRecentRequest === orderSlipsTypes.CREATE_ORDER_SLIP
		) {
			const actionRequiresUpdate = [purchaseRequestActions.NEW, purchaseRequestActions.SEEN];
			if (actionRequiresUpdate.includes(purchaseRequest?.action?.action)) {
				setPurchaseRequestAction({ action: purchaseRequestActions.F_OS1_CREATED });
			}
		}
	}, [orderSlipStatus, orderSlipRecentRequest]);

	const getFirstBranchOptionId = useCallback(
		() => branches.find((branch) => branch.id !== purchaseRequest?.requesting_user?.branch?.id)?.id,
		[branches, purchaseRequest],
	);

	const processOrderSlip = (branchData, orderSlip = null) => {
		if (branchData) {
			let requestedProducts = [];

			if (selectedOrderSlip) {
				const findBranchBalance = (productId) =>
					branchData.products.find(({ product }) => product?.product_id === productId)
						?.branch_balance;

				const findPurchaseRequestProduct = (productId) =>
					orderSlip.purchase_request.products.find(({ product_id }) => product_id === productId);

				requestedProducts = orderSlip.products.map((product) => {
					const { id: productId } = product.product;

					return processedOrderSlipProduct(
						product.id,
						product.product,
						findBranchBalance(productId),
						product.quantity_piece,
						findPurchaseRequestProduct(productId).quantity_piece,
						product.assigned_person?.id,
					);
				});
			} else {
				requestedProducts = branchData.products
					.filter(({ status }) => status === purchaseRequestProductStatus.NOT_ADDED_TO_OS)
					.map((product) => {
						return processedOrderSlipProduct(
							null,
							product.product.product,
							product.branch_balance,
							'',
							product.product.quantity_piece,
							branchData?.branch_personnels?.[0]?.id,
						);
					});
			}

			setPurchaseRequestProducts(requestedProducts);
		}
	};

	const processedOrderSlipProduct = (
		orderSlipProductId,
		product,
		branchBalance,
		quantityPiece,
		orderedQuantityPiece,
		assignedPersonnel,
	) => {
		const { id: productId, name, barcode, pieces_in_bulk } = product;
		const { current = '', max_balance = '' } = branchBalance;

		return {
			order_slip_product_id: orderSlipProductId,
			selected: true,
			product_id: productId,
			product_name: name,
			product_barcode: barcode,
			product_pieces_in_bulk: pieces_in_bulk,
			quantity: quantityPiece,
			ordered_quantity_piece: orderedQuantityPiece,
			ordered_quantity_bulk: convertToBulk(orderedQuantityPiece, pieces_in_bulk),
			quantity_type: quantityTypes.PIECE,
			branch_current: current,
			branch_max_balance: max_balance,
			branch_current_bulk: convertToBulk(current, pieces_in_bulk),
			branch_max_balance_bulk: convertToBulk(max_balance, pieces_in_bulk),
			assigned_personnel: assignedPersonnel,
		};
	};

	const onChangePreparingBranch = (branchId) => {
		setSelectedBranchId(branchId);
		getPurchaseRequestsByIdAndBranch(purchaseRequest.id, branchId);
	};

	const onCreateOrderSlip = () => {
		setSelectedOrderSlip(null);
		onChangePreparingBranch(getFirstBranchOptionId());
		setCreateEditOrderSlipVisible(true);
	};

	const onViewOrderSlip = (orderSlip) => {
		setSelectedOrderSlip(orderSlip);
		setViewOrderSlipVisible(true);
	};

	const onEditOrderSlip = (orderSlip) => {
		onChangePreparingBranch(orderSlip?.assigned_store?.id);
		setSelectedOrderSlip(orderSlip);
		setCreateEditOrderSlipVisible(true);
	};

	const onCreateDeliveryReceipt = (id) => {
		createDeliveryReceipt(id);
	};

	return (
		<Box>
			<TableHeader
				title="F-OS1"
				buttonName="Create Order Slip"
				onCreate={onCreateOrderSlip}
				onCreateDisabled={
					![purchaseRequestActions.SEEN, purchaseRequestActions.F_OS1_CREATING].includes(
						purchaseRequest?.action?.action,
					)
				}
			/>

			<OrderSlipsTable
				orderSlips={orderSlips}
				onViewOrderSlip={onViewOrderSlip}
				onEditOrderSlip={onEditOrderSlip}
				onCreateDeliveryReceipt={onCreateDeliveryReceipt}
				loading={
					deliveryReceiptStatus === request.REQUESTING || orderSlipStatus === request.REQUESTING
				}
			/>

			<ViewOrderSlipModal
				visible={viewOrderSlipVisible}
				orderSlip={selectedOrderSlip}
				onClose={() => setViewOrderSlipVisible(false)}
			/>

			<CreateEditOrderSlipModal
				purchaseRequest={purchaseRequest}
				orderSlip={selectedOrderSlip}
				selectedBranchId={selectedBranchId}
				requestedProducts={purchaseRequestProducts}
				onChangePreparingBranch={onChangePreparingBranch}
				visible={createEditOrderSlipVisible}
				onClose={() => setCreateEditOrderSlipVisible(false)}
			/>
		</Box>
	);
};
