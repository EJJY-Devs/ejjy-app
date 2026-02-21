import { EditFilled, SearchOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Input,
	Row,
	Select,
	Space,
	Spin,
	Table,
	Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors, ViewBranchInventoryReportModal } from 'components';
import { PdfButtons } from 'components/Printing';
import { Box, Label } from 'components/elements';
import { Cart } from 'screens/Shared/Cart';
import { filterOption } from 'ejjy-global';
import jsPDF from 'jspdf';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	EMPTY_CELL,
	MAX_PAGE_SIZE,
	pageSizeOptions,
	SEARCH_DEBOUNCE_TIME,
	appTypes,
} from 'global';
import {
	useBranchProductBalances,
	useBranches,
	useProductCategories,
	useQueryParams,
	useSiteSettingsNew,
} from 'hooks';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import robotoRegularTtf from 'assets/fonts/Roboto-Regular.ttf';
import { BranchProductBalancesService } from 'services';
import {
	convertIntoArray,
	getAppType,
	getBranchProductStatus,
	getLocalApiUrl,
	getLocalBranchId,
} from 'utils';

import { printConsolidatedBranchInventoryReport } from 'components/modals/ViewConsolidatedBranchInventoryReportModal/printConsolidatedBranchInventoryReport';

const PDF_WRAPPER_WIDTH_PX = 1750;
const PDF_WRAPPER_PADDING_PX = 24;
const PDF_PAGE_WIDTH_PX = 1900;

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

const measureHtmlHeightPx = (html: string) => {
	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.left = '-99999px';
	container.style.top = '0';
	container.style.visibility = 'hidden';
	container.style.width = `${PDF_PAGE_WIDTH_PX}px`;
	container.innerHTML = html;
	document.body.appendChild(container);
	const height = container.scrollHeight;
	document.body.removeChild(container);
	return height;
};

