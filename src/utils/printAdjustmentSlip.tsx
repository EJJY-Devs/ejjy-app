import dayjs from 'dayjs';
import { EMPTY_CELL, getFullName, printingTypes } from 'ejjy-global';
import {
	appendHtmlElement,
	getPageStyleObject,
	print,
} from 'ejjy-global/dist/print/helper-receipt';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { ReceiptHeaderV2 } from 'components/Printing';
import { formatDateTime, formatQuantity } from 'utils';

interface PrintAdjustmentSlipProps {
	adjustmentSlip: any;
	siteSettings?: any;
	user?: any;
	isPdf?: boolean;
}

// Local renderer for the Adjustment Slip print / PDF preview. Kept in this repo
// (instead of ejjy-global) so its layout stays in lockstep with
// ViewAdjustmentSlipModal. Uses the same labels, ordering, formatters and
// remarks logic as the modal so the printout mirrors what the user sees.
export const printAdjustmentSlip = ({
	adjustmentSlip,
	isPdf = false,
}: PrintAdjustmentSlipProps): string | undefined => {
	const products = adjustmentSlip?.products || [];

	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ fontSize: '12px', lineHeight: '1.3' })}
		>
			<div style={{ textAlign: 'center' }}>
				<ReceiptHeaderV2
					branchHeader={adjustmentSlip?.branch}
					title="ADJUSTMENT SLIP"
				/>

				<br />
				<div>Datetime Requested:</div>
				<div>{formatDateTime(adjustmentSlip?.datetime_created)}</div>
			</div>

			<table style={{ width: '100%', marginTop: '16px' }}>
				<tbody>
					<tr>
						<td style={{ verticalAlign: 'top' }}>Adjustment Slip ID:</td>
						<td style={{ textAlign: 'right' }}>
							{adjustmentSlip?.reference_number || EMPTY_CELL}
						</td>
					</tr>
					<tr>
						<td style={{ verticalAlign: 'top' }}>Branch:</td>
						<td style={{ textAlign: 'right' }}>
							{adjustmentSlip?.branch?.name || 'N/A'}
						</td>
					</tr>
					<tr>
						<td style={{ verticalAlign: 'top' }}>Encoded By:</td>
						<td style={{ textAlign: 'right' }}>
							{getFullName(adjustmentSlip?.encoded_by)}
						</td>
					</tr>
					<tr>
						<td style={{ verticalAlign: 'top' }}>Date &amp; Time Created:</td>
						<td style={{ textAlign: 'right' }}>
							{formatDateTime(adjustmentSlip?.datetime_created)}
						</td>
					</tr>
				</tbody>
			</table>

			<hr style={{ margin: '12px 0' }} />

			<div>
				{products.map((product: any, index: number) => {
					const errorRemarks = product?.error_remarks || 'N/A';
					const remarks = product?.remarks || 'N/A';

					return (
						<div key={product.id} style={{ marginBottom: '12px' }}>
							<div style={{ fontWeight: 'bold' }}>
								{product?.branch_product?.product?.name}
								{product?.branch_product?.product?.is_vat_exempted
									? ' - VE'
									: ' - V'}
							</div>
							<div style={{ marginLeft: '20px' }}>
								{product?.adjusted_value >= 0 ? '+' : ''}{' '}
								{formatQuantity({
									unitOfMeasurement:
										product?.branch_product?.product?.unit_of_measurement,
									quantity: product?.adjusted_value,
								})}
								{errorRemarks !== 'N/A' ? (
									<span> Error - {errorRemarks}</span>
								) : (
									<span style={{ marginLeft: '16px' }}>
										{remarks !== 'N/A' ? remarks : 'Spoilage'}
									</span>
								)}
							</div>
							{index < products.length - 1 && <br />}
						</div>
					);
				})}
			</div>

			<div style={{ textAlign: 'center', marginTop: '16px' }}>
				<div>Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}</div>
			</div>

			{adjustmentSlip?.remarks && (
				<div style={{ textAlign: 'center', marginTop: '8px' }}>
					<div>Overall Remarks: {adjustmentSlip.remarks}</div>
				</div>
			)}
		</div>,
	);

	if (isPdf) {
		return appendHtmlElement(data);
	}

	print(
		appendHtmlElement(data),
		'Adjustment Slip',
		undefined,
		printingTypes.HTML,
	);
	return data;
};
