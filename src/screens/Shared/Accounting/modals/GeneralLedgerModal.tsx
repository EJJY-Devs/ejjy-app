import { Divider, Modal, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons } from 'components/Printing';
import jsPDF from 'jspdf';
import React, { useEffect, useMemo, useState } from 'react';
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

interface Props {
	columns: ColumnsType<GeneralLedgerDetail>;
	entry: GeneralLedgerEntry | null;
	open: boolean;
	onClose: () => void;
	summary: {
		label: string;
		value: string;
	};
}

export const GeneralLedgerModal = ({
	columns,
	entry,
	open,
	onClose,
	summary,
}: Props) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	useEffect(() => {
		setCurrentPage(1);
	}, [entry?.id, open]);

	const paginatedEntries = useMemo(() => {
		const allEntries = entry?.entries || [];
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;

		return allEntries.slice(startIndex, endIndex);
	}, [currentPage, entry?.entries, pageSize]);

	const totalEntries = (entry?.entries || []).length;

	const buildPdfHtml = () => {
		const dataHtml = printGeneralLedgerTAccounts({ entry, summary });
		if (!dataHtml) {
			return null;
		}

		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const renderPdf = async (onReady: (instance: jsPDF) => void) => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) {
			return;
		}

		setIsLoadingPdf(true);
		const pdfTitle = `GeneralLedger_${entry?.accountCode || 'TAccounts'}.pdf`;

		try {
			const pdf = await renderA4SinglePagePdf({
				html: wrappedHtml,
				title: pdfTitle,
			});
			onReady(pdf);
		} finally {
			setIsLoadingPdf(false);
		}
	};

	const previewPdf = () => {
		renderPdf((instance) => {
			window.open(instance.output('bloburl').toString());
		});
	};

	const downloadPdf = () => {
		renderPdf((instance) => {
			const pdfTitle = `GeneralLedger_${entry?.accountCode || 'TAccounts'}.pdf`;
			instance.save(pdfTitle);
		});
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
			<h2 className="BooksOfAccounts_tAccountTitle">
				{entry
					? `${entry.accountCode} - ${entry.accountName.toUpperCase()}`
					: '-'}
			</h2>
			<Table
				columns={columns}
				dataSource={paginatedEntries}
				pagination={false}
				rowKey="id"
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
			<div className="BooksOfAccounts_tAccountSummary">
				{summary.label} - {summary.value}
			</div>
		</Modal>
	);
};
