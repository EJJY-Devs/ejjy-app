import { Modal, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import robotoRegularTtf from 'assets/fonts/Roboto-Regular.ttf';
import { PdfButtons } from 'components/Printing';
import jsPDF from 'jspdf';
import React, { useMemo, useState } from 'react';

const TIMEOUT_MS = 2000;
const PDF_WRAPPER_WIDTH_PX = 1120;
const PDF_WRAPPER_PADDING_PX = 24;
const PDF_PAGE_WIDTH_PX = 1225;
const PDF_PAGE_HEIGHT_PX = 1800;
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

const escapeHtml = (value: string) =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

export interface CashFlowRow {
	id: number;
	code?: string;
	label: string;
	amount: string;
	isSection?: boolean;
	isTotal?: boolean;
	isGrandTotal?: boolean;
	isSpacer?: boolean;
	amountBottomBold?: boolean;
	// increase = deduction, decrease = addition
	isReversed?: boolean;
}

export type CashFlowPeriodType = 'daily' | 'monthly' | 'annual' | 'range';

export interface CashFlowEntry {
	snapshotDate: string;
	periodType?: CashFlowPeriodType;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	rows: CashFlowRow[];
}

const getPeriodPrefix = (periodType?: CashFlowPeriodType) => {
	if (periodType === 'monthly') return 'FOR THE MONTH ENDED';
	if (periodType === 'annual') return 'FOR THE YEAR ENDED';
	if (periodType === 'range') return 'FOR THE PERIOD ENDED';
	return 'AS OF';
};

const buildRowsHtml = (rows: Omit<CashFlowRow, 'id'>[]) =>
	rows
		.map((row) => {
			if (row.isSpacer) {
				return `<tr><td colspan="3" style="border:none; height:8px;"></td></tr>`;
			}

			const rowClass = [
				row.isSection ? 'section-row' : '',
				row.isTotal ? 'total-row' : '',
				row.isGrandTotal ? 'grand-total-row' : '',
			]
				.filter(Boolean)
				.join(' ');

			const amountClass = row.amountBottomBold ? 'amount-bottom-bold' : '';

			return `
			<tr class="${rowClass}">
				<td style="width:80px;">${escapeHtml(row.code || '')}</td>
				<td>${escapeHtml(row.label || '')}</td>
				<td class="${amountClass}" style="text-align:right; width:180px;">${escapeHtml(
				row.amount || '',
			)}</td>
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
	const periodPrefix = getPeriodPrefix(entry.periodType);

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Statement of Cash Flows</title>
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
				th:nth-child(3) { text-align: right; }
				.section-row td { font-weight: 700; background: #fafafa; }
				.total-row td { font-weight: 700; }
				.grand-total-row td { font-weight: 700; background: #e6f4ff; }
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
				<h1>STATEMENT OF CASH FLOWS</h1>
				<h2>${escapeHtml(periodPrefix)} ${escapeHtml(entry.snapshotDate || '-')}</h2>
			</div>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th style="width:80px;">Code</th>
							<th>Description</th>
							<th style="text-align:right; width:180px;">Amount</th>
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
		if (record.isSection) {
			return { fontWeight: 700, background: '#fafafa' };
		}

		if (record.isGrandTotal) {
			return { fontWeight: 700, background: '#e6f4ff' };
		}

		if (record.isTotal) {
			return { fontWeight: 700 };
		}

		if (isAmountColumn && record.amountBottomBold) {
			return { borderBottom: '2px solid #111' };
		}

		return undefined;
	};

	const columns: ColumnsType<CashFlowRow> = useMemo(
		() => [
			{
				title: 'Code',
				dataIndex: 'code',
				key: 'code',
				width: 80,
				onCell: (record: CashFlowRow) => ({
					style: getCellStyle(record),
				}),
				render: (value: string, record: CashFlowRow) => {
					if (record.isSpacer) return null;
					if (record.isSection || record.isTotal || record.isGrandTotal)
						return <strong>{value || ''}</strong>;
					return value || '';
				},
			},
			{
				title: 'Description',
				dataIndex: 'label',
				key: 'label',
				onCell: (record: CashFlowRow) => ({
					style: getCellStyle(record),
					colSpan: record.isSpacer ? 3 : 1,
				}),
				render: (value: string, record: CashFlowRow) => {
					if (record.isSpacer) return null;
					if (record.isSection || record.isTotal || record.isGrandTotal)
						return <strong>{value}</strong>;
					return value || '';
				},
			},
			{
				title: 'Amount',
				dataIndex: 'amount',
				key: 'amount',
				width: 180,
				align: 'right',
				onCell: (record: CashFlowRow) => ({
					style: getCellStyle(record, true),
					colSpan: record.isSpacer ? 0 : 1,
				}),
				render: (value: string, record: CashFlowRow) => {
					if (record.isSpacer) return null;
					if (record.isSection || record.isTotal || record.isGrandTotal)
						return <strong>{value || ''}</strong>;
					return value || '';
				},
			},
		],
		[],
	);

	const buildPdfHtml = () => {
		const dataHtml = printStatementOfCashFlows({ entry });
		if (!dataHtml) return null;

		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const renderPdf = (onReady: (instance: jsPDF) => void) => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) return;

		setIsLoadingPdf(true);

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({
			orientation: 'p',
			unit: 'px',
			format: [PDF_PAGE_WIDTH_PX, PDF_PAGE_HEIGHT_PX],
			putOnlyUsedFonts: true,
		});
		pdf.setProperties({ title: 'StatementOfCashFlows.pdf' });

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
					<div className="TrialBalanceModal_title">STATEMENT OF CASH FLOWS</div>
					<div className="TrialBalanceModal_asOf">
						{getPeriodPrefix(entry?.periodType)} {entry?.snapshotDate || '-'}
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
