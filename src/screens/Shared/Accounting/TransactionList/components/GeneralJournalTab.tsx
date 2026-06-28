import React from 'react';
import { TransactionTab } from './TransactionTab';

interface Props {
	isHeadOffice: boolean;
}

export const GeneralJournalTab = ({ isHeadOffice }: Props) => (
	<TransactionTab isHeadOffice={isHeadOffice} type="general_journal" />
);
