/* eslint-disable no-underscore-dangle */
import { Content, ViewBackOrderModal } from 'components';
import { Box } from 'components/elements';
import { ViewTransactionModal } from 'ejjy-global';
import { useSiteSettingsNew } from 'hooks';
import React, { useRef, useState } from 'react';
import { BackOrdersTable } from './components/BackOrdersTable';
import { FulfillBackOrderModal } from './components/FulfillBackOrderModal';
import './style.scss';

const modals = {
	VIEW: 0,
	FULFILL: 1,
};

export const BackOrders = () => {
	// STATES
	const [selectedBackOrder, setSelectedBackOrder] = useState(null);
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [modalType, setModalType] = useState(null);

	// REFS
	const backOrdersReceiveRef = useRef(null);

	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettingsNew();

	// METHODS
	const handleOpenModal = (backOrder, type) => {
		setModalType(type);
		setSelectedBackOrder(backOrder);
	};

	return (
		<Content className="BackOrders" title="Back Orders">
			<Box>
				<BackOrdersTable
					onSelectBackOrder={(backOrder) => {
						handleOpenModal(backOrder, modals.VIEW);
					}}
					onSelectTransaction={setSelectedTransaction}
				/>

				{/* <BackOrdersSent
					selectBackOrder={(backOrder) => {
						onOpenModal(backOrder, modals.VIEW);
					}}
				/> */}

				{/* {user?.branch?.id !== MAIN_BRANCH_ID && (
					// NOTE: Only managers not from Main branch can create back order
					// NOTE: Temporarily commented out since we cannot create BO as of the moment
					<TableHeader
						buttonName="Create Back Order"
						onCreate={() => history.push('/branch-manager/back-orders/create')}
					/>
				)} */}

				{/*
				// NOTE: Temporarily commented out since we cannot create BO as of the moment
				{user?.branch?.id !== MAIN_BRANCH_ID ? (
					// NOTE: Only managers not from Main branch can create back order
					<BackOrdersSent
						selectBackOrder={(backOrder) => {
							onOpenModal(backOrder, modals.VIEW);
						}}
					/>
				) : (
					// NOTE: Only managers from Main branch can receive back orders
					<BackOrdersReceive
						ref={backOrdersReceiveRef}
						selectBackOrder={(backOrder) => {
							onOpenModal(backOrder, modals.VIEW);
						}}
						onFulfill={(backOrder) => {
							onOpenModal(backOrder, modals.FULFILL);
						}}
					/>
				)}
				*/}

				{selectedTransaction && (
					<ViewTransactionModal
						siteSettings={siteSettings}
						transaction={selectedTransaction}
						onClose={() => setSelectedTransaction(null)}
					/>
				)}

				{modalType === modals.VIEW && selectedBackOrder && (
					<ViewBackOrderModal
						backOrder={selectedBackOrder}
						onClose={() => handleOpenModal(null, null)}
					/>
				)}

				{modalType === modals.FULFILL && selectedBackOrder && (
					<FulfillBackOrderModal
						backOrder={selectedBackOrder}
						onClose={() => handleOpenModal(null, null)}
						onSuccess={() => backOrdersReceiveRef.current?.refreshList()}
					/>
				)}
			</Box>
		</Content>
	);
};
