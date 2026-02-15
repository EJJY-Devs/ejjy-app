import { EMPTY_CELL } from 'global';
import { formatInPeso, getProductType } from 'utils';

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

const row2 = (
	label1: string,
	value1: unknown,
	label2: string,
	value2: unknown,
) => `
	<tr>
		<td style="border: 1px solid #d9d9d9; padding: 6px; font-weight: 600; width: 18%;">${escapeHtml(
			label1,
		)}</td>
		<td style="border: 1px solid #d9d9d9; padding: 6px; width: 32%;">${escapeHtml(
			renderCellValue(value1),
		)}</td>
		<td style="border: 1px solid #d9d9d9; padding: 6px; font-weight: 600; width: 18%;">${escapeHtml(
			label2,
		)}</td>
		<td style="border: 1px solid #d9d9d9; padding: 6px; width: 32%;">${escapeHtml(
			renderCellValue(value2),
		)}</td>
	</tr>
`;

const rowSpan2 = (label: string, value: unknown) => `
	<tr>
		<td style="border: 1px solid #d9d9d9; padding: 6px; font-weight: 600; width: 18%;">${escapeHtml(
			label,
		)}</td>
		<td style="border: 1px solid #d9d9d9; padding: 6px;" colspan="3">${escapeHtml(
			renderCellValue(value),
		)}</td>
	</tr>
`;

export const printBranchInventoryReport = (balance: any) => {
	const branchProduct = balance?.branch_product;
	const product = branchProduct?.product;

	const barcode = product?.barcode || balance?.barcode || EMPTY_CELL;
	const productName = product?.name || balance?.name || EMPTY_CELL;
	const isWeighing =
		product?.unit_of_measurement === 'weighing' || !!balance?.is_weighing;

	const numericBalanceValue = Number(balance?.value);
	let productBalanceDisplay: string = EMPTY_CELL;
	if (Number.isFinite(numericBalanceValue)) {
		productBalanceDisplay = isWeighing
			? numericBalanceValue.toFixed(3)
			: numericBalanceValue.toFixed(0);
	}

	const cost =
		product?.cost_per_piece ??
		branchProduct?.cost_per_piece ??
		branchProduct?.cost ??
		null;
	const regularPrice =
		branchProduct?.price_per_piece ?? product?.price_per_piece ?? null;
	const regularPriceDisplay =
		regularPrice === null || regularPrice === undefined
			? EMPTY_CELL
			: formatInPeso(regularPrice);

	const totalCostValue =
		Number.isFinite(Number(cost)) && Number.isFinite(numericBalanceValue)
			? Number(cost) * numericBalanceValue
			: null;
	const totalSalesValue =
		Number.isFinite(Number(regularPrice)) &&
		Number.isFinite(numericBalanceValue)
			? Number(regularPrice) * numericBalanceValue
			: null;

	const productType = product?.type ? getProductType(product.type) : EMPTY_CELL;
	const productCategory =
		product?.product_category?.name || product?.product_category || EMPTY_CELL;

	return `
		<div style="font-family: Arial, sans-serif; color: #000;">
			<div style="text-align: center; font-weight: 700; font-size: 14px; margin-bottom: 4px;">
				BRANCH INVENTORY ITEM
			</div>
			<div style="text-align: center; font-size: 12px; margin-bottom: 12px;">
				${escapeHtml(barcode)} - ${escapeHtml(productName)}
			</div>

			<table style="width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed;">
				${row2('Product Name', productName, 'Barcode', barcode)}
				${row2('Brand Name', product?.brand_name, 'Description', product?.description)}
				${row2('Product Type', productType, 'Product Category', productCategory)}
				${row2(
					'Storage Type',
					product?.storage_type,
					'Location',
					branchProduct?.location,
				)}
				${row2(
					'Cost',
					cost === null || cost === undefined ? EMPTY_CELL : formatInPeso(cost),
					'Regular Price',
					regularPriceDisplay,
				)}
				${row2(
					'Product Balance',
					productBalanceDisplay,
					'Reorder Point',
					branchProduct?.reorder_point ?? product?.reorder_point,
				)}
				${row2(
					'Status',
					product?.status,
					'Nearest Expiry Date',
					balance?.nearest_expiry_date,
				)}
				${row2(
					'Total Cost Value',
					totalCostValue === null || totalCostValue === undefined
						? EMPTY_CELL
						: formatInPeso(totalCostValue),
					'Total Sales Value',
					totalSalesValue === null || totalSalesValue === undefined
						? EMPTY_CELL
						: formatInPeso(totalSalesValue),
				)}
				${rowSpan2(
					'Preferred Supplier',
					product?.preferred_supplier?.name || product?.supplier?.name,
				)}
			</table>
		</div>
	`;
};
