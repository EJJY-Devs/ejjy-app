import { Divider, Modal, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons } from 'components/Printing';
import { usePdfPreviewModal } from 'hooks';
import jsPDF from 'jspdf';
import React, { useEffect, useMemo, useState } from 'react';
import { savePdf } from 'utils';
import { printGeneralLedgerTAccounts } from '../printing/printGeneralLedgerTAccounts';
import {
	PDF_WRAPPER_PADDING_PX,
	PDF_WRAPPER_WIDTH_PX,
	renderA4SinglePagePdf,
} from '../printing/renderA4SinglePagePdf';

interface GeneralLedgerDetail {
	id: number;
	debitDate: string;
	debitAmount: string;
	debitRefNum: string;
	debitJournalEntryId?: number;
	creditDate: string;
	creditAmount: string;
	creditRefNum: string;
	creditJournalEntryId?: number;
}

interface GeneralLedgerEntry {
	id: number;
	accountCode: number;
	accountName: string;
	debitAmount: string;
	creditAmount: string;
	entries: GeneralLedgerDetail[];
}

interface BalanceSummary {
	label: string;
	value: string;
	asOf: string;
}

export interface GeneralLedgerBalances {
	beginning: BalanceSummary;
	ending: BalanceSummary;
	totalDebit: string;
	totalCredit: string;
}

interface Props {
	balances: GeneralLedgerBalances | null;
	columns: ColumnsType<GeneralLedgerDetail>;
	entry: GeneralLedgerEntry | null;
	filter?: React.ReactNode;
	loading?: boolean;
	open: boolean;
	onClose: () => void;
}

export const GeneralLedgerModal = ({
	balances,
	columns,
	entry,
	filter,
	loading,
	open,
	onClose,
}: Props) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	useEffect(() => {
		setCurrentPage(1);
	}, [entry?.id, entry?.entries, open]);

	const paginatedEntries = useMemo(() => {
		const allEntries = entry?.entries || [];
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;

		return allEntries.slice(startIndex, endIndex);
	}, [currentPage, entry?.entries, pageSize]);

	const totalEntries = (entry?.entries || []).length;

	const buildPdfHtml = () => {
		const dataHtml = printGeneralLedgerTAccounts({ entry, balances });
		if (!dataHtml) {
			return null;
		}

		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const renderPdf = async (): Promise<jsPDF | null> => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) {
			return null;
		}

		setIsLoadingPdf(true);
		const pdfTitle = `GeneralLedger_${entry?.accountCode || 'TAccounts'}.pdf`;

		try {
			return await renderA4SinglePagePdf({
				html: wrappedHtml,
				title: pdfTitle,
			});
		} catch (error) {
			console.error('Failed to generate PDF', error);
			return null;
		} finally {
			setIsLoadingPdf(false);
		}
	};

	const downloadPdf = async () => {
		const pdf = await renderPdf();
		const pdfTitle = `GeneralLedger_${entry?.accountCode || 'TAccounts'}.pdf`;
		if (pdf) {
			await savePdf(pdf, pdfTitle);
		}
	};

	// Show the generated PDF in an in-app dialog instead of a new tab/window.
	const { showPreview, pdfPreviewModal } = usePdfPreviewModal({
		title: 'View - T Accounts',
		onDownload: downloadPdf,
	});

	const previewPdf = async () => {
		const pdf = await renderPdf();
		if (!pdf) {
			return;
		}
		showPreview(pdf.output('bloburl').toString());
	};

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={[
				<PdfButtons
					key="pdf"
					downloadPdf={downloadPdf}
					isDisabled={isLoadingPdf}
					isLoading={isLoadingPdf}
					previewPdf={previewPdf}
				/>,
			]}
			open={open}
			title="View - T Accounts"
			destroyOnClose
			onCancel={onClose}
		>
			{pdfPreviewModal}
			<h2 className="BooksOfAccounts_tAccountTitle">
				{entry
					? `${entry.accountCode} - ${entry.accountName.toUpperCase()}`
					: '-'}
			</h2>
			{filter && <div className="BooksOfAccounts_tAccountFilter">{filter}</div>}
			{balances && (
				<div className="BooksOfAccounts_tAccountBeginning">
					Beginning Balance (as of {balances.beginning.asOf}):{' '}
					{balances.beginning.label} - {balances.beginning.value}
				</div>
			)}
			<Table
				columns={columns}
				dataSource={paginatedEntries}
				loading={loading}
				pagination={false}
				rowKey="id"
				summary={() =>
					balances && (
						<Table.Summary.Row className="BooksOfAccounts_tAccountTotals">
							<Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
							<Table.Summary.Cell align="right" index={1}>
								{balances.totalDebit}
							</Table.Summary.Cell>
							<Table.Summary.Cell colSpan={2} index={2} />
							<Table.Summary.Cell index={4}>Total</Table.Summary.Cell>
							<Table.Summary.Cell align="right" index={5}>
								{balances.totalCredit}
							</Table.Summary.Cell>
							<Table.Summary.Cell index={6} />
						</Table.Summary.Row>
					)
				}
				bordered
			/>

			<Divider />
			{totalEntries > pageSize && (
				<Pagination
					className="mt-20 text-center"
					current={currentPage}
					pageSize={pageSize}
					total={totalEntries}
					showSizeChanger
					onChange={(page, size) => {
						setCurrentPage(page);
						setPageSize(size);
					}}
				/>
			)}
			{balances && (
				<>
					<div className="BooksOfAccounts_tAccountSummaryLabel">
						Ending Balance (as of {balances.ending.asOf})
					</div>
					<div className="BooksOfAccounts_tAccountSummary">
						{balances.ending.label} - {balances.ending.value}
					</div>
				</>
			)}
		</Modal>
	);
};
