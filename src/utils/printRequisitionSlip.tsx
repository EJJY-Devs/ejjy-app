import dayjs from 'dayjs';
import { printingTypes } from 'ejjy-global';
import {
	appendHtmlElement,
	getPageStyleObject,
	print,
} from 'ejjy-global/dist/print/helper-receipt';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { RequisitionSlipDocument } from 'components/Printing';

interface PrintRequisitionSlipProps {
	requisitionSlip: any;
	isPdf?: boolean;
}

// Requisition slips only exist in this application (not in cashiering), so the
// print template lives locally here. It renders the same content as the
// ViewRequisitionSlipModal so preview/print match what's shown on screen.
export const printRequisitionSlip = ({
	requisitionSlip,
	isPdf = false,
}: PrintRequisitionSlipProps): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.2' })}
		>
			<RequisitionSlipDocument requisitionSlip={requisitionSlip} />
			<br />
			<div style={{ textAlign: 'center', fontSize: '12px' }}>
				<div>Print Details: {dayjs().format('MM/DD/YYYY h:mmA')}</div>
				<div>Remarks: {requisitionSlip?.overall_remarks || 'N/A'}</div>
			</div>
		</div>,
	);

	if (isPdf) {
		return appendHtmlElement(data);
	}

	print(
		appendHtmlElement(data),
		'Requisition Slip',
		undefined,
		printingTypes.HTML,
	);
	return data;
};
