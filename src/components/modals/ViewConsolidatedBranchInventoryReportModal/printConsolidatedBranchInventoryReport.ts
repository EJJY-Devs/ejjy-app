import moment from 'moment';

import { EMPTY_CELL } from 'global';
import { formatInPeso, getProductType } from 'utils';

type Options = {
	balances: any[];
	companyName?: string;
};

const escapeHtml = (value: unknown) => {
	const text = value === null || value === undefined ? '' : String(value);
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

const renderCellValue = (value: unknown) => {
	if (value === null || value === undefined || value === '') {
		return EMPTY_CELL;
	}

	return String(value);
};

const getBalanceValueDisplay = (balance: any) => {
	const product = balance?.branch_product?.product;
	const isWeighing =
		product?.unit_of_measurement === 'weighing' || !!balance?.is_weighing;

	const numericBalanceValue = Number(balance?.value);
	if (!Number.isFinite(numericBalanceValue)) return EMPTY_CELL;

	return isWeighing
		? numericBalanceValue.toFixed(3)
		: numericBalanceValue.toFixed(0);
};

const getCost = (balance: any) => {
	const branchProduct = balance?.branch_product;
	const product = branchProduct?.product;

	return (
		product?.cost_per_piece ??
		branchProduct?.cost_per_piece ??
		branchProduct?.cost ??
		balance?.cost_per_piece ??
		null
	);
};

const getRegularPrice = (balance: any) => {
	const branchProduct = balance?.branch_product;
	const product = branchProduct?.product;

	return (
		branchProduct?.price_per_piece ??
		product?.price_per_piece ??
		balance?.price_per_piece ??
		null
	);
};

const getBarcode = (balance: any) => {
	return (
		balance?.branch_product?.product?.barcode || balance?.barcode || EMPTY_CELL
	);
};

const getProductName = (balance: any) => {
	return balance?.branch_product?.product?.name || balance?.name || EMPTY_CELL;
};

const getBrandName = (balance: any) => {
	return (
		balance?.branch_product?.product?.brand_name ||
		balance?.brand_name ||
		EMPTY_CELL
	);
};

const getDescription = (balance: any) => {
	return (
		balance?.branch_product?.product?.description ||
		balance?.description ||
		EMPTY_CELL
	);
};

const getProductTypeDisplay = (balance: any) => {
	const productType = balance?.branch_product?.product?.type || balance?.type;
	return productType ? getProductType(productType) : EMPTY_CELL;
};

const getProductCategory = (balance: any) => {
	const product = balance?.branch_product?.product;
	return (
		product?.product_category?.name ||
		product?.product_category ||
		balance?.product_category ||
		EMPTY_CELL
	);
};

const getStorageType = (balance: any) => {
	return (
		balance?.branch_product?.product?.storage_type ||
		balance?.storage_type ||
		EMPTY_CELL
	);
};

const getLocation = (balance: any) => {
	return balance?.branch_product?.location || balance?.location || EMPTY_CELL;
};

const getReorderPoint = (balance: any) => {
	const branchProduct = balance?.branch_product;
	const product = branchProduct?.product;
	return (
		branchProduct?.reorder_point ??
		product?.reorder_point ??
		balance?.reorder_point ??
		EMPTY_CELL
	);
};

const getStatus = (balance: any) => {
	return (
		balance?.branch_product?.product?.status || balance?.status || EMPTY_CELL
	);
};

const getNearestExpiryDate = (balance: any) => {
	return balance?.nearest_expiry_date || EMPTY_CELL;
};

const getPreferredSupplier = (balance: any) => {
	const product = balance?.branch_product?.product;
	return (
		product?.preferred_supplier?.name ||
		product?.supplier?.name ||
		balance?.preferred_supplier ||
		EMPTY_CELL
	);
};

export const printConsolidatedBranchInventoryReport = ({
	balances,
	companyName,
}: Options) => {
	const now = moment();
	const asOfText = `INVENTORY ON HAND AS OF ${now.format(
		'MM/DD/YY',
	)} | ${now.format('hh:mma')}`.toUpperCase();

	let grandTotalCost = 0;
	let grandTotalSales = 0;

	const rowsHtml = balances
		.map((balance) => {
			const barcode = getBarcode(balance);
			const brandName = getBrandName(balance);
			const productName = getProductName(balance);
			const description = getDescription(balance);
			const descriptionDisplay =
				description === EMPTY_CELL ? productName : description;
			const productType = getProductTypeDisplay(balance);
			const productCategory = getProductCategory(balance);
			const storageType = getStorageType(balance);
			const location = getLocation(balance);

			const cost = getCost(balance);
			const regularPrice = getRegularPrice(balance);
			const balanceDisplay = getBalanceValueDisplay(balance);

			const numericBalanceValue = Number(balance?.value);
			const totalCostValue =
				Number.isFinite(Number(cost)) && Number.isFinite(numericBalanceValue)
					? Number(cost) * numericBalanceValue
					: null;
			const totalSalesValue =
				Number.isFinite(Number(regularPrice)) &&
				Number.isFinite(numericBalanceValue)
					? Number(regularPrice) * numericBalanceValue
					: null;

			if (totalCostValue !== null && totalCostValue !== undefined) {
				grandTotalCost += Number(totalCostValue);
			}
			if (totalSalesValue !== null && totalSalesValue !== undefined) {
				grandTotalSales += Number(totalSalesValue);
			}

			return `
				<tr>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(barcode),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(brandName),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(descriptionDisplay),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(productType),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(productCategory),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(storageType),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(location),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px; text-align: right;">${escapeHtml(
						cost === null || cost === undefined
							? EMPTY_CELL
							: formatInPeso(cost),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px; text-align: right;">${escapeHtml(
						regularPrice === null || regularPrice === undefined
							? EMPTY_CELL
							: formatInPeso(regularPrice),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px; text-align: right;">${escapeHtml(
						renderCellValue(balanceDisplay),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px; text-align: right;">${escapeHtml(
						renderCellValue(getReorderPoint(balance)),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(getStatus(balance)),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(getNearestExpiryDate(balance)),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px; text-align: right;">${escapeHtml(
						totalCostValue === null || totalCostValue === undefined
							? EMPTY_CELL
							: formatInPeso(totalCostValue),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px; text-align: right;">${escapeHtml(
						totalSalesValue === null || totalSalesValue === undefined
							? EMPTY_CELL
							: formatInPeso(totalSalesValue),
					)}</td>
					<td style="border: 1px solid #000; padding: 4px;">${escapeHtml(
						renderCellValue(getPreferredSupplier(balance)),
					)}</td>
				</tr>
			`;
		})
		.join('');

	const grandTotalRow = `
		<tr>
			<td style="border: 1px solid #000; padding: 4px;" colspan="13"></td>
			<td style="border: 1px solid #000; padding: 4px; font-weight: 700; text-align: right;">${escapeHtml(
				formatInPeso(grandTotalCost),
			)}</td>
			<td style="border: 1px solid #000; padding: 4px; font-weight: 700; text-align: right;">${escapeHtml(
				formatInPeso(grandTotalSales),
			)}</td>
			<td style="border: 1px solid #000; padding: 4px;"></td>
		</tr>
	`;

	return `
		<div style="font-family: Roboto, Arial, sans-serif; color: #000;">
			<div style="text-align: center; font-weight: 900; font-size: 16px;">${escapeHtml(
				(companyName || '').toUpperCase() || 'ABC COMPANY',
			)}</div>
			<div style="text-align: center; font-size: 12px; margin-bottom: 18px;">${escapeHtml(
				asOfText,
			)}</div>

			<table style="width: 100%; margin: 0 auto; border-collapse: collapse; font-size: 9px; table-layout: fixed;">
				<thead>
					<tr>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">BARCODE</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">BRAND NAME</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">DESCRIPTION</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">PRODUCT TYPE</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">PRODUCT CATEGORY</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">STORAGE TYPE</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">LOCATION</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">COST</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">REGULAR PRICE</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">PRODUCT BALANCE</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">REORDER POINT</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">STATUS</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">NEAREST EXPIRY DATE</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">TOTAL COST VALUE</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">TOTAL SALES VALUE</th>
						<th style="border: 1px solid #000; padding: 6px; background: #00ffff;">PREFERRED SUPPLIER</th>
					</tr>
				</thead>
				<tbody>
					${rowsHtml}
					${grandTotalRow}
				</tbody>
			</table>
		</div>
	`;
};