const TabBranchInventoryReport = () => {
	// STATES
	const [dataSource, setDataSource] = useState([]);
	const [isCartModalVisible, setIsCartModalVisible] = useState(false);
	const [selectedBalance, setSelectedBalance] = useState(null);
	const [cartInitialSearchText, setCartInitialSearchText] = useState<string>(
		'',
	);
	const [viewedBalance, setViewedBalance] = useState<any | null>(null);
	const [isLoadingPdf, setIsLoadingPdf] = useState(false);

	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const { data: siteSettings } = useSiteSettingsNew();

	const isHeadOffice = getAppType() === appTypes.HEAD_OFFICE;

	const branchIdParam = useMemo(() => {
		const raw = (params as any)?.branchId;
		return Array.isArray(raw) ? raw[0] : raw;
	}, [params]);

	const defaultBranchId = useMemo(() => {
		if (isHeadOffice) return 'all';

		return getLocalBranchId();
	}, [isHeadOffice]);

	const effectiveBranchId = branchIdParam || defaultBranchId;

	const isAllBranches = isHeadOffice && effectiveBranchId === 'all';

	const companyName = useMemo(() => {
		return (
			(siteSettings as any)?.trade_name ||
			(siteSettings as any)?.company_name ||
			(siteSettings as any)?.name ||
			'ABC COMPANY'
		);
	}, [siteSettings]);

	// If we arrive here with a non-'all' branchId (e.g. inherited from Unsold Item Report),
	// force Head Office default back to 'all' for this tab.
	useEffect(() => {
		if (isHeadOffice && branchIdParam && branchIdParam !== 'all') {
			setQueryParams({ branchId: 'all' }, { shouldResetPage: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!branchIdParam && effectiveBranchId) {
			setQueryParams(
				{ branchId: effectiveBranchId },
				{ shouldResetPage: false },
			);
		}
	}, [branchIdParam, effectiveBranchId, setQueryParams]);

	// DYNAMIC COLUMNS
	const columns: ColumnsType = [
		{ title: 'Barcode', dataIndex: 'barcode' },
		{
			title: 'Description',
			dataIndex: 'description',
		},
		{
			title: 'Balance',
			dataIndex: 'value',
			align: 'left',
			sorter: true,
			sortOrder: (() => {
				if (params?.ordering === 'value') return 'ascend';
				if (params?.ordering === '-value') return 'descend';
				return null;
			})(),
			sortDirections: ['ascend', 'descend', 'ascend'],
			onHeaderCell: () => ({
				onClick: () => {
					let ordering;
					if (!params?.ordering || params?.ordering === '-value') {
						ordering = 'value';
					} else if (params?.ordering === 'value') {
						ordering = '-value';
					}
					setQueryParams({ ordering }, { shouldResetPage: true });
				},
			}),
		},
		{ title: 'Status', dataIndex: 'status', align: 'left' },
		...(isHeadOffice ? [{ title: 'Actions', dataIndex: 'actions' }] : []),
	];

	const {
		data: { branchProductBalances, total },
		isFetching: isFetchingBranchProductBalances,
		error: branchProductBalancesError,
		refetch: refetchBranchProductBalances,
	} = useBranchProductBalances({
		params: {
			...params,
			branchId: effectiveBranchId,
			page: Number(params?.page) || DEFAULT_PAGE,
			pageSize: Number(params?.pageSize) || DEFAULT_PAGE_SIZE,
		},
		options: {
			enabled: Boolean(effectiveBranchId),
		},
	});

	const getQueryParamValue = (value: unknown) =>
		Array.isArray(value) ? value[0] : value;

	const getQueryParamNumber = (value: unknown) => {
		const rawValue = getQueryParamValue(value);
		if (rawValue === undefined || rawValue === null || rawValue === '') {
			return undefined;
		}
		const numValue = Number(rawValue);
		return Number.isNaN(numValue) ? undefined : numValue;
	};

	const fetchAllBalancesForPdf = useCallback(async () => {
		let normalizedBranchId: number | string | undefined = effectiveBranchId;
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

		if (!normalizedBranchId) {
			return [];
		}

		const baseURL = getLocalApiUrl();
		const pageSize = MAX_PAGE_SIZE;
		const requestParams = {
			search: getQueryParamValue(params?.search) as string | undefined,
			branch_id: normalizedBranchId,
			branch_product_id: getQueryParamNumber(params?.branchProductId),
			product_id: getQueryParamNumber(params?.productId),
			product_category: getQueryParamValue(params?.productCategory) as
				| string
				| undefined,
			ordering: getQueryParamValue(params?.ordering) as string | undefined,
			page_size: pageSize,
		};

		const fetchPage = isAllBranches
			? BranchProductBalancesService.aggregated
			: BranchProductBalancesService.list;

		const firstResponse = await fetchPage(
			{ ...requestParams, page: DEFAULT_PAGE },
			baseURL,
		);

		const count = Number(firstResponse?.data?.count || 0);
		const firstResults: any[] = firstResponse?.data?.results || [];
		const totalPages = Math.max(1, Math.ceil(count / pageSize));

		const remainingPagePromises = Array.from(
			{ length: Math.max(0, totalPages - 1) },
			(_unused, idx) => {
				const page = DEFAULT_PAGE + idx + 1;
				const pageParams = { ...requestParams, page };

				return fetchPage(pageParams, baseURL);
			},
		);

		const remainingResponses = await Promise.all(remainingPagePromises);
		const remainingResults = remainingResponses.flatMap(
			(r) => (r?.data?.results || []) as any[],
		);

		return [...firstResults, ...remainingResults];
	}, [
		effectiveBranchId,
		isAllBranches,
		params?.branchProductId,
		params?.ordering,
		params?.productCategory,
		params?.productId,
		params?.search,
	]);

	useEffect(() => {
		if (isAllBranches) {
			const data = branchProductBalances.map((balance) => {
				const isWeighing =
					balance.branch_product?.product?.unit_of_measurement === 'weighing' ||
					balance.is_weighing;
				const barcodeText =
					balance.branch_product?.product?.barcode || EMPTY_CELL;
				const statusValue = balance.branch_product?.product_status;
				const status = getBranchProductStatus(statusValue);

				return {
					key: balance.id,
					barcode: (
						<Button
							className="pa-0"
							type="link"
							onClick={() => setViewedBalance(balance)}
						>
							{barcodeText}
						</Button>
					),
					description: balance.branch_product?.product?.name || EMPTY_CELL,
					value: isWeighing
						? Number(balance.value).toFixed(3)
						: Number(balance.value).toFixed(0),
					status: status || EMPTY_CELL,
				};
			});

			setDataSource(data);
		} else {
			const data = branchProductBalances.map((balance) => {
				const isWeighing =
					balance.branch_product?.product?.unit_of_measurement === 'weighing';
				const barcodeText =
					balance.branch_product?.product?.barcode || EMPTY_CELL;
				const status = getBranchProductStatus(
					balance.branch_product?.product_status,
				);

				const baseData: any = {
					key: balance.id,
					barcode: (
						<Button
							className="pa-0"
							type="link"
							onClick={() => setViewedBalance(balance)}
						>
							{barcodeText}
						</Button>
					),
					description: balance.branch_product?.product?.name || EMPTY_CELL,
					value: isWeighing
						? Number(balance.value).toFixed(3)
						: Number(balance.value).toFixed(0),
					status: status || EMPTY_CELL,
				};

				if (isHeadOffice) {
					baseData.actions = (
						<Space>
							<Tooltip title="Create Adjustment Slip">
								<Button
									icon={<EditFilled />}
									type="primary"
									ghost
									onClick={() => handleCreateAdjustmentSlip(balance)}
								/>
							</Tooltip>
						</Space>
					);
				}

				return baseData;
			});

			setDataSource(data);
		}
	}, [branchProductBalances, isAllBranches, isHeadOffice]);

	// METHODS
	const handleCreateAdjustmentSlip = (balance) => {
		const hasBranchProduct = Boolean(balance?.branch_product);
		if (!hasBranchProduct) {
			setSelectedBalance(null);
			setCartInitialSearchText(balance?.barcode || balance?.name || '');
			setIsCartModalVisible(true);
			return;
		}

		setCartInitialSearchText('');
		setSelectedBalance(balance);
		setIsCartModalVisible(true);
	};

	const handleModalClose = () => {
		setSelectedBalance(null);
		setCartInitialSearchText('');
		setIsCartModalVisible(false);
	};

	const buildPdfHtml = useCallback(
		(balances: any[]) => {
			const dataHtml = printConsolidatedBranchInventoryReport({
				balances,
				companyName,
			});

			return `
			<div style="width: ${PDF_PAGE_WIDTH_PX}px; box-sizing: border-box; font-family: Roboto, Arial, sans-serif;">
				<div style="width: ${PDF_WRAPPER_WIDTH_PX}px; padding: ${PDF_WRAPPER_PADDING_PX}px; box-sizing: border-box; margin: 0 auto;">
					${dataHtml}
				</div>
			</div>
		`;
		},
		[companyName],
	);

	const previewPdf = useCallback(async () => {
		setIsLoadingPdf(true);

		try {
			const balances = await fetchAllBalancesForPdf();
			const pdfTitle = 'ConsolidatedBranchInventoryReport.pdf';
			const wrappedHtml = buildPdfHtml(balances);
			const measuredHeight = measureHtmlHeightPx(wrappedHtml);
			const pageHeightPx = Math.max(300, measuredHeight + 40);

			// eslint-disable-next-line new-cap
			const pdf = new jsPDF({
				orientation: 'l',
				unit: 'px',
				format: [PDF_PAGE_WIDTH_PX, pageHeightPx],
				putOnlyUsedFonts: true,
			});
			pdf.setProperties({ title: pdfTitle });

			await ensureRobotoFont(pdf);

			pdf.html(wrappedHtml, {
				margin: 10,
				callback: (instance) => {
					window.open(instance.output('bloburl').toString());
					setIsLoadingPdf(false);
				},
			});
		} catch (error) {
			setIsLoadingPdf(false);
		}
	}, [buildPdfHtml, fetchAllBalancesForPdf]);

	const downloadPdf = useCallback(async () => {
		setIsLoadingPdf(true);

		try {
			const balances = await fetchAllBalancesForPdf();
			const pdfTitle = 'ConsolidatedBranchInventoryReport.pdf';
			const wrappedHtml = buildPdfHtml(balances);
			const measuredHeight = measureHtmlHeightPx(wrappedHtml);
			const pageHeightPx = Math.max(300, measuredHeight + 40);

			// eslint-disable-next-line new-cap
			const pdf = new jsPDF({
				orientation: 'l',
				unit: 'px',
				format: [PDF_PAGE_WIDTH_PX, pageHeightPx],
				putOnlyUsedFonts: true,
			});
			pdf.setProperties({ title: pdfTitle });

			await ensureRobotoFont(pdf);

			pdf.html(wrappedHtml, {
				margin: 10,
				callback: (instance) => {
					instance.save(pdfTitle);
					setIsLoadingPdf(false);
				},
			});
		} catch (error) {
			setIsLoadingPdf(false);
		}
	}, [buildPdfHtml, fetchAllBalancesForPdf]);

	return (
		<Box>
			<RequestErrors
				errors={convertIntoArray(branchProductBalancesError)}
				withSpaceBottom
			/>

			<Filter
				pdfButtons={
					<PdfButtons
						downloadPdf={downloadPdf}
						isDisabled={
							isFetchingBranchProductBalances ||
							branchProductBalances.length === 0 ||
							isLoadingPdf
						}
						isLoading={isLoadingPdf}
						previewPdf={previewPdf}
					/>
				}
			/>

			{isCartModalVisible && (
				<Cart
					initialSearchText={cartInitialSearchText}
					prePopulatedProduct={selectedBalance}
					type="Adjustment Slip"
					onClose={handleModalClose}
					onRefetch={refetchBranchProductBalances}
				/>
			)}

			{viewedBalance && (
				<ViewBranchInventoryReportModal
					balance={viewedBalance}
					onClose={() => setViewedBalance(null)}
				/>
			)}

			<Spin spinning={isFetchingBranchProductBalances}>
				<Table
					columns={columns}
					dataSource={dataSource}
					loading={isFetchingBranchProductBalances}
					pagination={{
						current: Number(params.page) || DEFAULT_PAGE,
						total,
						pageSize: Number(params.pageSize) || DEFAULT_PAGE_SIZE,
						onChange: (page, newPageSize) => {
							setQueryParams({
								page,
								pageSize: newPageSize,
							});
						},
						disabled: !dataSource,
						position: ['bottomCenter'],
						pageSizeOptions,
					}}
					scroll={{ x: 800 }}
					bordered
				/>
			</Spin>
		</Box>
	);
};

const Filter = ({ pdfButtons }: { pdfButtons?: React.ReactNode }) => {
	// CUSTOM HOOKS
	const { params, setQueryParams } = useQueryParams();
	const {
		data: { branches },
		isFetching: isFetchingBranches,
		error: branchesError,
	} = useBranches({
		params: { pageSize: MAX_PAGE_SIZE },
		options: { enabled: getAppType() === appTypes.HEAD_OFFICE },
	});
	const {
		data: { productCategories },
		isFetching: isFetchingProductCategories,
		error: productCategoriesError,
	} = useProductCategories({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	// METHODS
	const getBranchSelectValue = () => {
		if (!params.branchId && getAppType() === appTypes.HEAD_OFFICE) {
			return 'all';
		}
		if (params.branchId === 'all') {
			return 'all';
		}
		const numValue = Number(params.branchId);
		return !Number.isNaN(numValue) ? numValue : 'all';
	};
	const handleSearchDebounced = useCallback(
		_.debounce((search) => {
			setQueryParams({ search }, { shouldResetPage: true });
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<div className="mb-4">
			<RequestErrors
				errors={[
					...convertIntoArray(branchesError, 'Branches'),
					...convertIntoArray(productCategoriesError, 'Product Categories'),
				]}
				withSpaceBottom
			/>

			<Row gutter={[16, 16]}>
				<Col lg={12} span={24}>
					<Label label="Product" spacing />
					<Input
						defaultValue={params.search}
						placeholder="Search product name or barcode"
						prefix={<SearchOutlined />}
						allowClear
						onChange={(event) =>
							handleSearchDebounced(event.target.value.trim())
						}
					/>
				</Col>

				<Col lg={12} span={24}>
					<Label label="Category" spacing />
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<div style={{ flex: 1 }}>
							<Select
								className="w-100"
								filterOption={filterOption}
								loading={isFetchingProductCategories}
								optionFilterProp="children"
								value={params.productCategory ? params.productCategory : null}
								allowClear
								showSearch
								onChange={(value) => {
									setQueryParams(
										{ productCategory: value },
										{ shouldResetPage: true },
									);
								}}
							>
								{productCategories.map(({ id, name }) => (
									<Select.Option key={id} value={name}>
										{name}
									</Select.Option>
								))}
							</Select>
						</div>
						{pdfButtons}
					</div>
				</Col>
			</Row>

			{getAppType() === appTypes.HEAD_OFFICE && (
				<Row className="mt-4" gutter={[16, 16]}>
					<Col lg={24} span={24}>
						<Label label="Branch" spacing />
						<Select
							className="w-100"
							filterOption={filterOption}
							loading={isFetchingBranches}
							optionFilterProp="children"
							value={getBranchSelectValue()}
							allowClear
							showSearch
							onChange={(value) => {
								setQueryParams(
									{ branchId: value || 'all' },
									{ shouldResetPage: true },
								);
							}}
						>
							<Select.Option value="all">All</Select.Option>
							{branches.map((branch) => (
								<Select.Option key={branch.id} value={branch.id}>
									{branch.name}
								</Select.Option>
							))}
						</Select>
					</Col>
				</Row>
			)}
		</div>
	);
};

export default TabBranchInventoryReport;
