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

export interface CashFlowRow {
	id: number;
	note?: string;
	label: string;
	year1Amount?: string;
	year2Amount?: string;
	isSection?: boolean;
	isTotal?: boolean;
	isGrandTotal?: boolean;
	isBoldPlain?: boolean;
	isSpacer?: boolean;
	indentLevel?: number;
	// Rule lines are positioned independently of bold/total styling: some
	// subtotals are ruled on the row directly above them (with a blank
	// spacer in between), rather than on the subtotal row itself.
	amountTopRule?: boolean;
	amountBottomRule?: boolean;
}

export type CashFlowPeriodType = 'daily' | 'monthly' | 'annual' | 'range';

export interface CashFlowEntry {
	periodEndMonthDay: string;
	year1Label: string;
	year2Label: string;
	periodType?: CashFlowPeriodType;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	rows: CashFlowRow[];
}

const getPeriodPrefix = (periodType?: CashFlowPeriodType) => {
	if (periodType === 'monthly') return 'For the months ended';
	if (periodType === 'annual') return 'For the years ended';
	if (periodType === 'range') return 'For the periods ended';
	return 'As of';
};

const buildRowsHtml = (rows: Omit<CashFlowRow, 'id'>[]) =>
	rows
		.map((row) => {
			if (row.isSpacer) {
				return `<tr><td colspan="4" style="border:none; height:10px; padding:0;"></td></tr>`;
			}

			const rowClass = [
				row.isSection ? 'section-row' : '',
				row.isTotal ? 'total-row' : '',
				row.isGrandTotal ? 'grand-total-row' : '',
				row.isBoldPlain ? 'bold-row' : '',
				row.amountTopRule ? 'top-rule' : '',
				row.amountBottomRule ? 'bottom-rule' : '',
			]
				.filter(Boolean)
				.join(' ');

			const indentPadding = 4 + (row.indentLevel || 0) * 20;

			return `
			<tr class="${rowClass}">
				<td class="label-cell" style="padding-left:${indentPadding}px;">${escapeHtml(
				row.label || '',
			)}</td>
				<td class="note-cell">${escapeHtml(row.note || '')}</td>
				<td class="amount-cell">${escapeHtml(row.year1Amount || '')}</td>
				<td class="amount-cell">${escapeHtml(row.year2Amount || '')}</td>
			</tr>`;
		})
		.join('');

