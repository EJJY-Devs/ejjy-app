import { Modal, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { PdfButtons } from 'components/Printing';
import jsPDF from 'jspdf';
import React, { useMemo, useState } from 'react';
import {
	PDF_WRAPPER_PADDING_PX,
	PDF_WRAPPER_WIDTH_PX,
	renderA4SinglePagePdf,
} from '../printing/renderA4SinglePagePdf';

const escapeHtml = (value: string) =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

interface ChangesInEquityRow {
	id: number;
	particulars: string;
	ownersCapital: string;
	retainedEarnings: string;
	totalEquity: string;
	isHeader?: boolean;
	isTotal?: boolean;
	amountBottomBold?: boolean;
	isNegative?: boolean;
}

interface ChangesInEquityEntry {
	snapshotDate: string;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	rows: ChangesInEquityRow[];
}

const buildRowsHtml = (rows: Omit<ChangesInEquityRow, 'id'>[]) =>
	rows
		.map((row) => {
			const rowClassName = [
				row.isHeader ? 'header-row' : '',
				row.isTotal ? 'total-row' : '',
			]
				.filter(Boolean)
				.join(' ');
			const amountClassName = row.amountBottomBold ? 'amount-bottom-bold' : '';
			const ownersCapital = escapeHtml(row.ownersCapital || '');
			const retainedEarnings = escapeHtml(row.retainedEarnings || '');
			const totalEquity = escapeHtml(row.totalEquity || '');

			return `
			<tr class="${rowClassName}">
				<td>${escapeHtml(row.particulars || '')}</td>
				<td class="${amountClassName}" style="text-align: right;">${ownersCapital}</td>
				<td class="${amountClassName}" style="text-align: right;">${retainedEarnings}</td>
				<td class="${amountClassName}" style="text-align: right;">${totalEquity}</td>
			</tr>`;
		})
		.join('');

const printStatementOfChangesInEquity = ({
	entry,
}: {
	entry: ChangesInEquityEntry | null;
}) => {
	if (!entry) {
		return '';
	}

	const rowsHtml = buildRowsHtml(entry.rows || []);

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Statement of Changes in Equity</title>
			<style>
				body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
				.header { margin-bottom: 14px; line-height: 1.35; font-size: 16px; text-align: center; }
				.title { text-align: center; margin-bottom: 14px; }
				.title h1 { margin: 0; font-size: 24px; }
				.title h2 { margin: 4px 0 0; font-size: 20px; font-weight: 600; }
				.table-wrap { width: 780px; max-width: 100%; margin: 0 auto 16px; }
				table { width: 100%; border-collapse: collapse; }
				th, td { border: 1px solid #d9d9d9; padding: 6px 8px; text-align: left; font-size: 13px; }
				th { background: #fafafa; font-weight: 700; }
				th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: right; }
				td:nth-child(2), td:nth-child(3), td:nth-child(4) { width: 160px; text-align: right; }
				.header-row td { font-weight: 700; background: #fafafa; }
				.total-row td { font-weight: 700; }
				.amount-bottom-bold { border-bottom: 2px solid #111; }
			</style>
		</head>
		<body>
			<div class="header">
				<div>${escapeHtml(entry.storeName || '-')}</div>
				<div>${escapeHtml(entry.storeAddress || '-')}</div>
				<div>${escapeHtml(entry.branchName || '-')}</div>
				<div>${escapeHtml(entry.storeTin || '-')}</div>
			</div>
			<div class="title">
				<h1>STATEMENT OF CHANGES IN EQUITY</h1>
				<h2>AS OF ${escapeHtml(entry.snapshotDate || '-')}</h2>
			</div>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Particulars</th>
							<th>Owner's Capital</th>
							<th>Retained Earnings</th>
							<th>Total Equity</th>
						</tr>
					</thead>
					<tbody>
						${rowsHtml}
					</tbody>
				</table>
			</div>
		</body>
		</html>
	`;
};

interface Props {
	entry: ChangesInEquityEntry | null;
	isLoading?: boolean;
	open: boolean;
	onClose: () => void;
}

export const StatementOfChangesInEquityModal = ({
	entry,
	isLoading = false,
	open,
	onClose,
}: Props) => {
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const getCellStyle = (record: ChangesInEquityRow, isAmountColumn = false) => {
		if (record.isHeader) {
			return { fontWeight: 700, background: '#fafafa' };
		}

		if (isAmountColumn && record.amountBottomBold) {
			return { borderBottom: '2px solid #111' };
		}

		return undefined;
	};

	const columns: ColumnsType<ChangesInEquityRow> = useMemo(
		() => [
			{
				title: 'Particulars',
				dataIndex: 'particulars',
				key: 'particulars',
				onCell: (record: ChangesInEquityRow) => ({
					style: getCellStyle(record),
				}),
				render: (value: string, record: ChangesInEquityRow) => {
					if (record.isHeader || record.isTotal)
						return <strong>{value}</strong>;
					return value || '';
				},
			},
			{
				title: "Owner's Capital",
				dataIndex: 'ownersCapital',
				key: 'ownersCapital',
				width: 160,
				align: 'right',
				onCell: (record: ChangesInEquityRow) => ({
					style: getCellStyle(record, true),
				}),
				render: (value: string, record: ChangesInEquityRow) => {
					if (record.isHeader || record.isTotal)
						return <strong>{value}</strong>;
					return value || '';
				},
			},
			{
				title: 'Retained Earnings',
				dataIndex: 'retainedEarnings',
				key: 'retainedEarnings',
				width: 160,
				align: 'right',
				onCell: (record: ChangesInEquityRow) => ({
					style: getCellStyle(record, true),
				}),
				render: (value: string, record: ChangesInEquityRow) => {
					if (record.isHeader || record.isTotal)
						return <strong>{value}</strong>;
					return value || '';
				},
			},
			{
				title: 'Total Equity',
				dataIndex: 'totalEquity',
				key: 'totalEquity',
				width: 160,
				align: 'right',
				onCell: (record: ChangesInEquityRow) => ({
					style: getCellStyle(record, true),
				}),
				render: (value: string, record: ChangesInEquityRow) => {
					if (record.isHeader || record.isTotal)
						return <strong>{value}</strong>;
					return value || '';
				},
			},
		],
		[],
	);

	const printableEntry = useMemo(
		() => ({
			snapshotDate: entry?.snapshotDate || '',
			storeName: entry?.storeName || '',
			storeAddress: entry?.storeAddress || '',
			branchName: entry?.branchName || '',
			storeTin: entry?.storeTin || '',
			rows: (entry?.rows || []).map((r) => ({
				id: r.id,
				particulars: r.particulars,
				ownersCapital: r.ownersCapital,
				retainedEarnings: r.retainedEarnings,
				totalEquity: r.totalEquity,
				isHeader: r.isHeader,
				isTotal: r.isTotal,
				amountBottomBold: r.amountBottomBold,
				isNegative: r.isNegative,
			})),
		}),
		[entry],
	);

	const buildPdfHtml = () => {
		const dataHtml = printStatementOfChangesInEquity({
			entry: printableEntry,
		});
		if (!dataHtml) return null;

		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const renderPdf = async (onReady: (instance: jsPDF) => void) => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) return;

		setIsLoadingPdf(true);
		const pdfTitle = 'StatementOfChangesInEquity.pdf';

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
			instance.save('StatementOfChangesInEquity.pdf');
		});
	};

	return (
		<Modal
			className="Modal__hasFooter"
			footer={[
				<PdfButtons
					key="pdf"
					downloadPdf={downloadPdf}
					isDisabled={isLoading || isLoadingPdf || !entry}
					isLoading={isLoadingPdf}
					previewPdf={previewPdf}
				/>,
			]}
			open={open}
			title="View - Statement of Changes in Equity"
			width={900}
			centered
			closable
			destroyOnClose
			onCancel={onClose}
		>
			<Spin spinning={isLoading}>
				<div className="TrialBalanceModal_header">
					<div>{entry?.storeName || '-'}</div>
					<div>{entry?.storeAddress || '-'}</div>
					<div>{entry?.branchName || '-'}</div>
					<div>{entry?.storeTin || '-'}</div>
				</div>
				<div className="TrialBalanceModal_titleBlock">
					<div className="TrialBalanceModal_title">
						STATEMENT OF CHANGES IN EQUITY
					</div>
					<div className="TrialBalanceModal_asOf">
						AS OF {entry?.snapshotDate || '-'}
					</div>
				</div>
				<div style={{ marginTop: 12 }}>
					<Table
						className="TrialBalanceModal_table"
						columns={columns}
						dataSource={entry?.rows || []}
						pagination={false}
						rowKey="id"
						size="small"
						bordered
					/>
				</div>
			</Spin>
		</Modal>
	);
};
