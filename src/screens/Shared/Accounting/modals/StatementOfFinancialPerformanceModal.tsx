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

const escapeHtml = (value: string) =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

interface StatementOfFinancialPerformancePrintableRow {
	code?: string;
	label: string;
	amount: string;
	isSection?: boolean;
	isTotal?: boolean;
	isSpacer?: boolean;
	amountBottomBold?: boolean;
	topBorderVisible?: boolean;
	indentLevel?: number;
}

interface StatementOfFinancialPerformancePrintableEntry {
	snapshotDate: string;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	entries: StatementOfFinancialPerformancePrintableRow[];
}

const printStatementOfFinancialPerformance = ({
	entry,
}: {
	entry: StatementOfFinancialPerformancePrintableEntry | null;
}) => {
	if (!entry) {
		return '';
	}

	const rowsHtml = (entry.entries || [])
		.map((detail) => {
			const rowClassName = [
				detail.isSection ? 'section-row' : '',
				detail.isTotal ? 'total-row' : '',
				detail.isSpacer ? 'spacer-row' : '',
				detail.topBorderVisible ? 'top-border-visible' : '',
			]
				.filter(Boolean)
				.join(' ');
			const label = detail.isSpacer ? '' : escapeHtml(detail.label || '-');
			const amount =
				detail.isSpacer || (detail.isSection && !detail.amount)
					? ''
					: escapeHtml(detail.amount || '');
			const amountClassName = detail.amountBottomBold
				? 'amount-bottom-bold'
				: '';

			return `
			<tr class="${rowClassName}">
				<td>${escapeHtml(detail.code || '')}</td>
				<td>${label}</td>
				<td class="${amountClassName}">${amount}</td>
			</tr>
		`;
		})
		.join('');

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Statement of Financial Performance</title>
			<style>
				body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
				.header { margin-bottom: 14px; line-height: 1.35; font-size: 16px; text-align: center; }
				.title { text-align: center; margin-bottom: 14px; }
				.title h1 { margin: 0; font-size: 24px; }
				.title h2 { margin: 4px 0 0; font-size: 20px; font-weight: 600; }
				.table-wrap { width: 780px; max-width: 100%; margin: 0 auto 16px; }
				table { width: 100%; border-collapse: collapse; }
				th, td { border: 1px solid #d9d9d9; padding: 8px 10px; text-align: left; font-size: 14px; }
				th { background: #fafafa; font-weight: 700; }
				th:nth-child(1), td:nth-child(1) { width: 80px; }
				th:nth-child(3), td:nth-child(3) { width: 180px; }
				td:nth-child(3), th:nth-child(3) { text-align: right; }
				.section-row td, .total-row td { font-weight: 700; }
				.spacer-row td { border: none; height: 18px; padding: 0; background: #fff; }
				.top-border-visible td { border-top: 1px solid #d9d9d9; }
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
				<h1>STATEMENT OF FINANCIAL PERFORMANCE</h1>
				<h2>AS OF ${escapeHtml(entry.snapshotDate || '-')}</h2>
			</div>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th></th>
							<th>Revenue</th>
							<th></th>
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

interface StatementOfFinancialPerformanceRow {
	id: number;
	code?: string;
	label: string;
	amount: string;
	isSection?: boolean;
	isTotal?: boolean;
	isSpacer?: boolean;
	amountBottomBold?: boolean;
	topBorderVisible?: boolean;
	indentLevel?: number;
}

interface StatementOfFinancialPerformanceEntry {
	snapshotDate: string;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	entries: StatementOfFinancialPerformanceRow[];
}

interface Props {
	entry: StatementOfFinancialPerformanceEntry | null;
	isLoading?: boolean;
	open: boolean;
	onClose: () => void;
}

export const StatementOfFinancialPerformanceModal = ({
	entry,
	isLoading = false,
	open,
	onClose,
}: Props) => {
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const getCellStyle = (
		record: StatementOfFinancialPerformanceRow,
		isAmountColumn = false,
	) => {
		if (record.isSpacer) {
			return {
				border: 'none',
				padding: 0,
				height: 18,
				background: '#fff',
			};
		}

		if (isAmountColumn && record.amountBottomBold) {
			return { borderBottom: '2px solid #111' };
		}

		if (record.topBorderVisible) {
			return { borderTop: '1px solid #f0f0f0' };
		}

		return undefined;
	};

	const columns: ColumnsType<StatementOfFinancialPerformanceRow> = useMemo(
		() => [
			{
				title: '',
				dataIndex: 'code',
				key: 'code',
				width: 50,
				onCell: (record: StatementOfFinancialPerformanceRow) => ({
					style: getCellStyle(record),
				}),
				render: (value: string, record: StatementOfFinancialPerformanceRow) => {
					if (record.isSpacer) {
						return '';
					}

					if (record.isSection || record.isTotal) {
						return <strong>{value || ''}</strong>;
					}

					return value || '';
				},
			},
			{
				title: 'Revenue',
				dataIndex: 'label',
				key: 'label',
				onCell: (record: StatementOfFinancialPerformanceRow) => ({
					style: getCellStyle(record),
				}),
				render: (value: string, record: StatementOfFinancialPerformanceRow) => {
					if (record.isSpacer) {
						return '';
					}

					const content = <span>{value}</span>;

					if (record.isSection || record.isTotal) {
						return <strong>{content}</strong>;
					}

					return content;
				},
			},
			{
				title: '',
				dataIndex: 'amount',
				key: 'amount',
				width: 90,
				align: 'right',
				onCell: (record: StatementOfFinancialPerformanceRow) => ({
					style: getCellStyle(record, true),
				}),
				render: (value: string, record: StatementOfFinancialPerformanceRow) => {
					if (record.isSpacer) {
						return '';
					}

					if (record.isSection && !value) {
						return '';
					}

					if (record.isSection || record.isTotal) {
						return <strong>{value}</strong>;
					}

					return value;
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
			entries: (entry?.entries || []).map((row) => ({
				code: row.code,
				label: row.label,
				amount: row.amount,
				isSection: row.isSection,
				isTotal: row.isTotal,
				isSpacer: row.isSpacer,
				amountBottomBold: row.amountBottomBold,
				topBorderVisible: row.topBorderVisible,
				indentLevel: row.indentLevel,
			})),
		}),
		[
			entry?.branchName,
			entry?.entries,
			entry?.snapshotDate,
			entry?.storeAddress,
			entry?.storeName,
			entry?.storeTin,
		],
	);

	const buildPdfHtml = () => {
		const dataHtml = printStatementOfFinancialPerformance({
			entry: printableEntry,
		});
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
		const pdfTitle = 'StatementOfFinancialPerformance.pdf';

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
			instance.save('StatementOfFinancialPerformance.pdf');
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
			title="View - Statement of Financial Performance"
			width={425}
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
						STATEMENT OF FINANCIAL PERFORMANCE
					</div>
					<div className="TrialBalanceModal_asOf">
						AS OF {entry?.snapshotDate || '-'}
					</div>
				</div>
				<Table
					className="TrialBalanceModal_table mt-6"
					columns={columns}
					dataSource={entry?.entries || []}
					pagination={false}
					rowKey="id"
					size="small"
					bordered
				/>
			</Spin>
		</Modal>
	);
};
