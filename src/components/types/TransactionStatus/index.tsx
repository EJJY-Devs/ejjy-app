import { Tag } from 'antd';
import { paymentTypes, Transaction } from 'ejjy-global';
import { EMPTY_CELL, transactionStatuses } from 'global';
import React from 'react';
import { DELIVERY_INVOICE } from 'utils';

type Props = {
	transaction: Transaction;
};

export const TransactionStatus = ({ transaction }: Props) => {
	const { status, payment, invoice_type } = transaction;

	switch (status) {
		case transactionStatuses.NEW: {
			return <Tag color="yellow">New</Tag>;
		}
		case transactionStatuses.FULLY_PAID: {
			if (
				payment.mode === paymentTypes.CREDIT ||
				invoice_type === DELIVERY_INVOICE
			) {
				return <Tag color="orange">Collectible</Tag>;
			}

			return <Tag color="green">Fully Paid</Tag>;
		}
		case transactionStatuses.HOLD: {
			return <Tag color="yellow">Hold</Tag>;
		}
		case transactionStatuses.VOID_CANCELLED: {
			return <Tag color="red">Cancelled</Tag>;
		}
		case transactionStatuses.VOID_EDITED: {
			return <Tag color="blue">Edited</Tag>;
		}
		default: {
			return <>{EMPTY_CELL}</>;
		}
	}

	return null;
};
