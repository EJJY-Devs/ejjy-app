import React from 'react';
import { TransactionTab } from './TransactionTab';

interface Props {
	isHeadOffice: boolean;
}

export const ExpensesTab = ({ isHeadOffice }: Props) => (
	<TransactionTab isHeadOffice={isHeadOffice} type="expense" />
);
