import { Divider, Modal, Pagination, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import robotoRegularTtf from 'assets/fonts/Roboto-Regular.ttf';
import { PdfButtons } from 'components/Printing';
import jsPDF from 'jspdf';
import React, { useEffect, useMemo, useState } from 'react';
import { printGeneralLedgerTAccounts } from '../printing/printGeneralLedgerTAccounts';

const TIMEOUT_MS = 2000;
const PDF_WRAPPER_WIDTH_PX = 1120;
const PDF_WRAPPER_PADDING_PX = 24;
const PDF_PAGE_WIDTH_PX = 1225;
const PDF_PAGE_HEIGHT_PX = 1400;
const PDF_RENDER_X_PX = Math.max(
	0,
	Math.floor((PDF_PAGE_WIDTH_PX - PDF_WRAPPER_WIDTH_PX) / 2),
);

let robotoRegularBase64: string | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const chunkSize = 0x8000;

	for (let i = 0; i < bytes.length; i += chunkSize) {
		const end = Math.min(i + chunkSize, bytes.length);
		let chunk = '';

		for (let j = i; j < end; j += 1) {
			chunk += String.fromCharCode(bytes[j]);
		}

		binary += chunk;
	}

	return window.btoa(binary);
};

const ensureRobotoFont = async (pdf: jsPDF) => {
	try {
		if (!robotoRegularBase64) {
			const response = await fetch(robotoRegularTtf);
			const buffer = await response.arrayBuffer();
			robotoRegularBase64 = arrayBufferToBase64(buffer);
		}

		if (robotoRegularBase64) {
			pdf.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64);
			pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
			pdf.setFont('Roboto', 'normal');
		}
	} catch (error) {
		// If font loading fails, jsPDF will use its default font.
	}
};

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
	accountCode: string;
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

	const renderPdf = (onReady: (instance: jsPDF) => void) => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) {
			return;
		}

		setIsLoadingPdf(true);
		const pdfTitle = `GeneralLedger_${entry?.accountCode || 'TAccounts'}.pdf`;

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({
			orientation: 'p',
			unit: 'px',
			format: [PDF_PAGE_WIDTH_PX, PDF_PAGE_HEIGHT_PX],
			putOnlyUsedFonts: true,
		});
		pdf.setProperties({ title: pdfTitle });

		setTimeout(() => {
			(async () => {
				await ensureRobotoFont(pdf);

				pdf.html(wrappedHtml, {
					x: PDF_RENDER_X_PX,
					y: 10,
					margin: 0,
					callback: (instance) => {
						onReady(instance);
						setIsLoadingPdf(false);
					},
				});
			})().catch(() => {
				setIsLoadingPdf(false);
			});
		}, TIMEOUT_MS);
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
