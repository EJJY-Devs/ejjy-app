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

interface NotesRow {
	id: number;
	code?: string;
	label: string;
	amount: string;
	isNoteHeader?: boolean;
	isDescription?: boolean;
	isColumnHeader?: boolean;
	isTotal?: boolean;
	isSpacer?: boolean;
	isNetIncome?: boolean;
	amountBottomBold?: boolean;
}

interface NotesToFinancialStatementsEntry {
	snapshotDate: string;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	rows: NotesRow[];
}

const buildNotesHtml = (rows: Omit<NotesRow, 'id'>[]) =>
	rows
		.map((detail) => {
			if (detail.isSpacer) {
				return '<tr class="spacer-row"><td colspan="3"></td></tr>';
			}
			if (detail.isNoteHeader) {
				return `<tr class="note-header-row"><td colspan="3">${escapeHtml(
					detail.label,
				)}</td></tr>`;
			}
			if (detail.isDescription) {
				return `<tr class="description-row"><td colspan="3">${escapeHtml(
					detail.label,
				)}</td></tr>`;
			}
			if (detail.isColumnHeader) {
				return `
				<tr class="column-header-row">
					<td>${escapeHtml(detail.code || '')}</td>
					<td>${escapeHtml(detail.label)}</td>
					<td>${escapeHtml(detail.amount || '')}</td>
				</tr>`;
			}

			const rowClassName = [detail.isTotal ? 'total-row' : '']
				.filter(Boolean)
				.join(' ');
			const amountClassName = detail.amountBottomBold
				? 'amount-bottom-bold'
				: '';

			return `
			<tr class="${rowClassName}">
				<td>${escapeHtml(detail.code || '')}</td>
				<td>${escapeHtml(detail.label)}</td>
				<td class="${amountClassName}">${escapeHtml(detail.amount || '')}</td>
			</tr>`;
		})
		.join('');

const printNotesToFinancialStatements = ({
	entry,
}: {
	entry: NotesToFinancialStatementsEntry | null;
}) => {
	if (!entry) {
		return '';
	}

	const rowsHtml = buildNotesHtml(entry.rows || []);

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Notes to Financial Statements</title>
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
				td:nth-child(1) { width: 60px; }
				td:nth-child(3) { width: 140px; text-align: right; }
				.note-header-row td { font-weight: 700; font-size: 14px; background: #fafafa; }
				.description-row td { font-style: italic; font-size: 13px; }
				.column-header-row td { font-weight: 700; background: #f5f5f5; }
				.total-row td { font-weight: 700; }
				.net-income-row td { font-style: italic; }
				.spacer-row td { border: none; height: 14px; padding: 0; background: #fff; }
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
				<h1>NOTES TO FINANCIAL STATEMENTS</h1>
				<h2>FOR THE YEAR ENDED ${escapeHtml(entry.snapshotDate || '-')}</h2>
			</div>
			<div class="table-wrap">
				<table>
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
	entry: NotesToFinancialStatementsEntry | null;
	isLoading?: boolean;
	open: boolean;
	onClose: () => void;
}

export const NotesToFinancialStatementsModal = ({
	entry,
	isLoading = false,
	open,
	onClose,
}: Props) => {
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const getCellStyle = (record: NotesRow, isAmountColumn = false) => {
		if (record.isSpacer) {
			return {
				borderTop: 'none',
				borderLeft: 'none',
				borderRight: 'none',
				borderBottom: '1px solid #f0f0f0',
				padding: 0,
				height: 14,
				background: '#fff',
			};
		}

		if (record.isNoteHeader) {
			return { fontWeight: 700, fontSize: 14, background: '#fafafa' };
		}

		if (record.isDescription) {
			return { fontStyle: 'italic' as const };
		}

		if (record.isColumnHeader) {
			return { fontWeight: 700, background: '#f5f5f5' };
		}

		if (isAmountColumn && record.amountBottomBold) {
			return { borderBottom: '2px solid #111' };
		}

		return undefined;
	};

	const columns: ColumnsType<NotesRow> = useMemo(
		() => [
			{
				title: '',
				dataIndex: 'code',
				key: 'code',
				width: 60,
				onCell: (record: NotesRow) => {
					if (record.isNoteHeader || record.isDescription) {
						return { colSpan: 0 };
					}
					return { style: getCellStyle(record) };
				},
				render: (value: string, record: NotesRow) => {
					if (record.isSpacer || record.isNoteHeader || record.isDescription) {
						return '';
					}
					if (record.isColumnHeader || record.isTotal) {
						return <strong>{value || ''}</strong>;
					}
					return value || '';
				},
			},
			{
				title: '',
				dataIndex: 'label',
				key: 'label',
				onCell: (record: NotesRow) => {
					if (record.isNoteHeader || record.isDescription) {
						return { colSpan: 3, style: getCellStyle(record) };
					}
					return { style: getCellStyle(record) };
				},
				render: (value: string, record: NotesRow) => {
					if (record.isSpacer) return '';
					if (record.isNoteHeader) return <strong>{value}</strong>;
					if (record.isDescription) return <em>{value}</em>;
					if (record.isColumnHeader || record.isTotal)
						return <strong>{value}</strong>;
					return value || '';
				},
			},
			{
				title: '',
				dataIndex: 'amount',
				key: 'amount',
				width: 120,
				align: 'right',
				onCell: (record: NotesRow) => {
					if (record.isNoteHeader || record.isDescription) {
						return { colSpan: 0 };
					}
					return { style: getCellStyle(record, true) };
				},
				render: (value: string, record: NotesRow) => {
					if (record.isSpacer || record.isNoteHeader || record.isDescription) {
						return '';
					}
					if (record.isColumnHeader && !value) return '';
					if (record.isTotal) return <strong>{value}</strong>;
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
				code: r.code,
				label: r.label,
				amount: r.amount,
				isNoteHeader: r.isNoteHeader,
				isDescription: r.isDescription,
				isColumnHeader: r.isColumnHeader,
				isTotal: r.isTotal,
				isSpacer: r.isSpacer,
				isNetIncome: r.isNetIncome,
				amountBottomBold: r.amountBottomBold,
			})),
		}),
		[entry],
	);

	const buildPdfHtml = () => {
		const dataHtml = printNotesToFinancialStatements({
			entry: printableEntry,
		});
		if (!dataHtml) return null;

		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const renderPdf = async (onReady: (instance: jsPDF) => void) => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) return;

		setIsLoadingPdf(true);
		const pdfTitle = 'NotesToFinancialStatements.pdf';

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
			instance.save('NotesToFinancialStatements.pdf');
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
			title="View - Notes to Financial Statements"
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
						NOTES TO FINANCIAL STATEMENTS
					</div>
					<div className="TrialBalanceModal_asOf">
						FOR THE YEAR ENDED {entry?.snapshotDate || '-'}
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
