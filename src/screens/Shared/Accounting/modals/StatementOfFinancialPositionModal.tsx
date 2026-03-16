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

interface FinancialPositionRow {
	id: number;
	code?: string;
	label: string;
	amount: string;
	isSection?: boolean;
	isTotal?: boolean;
	isGrandTotal?: boolean;
	isSpacer?: boolean;
	amountBottomBold?: boolean;
}

interface FinancialPositionEntry {
	snapshotDate: string;
	storeName: string;
	storeAddress: string;
	branchName: string;
	storeTin: string;
	assetsRows: FinancialPositionRow[];
	liabilitiesEquityRows: FinancialPositionRow[];
}

const buildSideHtml = (rows: Omit<FinancialPositionRow, 'id'>[]) =>
	rows
		.map((detail) => {
			const rowClassName = [
				detail.isSection ? 'section-row' : '',
				detail.isTotal ? 'total-row' : '',
				detail.isGrandTotal ? 'grand-total-row' : '',
				detail.isSpacer ? 'spacer-row' : '',
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
			</tr>`;
		})
		.join('');

const printStatementOfFinancialPosition = ({
	entry,
}: {
	entry: FinancialPositionEntry | null;
}) => {
	if (!entry) {
		return '';
	}

	const assetsHtml = buildSideHtml(entry.assetsRows || []);
	const liabilitiesHtml = buildSideHtml(entry.liabilitiesEquityRows || []);

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Statement of Financial Position</title>
			<style>
				body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
				.header { margin-bottom: 14px; line-height: 1.35; font-size: 16px; text-align: center; }
				.title { text-align: center; margin-bottom: 14px; }
				.title h1 { margin: 0; font-size: 24px; }
				.title h2 { margin: 4px 0 0; font-size: 20px; font-weight: 600; }
				.sides { display: flex; gap: 24px; }
				.side { flex: 1; min-width: 0; }
				.side-title { font-weight: 700; font-size: 16px; margin-bottom: 8px; }
				table { width: 100%; border-collapse: collapse; }
				th, td { border: 1px solid #d9d9d9; padding: 6px 8px; text-align: left; font-size: 13px; }
				th { background: #fafafa; font-weight: 700; }
				th:nth-child(1), td:nth-child(1) { width: 50px; }
				th:nth-child(3), td:nth-child(3) { width: 140px; text-align: right; }
				.section-row td { font-weight: 700; }
				.total-row td { font-weight: 700; }
				.grand-total-row td { font-weight: 700; }
				.spacer-row td { border: none; height: 18px; padding: 0; background: #fff; }
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
				<h1>STATEMENT OF FINANCIAL POSITION</h1>
				<h2>AS OF ${escapeHtml(entry.snapshotDate || '-')}</h2>
			</div>
			<div class="sides">
				<div class="side">
					<table>
						<thead>
							<tr><th></th><th></th><th></th></tr>
						</thead>
						<tbody>${assetsHtml}</tbody>
					</table>
				</div>
				<div class="side">
					<table>
						<thead>
							<tr><th></th><th></th><th></th></tr>
						</thead>
						<tbody>${liabilitiesHtml}</tbody>
					</table>
				</div>
			</div>
		</body>
		</html>
	`;
};

interface Props {
	entry: FinancialPositionEntry | null;
	isLoading?: boolean;
	open: boolean;
	onClose: () => void;
}

export const StatementOfFinancialPositionModal = ({
	entry,
	isLoading = false,
	open,
	onClose,
}: Props) => {
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const getCellStyle = (
		record: FinancialPositionRow,
		isAmountColumn = false,
	) => {
		if (record.isSpacer) {
			return {
				borderTop: 'none',
				borderLeft: 'none',
				borderRight: 'none',
				borderBottom: '1px solid #f0f0f0',
				padding: 0,
				height: 18,
				background: '#fff',
			};
		}

		if (isAmountColumn && record.amountBottomBold) {
			return { borderBottom: '2px solid #111' };
		}

		return undefined;
	};

	const makeColumns = (): ColumnsType<FinancialPositionRow> => [
		{
			title: '',
			dataIndex: 'code',
			key: 'code',
			width: 50,
			onCell: (record: FinancialPositionRow) => ({
				style: getCellStyle(record),
			}),
			render: (value: string, record: FinancialPositionRow) => {
				if (record.isSpacer) return '';
				if (record.isSection || record.isTotal || record.isGrandTotal)
					return <strong>{value || ''}</strong>;
				return value || '';
			},
		},
		{
			title: '',
			dataIndex: 'label',
			key: 'label',
			onCell: (record: FinancialPositionRow) => ({
				style: getCellStyle(record),
			}),
			render: (value: string, record: FinancialPositionRow) => {
				if (record.isSpacer) return '';
				const content = <span>{value}</span>;
				if (record.isSection || record.isTotal || record.isGrandTotal)
					return <strong>{content}</strong>;
				return content;
			},
		},
		{
			title: '',
			dataIndex: 'amount',
			key: 'amount',
			width: 110,
			align: 'right',
			onCell: (record: FinancialPositionRow) => ({
				style: getCellStyle(record, true),
			}),
			render: (value: string, record: FinancialPositionRow) => {
				if (record.isSpacer) return '';
				if (record.isSection && !value) return '';
				if (record.isSection || record.isTotal || record.isGrandTotal)
					return <strong>{value}</strong>;
				return value;
			},
		},
	];

	const assetsColumns = useMemo(() => makeColumns(), []);
	const liabilitiesColumns = useMemo(() => makeColumns(), []);

	const printableEntry = useMemo(
		() => ({
			snapshotDate: entry?.snapshotDate || '',
			storeName: entry?.storeName || '',
			storeAddress: entry?.storeAddress || '',
			branchName: entry?.branchName || '',
			storeTin: entry?.storeTin || '',
			assetsRows: (entry?.assetsRows || []).map((r) => ({
				id: r.id,
				code: r.code,
				label: r.label,
				amount: r.amount,
				isSection: r.isSection,
				isTotal: r.isTotal,
				isGrandTotal: r.isGrandTotal,
				isSpacer: r.isSpacer,
				amountBottomBold: r.amountBottomBold,
			})),
			liabilitiesEquityRows: (entry?.liabilitiesEquityRows || []).map((r) => ({
				id: r.id,
				code: r.code,
				label: r.label,
				amount: r.amount,
				isSection: r.isSection,
				isTotal: r.isTotal,
				isGrandTotal: r.isGrandTotal,
				isSpacer: r.isSpacer,
				amountBottomBold: r.amountBottomBold,
			})),
		}),
		[entry],
	);

	const buildPdfHtml = () => {
		const dataHtml = printStatementOfFinancialPosition({
			entry: printableEntry,
		});
		if (!dataHtml) return null;

		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const renderPdf = (onReady: (instance: jsPDF) => void) => {
		const wrappedHtml = buildPdfHtml();
		if (!wrappedHtml) return;

		setIsLoadingPdf(true);
		const pdfTitle = 'StatementOfFinancialPosition.pdf';

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({
			orientation: 'l',
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
			instance.save('StatementOfFinancialPosition.pdf');
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
			title="View - Statement of Financial Position"
			width={1100}
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
						STATEMENT OF FINANCIAL POSITION
					</div>
					<div className="TrialBalanceModal_asOf">
						AS OF {entry?.snapshotDate || '-'}
					</div>
				</div>
				<div
					style={{
						display: 'flex',
						gap: 16,
						marginTop: 12,
					}}
				>
					<div style={{ flex: 1, minWidth: 0 }}>
						<Table
							className="TrialBalanceModal_table"
							columns={assetsColumns}
							dataSource={entry?.assetsRows || []}
							pagination={false}
							rowKey="id"
							size="small"
							bordered
						/>
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<Table
							className="TrialBalanceModal_table"
							columns={liabilitiesColumns}
							dataSource={entry?.liabilitiesEquityRows || []}
							pagination={false}
							rowKey="id"
							size="small"
							bordered
						/>
					</div>
				</div>
			</Spin>
		</Modal>
	);
};
