import { Col, Row } from 'antd';
import { RequestErrors, TableHeader, TimeRangeFilter } from 'components';
import {
	BirAnnexTransactions,
	BranchMachine,
	DEFAULT_PAGE,
	MAX_PAGE_SIZE,
	PdfButtons,
	SpecialDiscountCode,
	TransactionsService,
	convertIntoArray,
	printBirReportNAAC,
	printBirReportPWD,
	printBirReportSC,
	printBirReportSP,
	renderA4SinglePagePdf,
	timeRangeTypes,
	useQueryParams,
	useTransactions,
} from 'ejjy-global';
import type jsPDF from 'jspdf';
import { refetchOptions } from 'global';
import { useSiteSettingsNew, usePdfPreviewModal } from 'hooks';
import { useUserStore } from 'stores';
import { getLocalApiUrl, savePdf } from 'utils';
import React, { useState } from 'react';
import { birAnnexTransactionsTabs as tabs } from 'ejjy-global/dist/components/BirAnnexTransactions/data';

type Props = {
	branchMachine: BranchMachine;
	discountCode: SpecialDiscountCode;
	category: string;
};

export const AnnexTransactionsTab = ({
	branchMachine,
	category,
	discountCode,
}: Props) => {
	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { params } = useQueryParams();
	const {
		data: siteSettings,
		isFetching: isFetchingSiteSettings,
		error: siteSettingsError,
	} = useSiteSettingsNew();
	const {
		data: transactionsData,
		isFetching: isFetchingTransactions,
		error: transactionsError,
	} = useTransactions({
		params: {
			timeRange: timeRangeTypes.DAILY,
			branchMachineId: branchMachine.id,
			discountCode,
			...params,
		},
		options: refetchOptions,
		serviceOptions: {
			baseURL: getLocalApiUrl(),
		},
	});

	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	const pdfTitle = (() => {
		if (discountCode === 'SC') return 'AnnexE2';
		if (discountCode === 'PWD') return 'AnnexE3';
		if (discountCode === 'NAAC') return 'AnnexE4';
		if (discountCode === 'SP') return 'AnnexE5';
		return '';
	})();

	const buildPdfHtml = async () => {
		const response = await TransactionsService.list(
			{
				branch_machine_id: branchMachine.id,
				discount_code: discountCode,
				page_size: MAX_PAGE_SIZE,
				page: DEFAULT_PAGE,
				time_range: params?.timeRange as string,
			},
			getLocalApiUrl(),
		);

		const transactions = response.results;

		if (category === tabs.NATIONAL_ATHLETES_AND_COACHES_SALES_REPORT) {
			return printBirReportNAAC(
				transactions,
				siteSettings,
				user,
				branchMachine,
			);
		}
		if (category === tabs.SOLO_PARENTS_SALES_REPORT) {
			return printBirReportSP(transactions, siteSettings, user, branchMachine);
		}
		if (category === tabs.SENIOR_CITIZEN_SALES_REPORT) {
			return printBirReportSC(transactions, siteSettings, user, branchMachine);
		}
		if (category === tabs.PERSONS_WITH_DISABILITY_SALES_REPORT) {
			return printBirReportPWD(transactions, siteSettings, user, branchMachine);
		}

		return '';
	};

	// These annex transaction lists share the E1 template styles
	// (.bir-reports-pdf, designed at 2300px wide), so they print the same way:
	// captured at that natural width and shrunk to fit one whole A4 page turned
	// crosswise (landscape), so nothing is clipped.
	const renderPdf = async (): Promise<jsPDF | null> => {
		setIsLoadingPdf(true);
		try {
			const html = await buildPdfHtml();
			return await renderA4SinglePagePdf({
				html,
				title: pdfTitle,
				orientation: 'l',
				widthPx: 2300,
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
		if (pdf) {
			await savePdf(pdf, `${pdfTitle}.pdf`);
		}
	};

	// Show the generated PDF in an in-app dialog instead of a new tab/window.
	const { showPreview, pdfPreviewModal } = usePdfPreviewModal({
		title: pdfTitle,
		onDownload: downloadPdf,
	});

	const previewPdf = async () => {
		const pdf = await renderPdf();
		if (!pdf) {
			return;
		}
		showPreview(pdf.output('bloburl').toString());
	};

	// METHODS

	return (
		<>
			{pdfPreviewModal}
			<TableHeader
				buttons={
					<PdfButtons
						key="pdf"
						downloadPdf={downloadPdf}
						isDisabled={isLoadingPdf || !transactionsData?.list}
						isLoading={isLoadingPdf || isFetchingTransactions}
						previewPdf={previewPdf}
					/>
				}
				title={category}
				wrapperClassName="pt-2 px-0"
			/>

			<Filter />

			<RequestErrors
				errors={[
					...convertIntoArray(transactionsError, 'Transactions'),
					...convertIntoArray(siteSettingsError, 'Site Settings'),
				]}
			/>

			<BirAnnexTransactions
				category={category}
				discountCode={discountCode}
				isLoading={
					isFetchingSiteSettings || isFetchingTransactions || isLoadingPdf
				}
				siteSettings={siteSettings}
				transactions={transactionsData?.list}
				transactionsTotal={transactionsData?.total}
			/>
		</>
	);
};

const Filter = () => (
	<Row className="mb-4" gutter={[16, 16]}>
		<Col lg={12} span={24}>
			<TimeRangeFilter />
		</Col>
	</Row>
);