const printStatementOfCashFlows = ({
	entry,
}: {
	entry: CashFlowEntry | null;
}) => {
	if (!entry) return '';

	const rowsHtml = buildRowsHtml(entry.rows || []);
	const periodHeader = `${getPeriodPrefix(entry.periodType)} ${
		entry.periodEndMonthDay || '-'
	}`;

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Statements of Cash Flows</title>
			<style>
				body { font-family: Arial, sans-serif; padding: 0; color: #111; }
				.header { margin-bottom: 4px; line-height: 1.35; font-size: 12px; }
				.header .company-name { font-weight: 700; font-size: 13px; }
				.title { text-align: center; margin: 12px 0 16px; }
				.title h1 { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 0.4px; }
				table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 10px; }
				th, td { padding: 3px 6px; font-size: 11px; text-align: left; vertical-align: top; }
				thead th { border-bottom: 1px solid #000; font-weight: 700; }
				th.note-col, td.note-cell { width: 36px; }
				th.amount-col, td.amount-cell { width: 108px; text-align: right; }
				.section-row td, .total-row td, .grand-total-row td, .bold-row td { font-weight: 700; }
				.top-rule td.amount-cell, .grand-total-row td.amount-cell { border-top: 1px solid #000; }
				.bottom-rule td.amount-cell { border-bottom: 1px solid #000; }
				.grand-total-row td.amount-cell {
					box-shadow: 0 3px 0 0 #000, 0 5px 0 0 #000;
				}
			</style>
		</head>
		<body>
			<div class="header">
				<div class="company-name">${escapeHtml(entry.storeName || '-')}</div>
				<div>${escapeHtml(entry.storeAddress || '-')}</div>
			</div>
			<div class="title">
				<h1>STATEMENTS OF CASH FLOWS</h1>
			</div>
			<table>
				<thead>
					<tr>
						<th>${escapeHtml(periodHeader)}</th>
						<th class="note-col">Note</th>
						<th class="amount-col">${escapeHtml(entry.year1Label || '-')}</th>
						<th class="amount-col">${escapeHtml(entry.year2Label || '-')}</th>
					</tr>
				</thead>
				<tbody>
					${rowsHtml}
				</tbody>
			</table>
		</body>
		</html>
	`;
};

interface Props {
	entry: CashFlowEntry | null;
	isLoading?: boolean;
	open: boolean;
	onClose: () => void;
}

export const StatementOfCashFlowsModal = ({
	entry,
	isLoading = false,
	open,
	onClose,
}: Props) => {
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const getCellStyle = (record: CashFlowRow, isAmountColumn = false) => {
		if (!isAmountColumn) return undefined;

		if (record.isGrandTotal) {
			return { borderTop: '1px solid #000', borderBottom: '3px double #000' };
		}

		if (record.amountTopRule) {
			return { borderTop: '1px solid #000' };
		}

		if (record.amountBottomRule) {
			return { borderBottom: '1px solid #000' };
		}

		return undefined;
	};

	const isBoldRow = (record: CashFlowRow) =>
		record.isSection ||
		record.isTotal ||
		record.isGrandTotal ||
		record.isBoldPlain;

	const columns: ColumnsType<CashFlowRow> = useMemo(
		() => [
			{
				title: `${getPeriodPrefix(entry?.periodType)} ${
					entry?.periodEndMonthDay || '-'
				}`,
				dataIndex: 'label',
				key: 'label',
				onCell: (record: CashFlowRow) => ({
					style: {
						paddingLeft: 8 + (record.indentLevel || 0) * 20,
					},
					colSpan: record.isSpacer ? 4 : 1,
				}),
				render: (value: string, record: CashFlowRow) => {
					if (record.isSpacer) return null;
					const content = <span>{value}</span>;
					return isBoldRow(record) ? <strong>{content}</strong> : content;
				},
			},
			{
				title: 'Note',
				dataIndex: 'note',
				key: 'note',
				width: 60,
				onCell: (record: CashFlowRow) => ({
					colSpan: record.isSpacer ? 0 : 1,
				}),
				render: (value: string, record: CashFlowRow) =>
					record.isSpacer ? null : value || '',
			},
			{
				title: entry?.year1Label || '-',
				dataIndex: 'year1Amount',
				key: 'year1Amount',
				width: 150,
				align: 'right',
				onCell: (record: CashFlowRow) => ({
					style: getCellStyle(record, true),
					colSpan: record.isSpacer ? 0 : 1,
				}),
				render: (value: string, record: CashFlowRow) => {
					if (record.isSpacer) return null;
					const content = <span>{value || ''}</span>;
					return isBoldRow(record) ? <strong>{content}</strong> : content;
				},
			},
			{
				title: entry?.year2Label || '-',
				dataIndex: 'year2Amount',
				key: 'year2Amount',
				width: 150,
				align: 'right',
				onCell: (record: CashFlowRow) => ({
					style: getCellStyle(record, true),
					colSpan: record.isSpacer ? 0 : 1,
				}),
				render: (value: string, record: CashFlowRow) => {
					if (record.isSpacer) return null;
					const content = <span>{value || ''}</span>;
					return isBoldRow(record) ? <strong>{content}</strong> : content;
				},
			},
		],
		[
			entry?.periodType,
			entry?.periodEndMonthDay,
			entry?.year1Label,
			entry?.year2Label,
		],
	);

	const buildPdfHtml = () => {
		const dataHtml = printStatementOfCashFlows({ entry });
		if (!dataHtml) return null;

		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const renderPdf = async (onReady: (instance: jsPDF) => void) => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) return;

		setIsLoadingPdf(true);

		try {
			const pdf = await renderA4SinglePagePdf({
				html: wrappedHtml,
				title: 'StatementOfCashFlows.pdf',
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
			instance.save('StatementOfCashFlows.pdf');
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
			title="View - Statement of Cash Flows"
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
						STATEMENTS OF CASH FLOWS
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
					/>
				</div>
			</Spin>
		</Modal>
	);
};
