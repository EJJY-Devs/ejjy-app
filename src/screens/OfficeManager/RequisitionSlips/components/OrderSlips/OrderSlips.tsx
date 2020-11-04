/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { TableHeaderOrderSlip } from '../../../../../components';
import { Box } from '../../../../../components/elements';
import { selectors as branchesSelectors } from '../../../../../ducks/OfficeManager/branches';
import { types as orderSlipsTypes } from '../../../../../ducks/order-slips';
import {
	actions as prActions,
	selectors as prSelectors,
	types as prTypes,
} from '../../../../../ducks/requisition-slips';
import {
	requisitionSlipActions,
	requisitionSlipProductStatus,
	quantityTypes,
	request,
} from '../../../../../global/types';
import { useActionDispatch } from '../../../../../hooks/useActionDispatch';
import { useRequisitionSlips } from '../../../../../hooks/useRequisitionSlips';
import { convertToBulk } from '../../../../../utils/function';
import { useDeliveryReceipt } from '../../../hooks/useDeliveryReceipt';
import { useOrderSlips } from '../../../hooks/useOrderSlips';
import { CreateEditOrderSlipModal } from './CreateEditOrderSlipModal';
import { OrderSlipsTable } from './OrderSlipsTable';
import { SetOutOfStockModal } from './SetOutOfStockModal';
import { ViewOrderSlipModal } from './ViewOrderSlipModal';

interface Props {
	requisitionSlipId: number;
	fetchRequisitionSlip: any;
}

export const OrderSlips = ({ fetchRequisitionSlip, requisitionSlipId }: Props) => {
	// State: Selection
	const [selectedBranchId, setSelectedBranchId] = useState(null);
	const [selectedOrderSlip, setSelectedOrderSlip] = useState(null);

	// State: Table Data
	const [requisitionSlipProducts, setRequisitionSlipProducts] = useState([]);

	// State: Modal
	const [viewOrderSlipVisible, setViewOrderSlipVisible] = useState(false);
	const [createEditOrderSlipVisible, setCreateEditOrderSlipVisible] = useState(false);
	const [createOutOfStockSlipVisible, setCreateOutOfStockVisible] = useState(false);

	const branches = useSelector(branchesSelectors.selectBranches());

	const {
		getRequisitionSlipsByIdAndBranch,
		status: requisitionSlipStatus,
		recentRequest: requisitionSlipRecentRequest,
	} = useRequisitionSlips();

	const { createDeliveryReceipt, status: deliveryReceiptStatus } = useDeliveryReceipt();

	const {
		orderSlips,
		getOrderSlipsExtended,
		status: orderSlipStatus,
		recentRequest: orderSlipRecentRequest,
	} = useOrderSlips();

	const requisitionSlip = useSelector(prSelectors.selectRequisitionSlip());
	const requisitionSlipsByBranch = useSelector(prSelectors.selectRequisitionSlipsByBranch());
	const setRequisitionSlipAction = useActionDispatch(prActions.setRequisitionSlipAction);

	// Effect: Fetch order slips
	useEffect(() => {
		if (requisitionSlipId) {
			getOrderSlipsExtended(requisitionSlipId);
		}
	}, [requisitionSlipId]);

	// Effect: Format requested products in Create/Edit Order Slip form
	useEffect(() => {
		if (
			selectedBranchId &&
			requisitionSlipStatus === request.SUCCESS &&
			requisitionSlipRecentRequest === prTypes.GET_REQUISITION_SLIP_BY_ID_AND_BRANCH
		) {
			processOrderSlip(requisitionSlipsByBranch?.[selectedBranchId], selectedOrderSlip);
		}
	}, [
		selectedBranchId,
		selectedOrderSlip,
		requisitionSlipsByBranch,
		requisitionSlipStatus,
		requisitionSlipRecentRequest,
	]);

	// Effect: Update requisition slip status if status is "New/Seen" after creating order slip
	useEffect(() => {
		if (
			orderSlipStatus === request.SUCCESS &&
			orderSlipRecentRequest === orderSlipsTypes.CREATE_ORDER_SLIP
		) {
			const actionRequiresUpdate = [requisitionSlipActions.NEW, requisitionSlipActions.SEEN];
			if (actionRequiresUpdate.includes(requisitionSlip?.action?.action)) {
				setRequisitionSlipAction({ action: requisitionSlipActions.F_OS1_CREATED });
			}
		}
	}, [orderSlipStatus, orderSlipRecentRequest]);

	const getFirstBranchOptionId = useCallback(
		() => branches.find((branch) => branch.id !== requisitionSlip?.requesting_user?.branch?.id)?.id,
		[branches, requisitionSlip],
	);

	const hasAvailableProducts = useCallback(
		() =>
			!!requisitionSlip?.products?.filter(
				({ is_out_of_stock, status }) =>
					status === requisitionSlipProductStatus.NOT_ADDED_TO_OS && !is_out_of_stock,
			).length,
		[requisitionSlip],
	);

	const processOrderSlip = (branchData, orderSlip = null) => {
		if (branchData) {
			let requestedProducts = [];

			if (selectedOrderSlip) {
				const findBranchBalance = (productId) =>
					branchData.products.find(({ product }) => product?.product_id === productId)
						?.branch_balance;

				const findRequisitionSlipProduct = (productId) =>
					orderSlip.requisition_slip.products.find(({ product_id }) => product_id === productId);

				requestedProducts = orderSlip.products.map((product) => {
					const { id: productId } = product.product;

					return processedOrderSlipProduct(
						product.id,
						product.product,
						findBranchBalance(productId),
						product.quantity_piece,
						findRequisitionSlipProduct(productId).quantity_piece,
						product.assigned_person?.id,
					);
				});
			} else {
				requestedProducts = branchData.products
					.filter(
						({ product, status }) =>
							status === requisitionSlipProductStatus.NOT_ADDED_TO_OS && !product.is_out_of_stock,
					)
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

			setRequisitionSlipProducts(requestedProducts);
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
		getRequisitionSlipsByIdAndBranch(requisitionSlip.id, branchId);
	};

	const onCreateOrderSlip = () => {
		setSelectedOrderSlip(null);
		onChangePreparingBranch(getFirstBranchOptionId());
		setCreateEditOrderSlipVisible(true);
	};

	const onCreateOutOfStock = () => {
		setSelectedOrderSlip(null);
		setCreateOutOfStockVisible(true);
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
			<TableHeaderOrderSlip
				title="F-OS1"
				buttonName="Create Order Slip"
				onCreate={onCreateOrderSlip}
				onCreateDisabled={
					![requisitionSlipActions.SEEN, requisitionSlipActions.F_OS1_CREATING].includes(
						requisitionSlip?.action?.action,
					) || !hasAvailableProducts()
				}
				onOutOfStock={onCreateOutOfStock}
				onOutOfStockDisabled={!hasAvailableProducts()}
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
				updateRequisitionSlipByFetching={fetchRequisitionSlip}
				requisitionSlip={requisitionSlip}
				orderSlip={selectedOrderSlip}
				selectedBranchId={selectedBranchId}
				requestedProducts={requisitionSlipProducts}
				onChangePreparingBranch={onChangePreparingBranch}
				visible={createEditOrderSlipVisible}
				onClose={() => setCreateEditOrderSlipVisible(false)}
			/>

			<SetOutOfStockModal
				updateRequisitionSlipByFetching={fetchRequisitionSlip}
				requisitionSlipId={requisitionSlip?.id}
				visible={createOutOfStockSlipVisible}
				onClose={() => setCreateOutOfStockVisible(false)}
			/>
		</Box>
	);
};
