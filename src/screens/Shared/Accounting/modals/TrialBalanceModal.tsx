import { Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import robotoRegularTtf from 'assets/fonts/Roboto-Regular.ttf';
import { PdfButtons } from 'components/Printing';
import jsPDF from 'jspdf';
import React, { useMemo, useState } from 'react';
import { formatInPeso } from 'utils';
import { printTrialBalance } from '../printing/printTrialBalance';

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

	const renderPdf = (onReady: (instance: jsPDF) => void) => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) {
			return;
		}

		setIsLoadingPdf(true);
		const pdfTitle = `TrialBalance_${entry?.referenceNumber || 'Detail'}.pdf`;

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
			const pdfTitle = `TrialBalance_${entry?.referenceNumber || 'Detail'}.pdf`;
			instance.save(pdfTitle);
		});
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
