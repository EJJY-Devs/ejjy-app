/* eslint-disable react-hooks/exhaustive-deps */
import { Pagination } from 'antd';
import React, { useEffect, useState } from 'react';
import { TableHeader, TableNormal } from '../../../../components';
import { ButtonLink, FieldError, FieldWarning } from '../../../../components/elements';
import { EMPTY_CELL } from '../../../../global/constants';
import { request } from '../../../../global/types';
import { useTransactions } from '../../../../hooks/useTransactions';
import { getTransactionStatus, numberWithCommas } from '../../../../utils/function';
import { ViewTransactionModal } from './ViewTransactionModal';

interface Props {
	branchId: any;
}

const PAGE_SIZE = 5;

const columns = [{ name: 'ID' }, { name: 'Invoice' }, { name: 'Amount' }, { name: 'Status' }];

export const ViewBranchTransactions = ({ branchId }: Props) => {
	// STATES
	const [tableData, setTableData] = useState([]);
	const [viewTransactionModalVisible, setViewTransactionModalVisible] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState(null);

	// CUSTOM HOOKS
	const {
		transactions,
		pageCount,
		currentPage,

		listTransactions,
		status,
		errors,
		warnings,
	} = useTransactions({
		pageSize: PAGE_SIZE,
	});

	// METHODS
	useEffect(() => {
		listTransactions({ branchId, page: 1 });
	}, []);

	// Effect: Format branch transactions to be rendered in Table
	useEffect(() => {
		const formattedBranchTransactions = transactions.map((branchTransaction) => {
			const { id, invoice, total_amount, status } = branchTransaction;

			return [
				{ isHidden: true }, // TODO: For searching functionality (payload)
				<ButtonLink text={id} onClick={() => onView(branchTransaction)} />,
				invoice?.or_number || EMPTY_CELL,
				`₱${numberWithCommas(total_amount?.toFixed(2))}`,
				getTransactionStatus(status),
			];
		});

		setTableData(formattedBranchTransactions);
	}, [transactions]);

	const onView = (transaction) => {
		setSelectedTransaction(transaction);
		setViewTransactionModalVisible(true);
	};

	const onPageChange = (page) => {
		listTransactions({ branchId, page });
	};

	return (
		<>
			{errors.map((error, index) => (
				<FieldError key={index} error={error} />
			))}
			{warnings.map((warning, index) => (
				<FieldWarning key={index} error={warning} />
			))}

			<TableHeader title="Transactions" />

			<TableNormal columns={columns} data={tableData} loading={status === request.REQUESTING} />

			<Pagination
				className="table-pagination"
				current={currentPage}
				total={pageCount}
				pageSize={PAGE_SIZE}
				onChange={onPageChange}
				disabled={!tableData}
			/>

			<ViewTransactionModal
				transaction={selectedTransaction}
				visible={viewTransactionModalVisible}
				onClose={() => setViewTransactionModalVisible(false)}
			/>
		</>
	);
};
