import { Modal, Typography } from 'antd';
import { PdfButtons } from 'components/Printing';
import jsPDF from 'jspdf';
import React, { useEffect, useMemo, useState } from 'react';

import robotoRegularTtf from 'assets/fonts/Roboto-Regular.ttf';
import { DEFAULT_PAGE, MAX_PAGE_SIZE } from 'global';
import { BranchProductBalancesService } from 'services';
import { getLocalApiUrl } from 'utils';
import { useSiteSettingsNew } from 'hooks';

import { printConsolidatedBranchInventoryReport } from './printConsolidatedBranchInventoryReport';

const TIMEOUT_MS = 2000;

// Tuned for a wide, spreadsheet-like layout.
const PDF_WRAPPER_WIDTH_PX = 1750;
const PDF_WRAPPER_PADDING_PX = 24;
const PDF_PAGE_WIDTH_PX = 1900;
const PDF_PAGE_HEIGHT_PX = 1120;

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
		// If font loading fails, fall back to default jsPDF font.
	}
};

type Props = {
	branchId: any;
	params: any;
	onClose: () => void;
};

export const ViewConsolidatedBranchinventoryReportModal = ({
	branchId,
	params,
	onClose,
}: Props) => {
	const { data: siteSettings } = useSiteSettingsNew();

	const [balances, setBalances] = useState<any[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [isFetchingBalances, setIsFetchingBalances] = useState(false);

	const [htmlPdf, setHtmlPdf] = useState('');
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const companyName = useMemo(() => {
		return (
			(siteSettings as any)?.trade_name ||
			(siteSettings as any)?.company_name ||
			(siteSettings as any)?.name ||
			'ABC COMPANY'
		);
	}, [siteSettings]);

	const requestParams = useMemo(() => {
		let normalizedBranchId: number | string | undefined = branchId;
		const isAllBranches = normalizedBranchId === 'all';

		if (
			normalizedBranchId !== undefined &&
			normalizedBranchId !== null &&
			normalizedBranchId !== ''
		) {
			if (normalizedBranchId === 'all') {
				normalizedBranchId = 'all';
			} else {
				const numValue = Number(normalizedBranchId);
				normalizedBranchId = !Number.isNaN(numValue) ? numValue : undefined;
			}
		} else {
			normalizedBranchId = undefined;
		}

		return {
			isAllBranches,
			params: {
				search: params?.search,
				branch_id: normalizedBranchId,
				branch_product_id: params?.branchProductId,
				product_id: params?.productId,
				product_category: params?.productCategory,
				ordering: params?.ordering,
				page: DEFAULT_PAGE,
				page_size: MAX_PAGE_SIZE,
			},
		};
	}, [
		branchId,
		params?.branchProductId,
		params?.ordering,
		params?.productCategory,
		params?.productId,
		params?.search,
	]);

	useEffect(() => {
		let cancelled = false;

		const fetchAll = async () => {
			if (!requestParams.params.branch_id) {
				setBalances([]);
				setTotal(0);
				return;
			}

			setIsFetchingBalances(true);
			try {
				const baseURL = getLocalApiUrl();
				const pageSize = Number(
					requestParams.params.page_size || MAX_PAGE_SIZE,
				);

				const fetchPage = requestParams.isAllBranches
					? BranchProductBalancesService.aggregated
					: BranchProductBalancesService.list;

				const firstResponse = await fetchPage(
					{ ...requestParams.params, page: DEFAULT_PAGE },
					baseURL,
				);

				const count = Number(firstResponse?.data?.count || 0);
				const firstResults: any[] = firstResponse?.data?.results || [];
				const totalPages = Math.max(1, Math.ceil(count / pageSize));

				const remainingPagePromises = Array.from(
					{ length: Math.max(0, totalPages - 1) },
					(_, idx) => {
						const page = DEFAULT_PAGE + idx + 1;
						const pageParams = { ...requestParams.params, page };

						return fetchPage(pageParams, baseURL);
					},
				);

				const remainingResponses = await Promise.all(remainingPagePromises);
				const remainingResults = remainingResponses.flatMap(
					(r) => (r?.data?.results || []) as any[],
				);

				const allResults: any[] = [...firstResults, ...remainingResults];

				if (!cancelled) {
					setBalances(allResults);
					setTotal(count || allResults.length);
				}
			} catch (error) {
				if (!cancelled) {
					setBalances([]);
					setTotal(0);
				}
			} finally {
				if (!cancelled) {
					setIsFetchingBalances(false);
				}
			}
		};

		fetchAll();

		return () => {
			cancelled = true;
		};
	}, [requestParams]);

	const buildPdfHtml = () => {
		const dataHtml = printConsolidatedBranchInventoryReport({
			balances,
			companyName,
		});
		return `<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">${dataHtml}</div>`;
	};

	const previewPdf = () => {
		setIsLoadingPdf(true);

		const pdfTitle = 'ConsolidatedBranchInventoryReport.pdf';
		const wrappedHtml = buildPdfHtml();
		setHtmlPdf(wrappedHtml);

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
					margin: 10,
					callback: (instance) => {
						window.open(instance.output('bloburl').toString());
						setIsLoadingPdf(false);
						setHtmlPdf('');
					},
				});
			})().catch(() => {
				setIsLoadingPdf(false);
				setHtmlPdf('');
			});
		}, TIMEOUT_MS);
	};

	const downloadPdf = () => {
		setIsLoadingPdf(true);

		const pdfTitle = 'ConsolidatedBranchInventoryReport.pdf';
		const wrappedHtml = buildPdfHtml();
		setHtmlPdf(wrappedHtml);

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
					margin: 10,
					callback: (instance) => {
						instance.save(pdfTitle);
						setIsLoadingPdf(false);
						setHtmlPdf('');
					},
				});
			})().catch(() => {
				setIsLoadingPdf(false);
				setHtmlPdf('');
			});
		}, TIMEOUT_MS);
	};

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={[
				<PdfButtons
					key="pdf"
					downloadPdf={downloadPdf}
					isDisabled={
						isFetchingBalances || balances.length === 0 || isLoadingPdf
					}
					isLoading={isLoadingPdf}
					previewPdf={previewPdf}
				/>,
			]}
			title="Consolidated Branch Inventory Report"
			centered
			closable
			visible
			onCancel={onClose}
		>
			<Typography.Paragraph className="px-6 pb-6" style={{ marginBottom: 0 }}>
				Generates a PDF for the current inventory list. Items:{' '}
				<b>{isFetchingBalances ? 'Loading…' : total}</b>
			</Typography.Paragraph>

			{/* htmlPdf is kept for parity/debugging with other PDF flows */}
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{ display: 'none' }}
			/>
		</Modal>
	);
};
