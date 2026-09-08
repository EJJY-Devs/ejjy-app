import { Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons } from 'components/Printing';
import { usePdfPreviewModal } from 'hooks';
import jsPDF from 'jspdf';
import React, { useMemo, useState } from 'react';
import { formatInPeso, savePdf } from 'utils';
import { printTrialBalance } from '../printing/printTrialBalance';
import {
	PDF_WRAPPER_PADDING_PX,
	PDF_WRAPPER_WIDTH_PX,
	renderA4SinglePagePdf,
} from '../printing/renderA4SinglePagePdf';

interface TrialBalanceDetail {
	id: number;
	accountCode?: string;
	accountName: string;
	debitAmount: string;
	creditAmount: string;
	isBalanceRow?: boolean;
}

interface TrialBalanceEntry {
	referenceNumber: string;
	snapshotDate: string;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	entries: TrialBalanceDetail[];
}

interface Props {
	entry: TrialBalanceEntry | null;
	open: boolean;
	onClose: () => void;
}

export const TrialBalanceModal = ({ entry, open, onClose }: Props) => {
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const parseAmount = (value: string) =>
		Number(String(value || '').replace(/[^0-9.-]+/g, '')) || 0;

	const formatAmount = (value: number) => formatInPeso(value, '₱ ');

	const totals = useMemo(() => {
		const sourceRows = (entry?.entries || []).filter(
			(row) => !row.isBalanceRow,
		);

		return sourceRows.reduce(
			(acc, current) => ({
				debit: acc.debit + parseAmount(current.debitAmount),
				credit: acc.credit + parseAmount(current.creditAmount),
			}),
			{ debit: 0, credit: 0 },
		);
	}, [entry]);

	const tableRows = useMemo(() => {
		const sourceRows = entry?.entries || [];
		return [
			...sourceRows,
			{
				id: 999999,
				accountName: 'BALANCES',
				debitAmount: formatAmount(totals.debit),
				creditAmount: formatAmount(totals.credit),
				isBalanceRow: true,
			},
		];
	}, [entry?.entries, totals.credit, totals.debit]);

	const columns: ColumnsType<TrialBalanceDetail> = [
		{
			title: '',
			dataIndex: 'accountCode',
			key: 'accountCode',
			width: 60,
			render: (value: string, record: TrialBalanceDetail) =>
				record.isBalanceRow ? '' : value || '',
		},
		{
			title: 'Account',
			dataIndex: 'accountName',
			key: 'accountName',
			render: (value: string, record: TrialBalanceDetail) =>
				record.isBalanceRow ? <strong>{value}</strong> : value,
		},
		{
			title: 'Debit',
			dataIndex: 'debitAmount',
			key: 'debitAmount',
			align: 'right',
			width: 120,
			render: (value: string, record: TrialBalanceDetail) =>
				record.isBalanceRow ? <strong>{value}</strong> : value,
		},
		{
			title: 'Credit',
			dataIndex: 'creditAmount',
			key: 'creditAmount',
			align: 'right',
			width: 120,
			render: (value: string, record: TrialBalanceDetail) =>
				record.isBalanceRow ? <strong>{value}</strong> : value,
		},
	];

	const printableEntry = useMemo(
		() => ({
			referenceNumber: entry?.referenceNumber || '',
			snapshotDate: entry?.snapshotDate || '',
			storeName: entry?.storeName || '',
			storeAddress: entry?.storeAddress || '',
			branchName: entry?.branchName || '',
			storeTin: entry?.storeTin || '',
			entries: tableRows.map((row) => ({
				accountCode: row.accountCode || '',
				accountName: row.accountName,
				debitAmount: row.debitAmount,
				creditAmount: row.creditAmount,
			})),
		}),
		[
			entry?.referenceNumber,
			entry?.snapshotDate,
			entry?.storeAddress,
			entry?.storeName,
			entry?.branchName,
			entry?.storeTin,
			tableRows,
		],
	);

	const buildPdfHtml = () => {
		const dataHtml = printTrialBalance({ entry: printableEntry });
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
		const pdfTitle = `TrialBalance_${entry?.referenceNumber || 'Detail'}.pdf`;

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
		const pdfTitle = `TrialBalance_${entry?.referenceNumber || 'Detail'}.pdf`;
		if (pdf) {
			await savePdf(pdf, pdfTitle);
		}
	};

	// Show the generated PDF in an in-app dialog instead of a new tab/window.
	const { showPreview, pdfPreviewModal } = usePdfPreviewModal({
		title: `View - ${entry?.referenceNumber || '-'}`,
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
			className="Modal__hasFooter"
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
			title={`View - ${entry?.referenceNumber || '-'}`}
			width={500}
			centered
			closable
			destroyOnClose
			onCancel={onClose}
		>
			{pdfPreviewModal}
			<div className="TrialBalanceModal_header">
				<div>{entry?.storeName || '-'}</div>
				<div>{entry?.storeAddress || '-'}</div>
				<div>{entry?.branchName || '-'}</div>
				<div>{entry?.storeTin || '-'}</div>
			</div>
			<div className="TrialBalanceModal_titleBlock">
				<div className="TrialBalanceModal_title">TRIAL BALANCE</div>
				<div className="TrialBalanceModal_asOf">
					AS OF {entry?.snapshotDate || '-'}
				</div>
			</div>
			<Table
				className="TrialBalanceModal_table mt-6"
				columns={columns}
				dataSource={tableRows}
				pagination={false}
				rowKey="id"
				size="small"
				bordered
			/>
		</Modal>
	);
};
