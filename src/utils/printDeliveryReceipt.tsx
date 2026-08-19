import { printingTypes } from 'ejjy-global';
import {
	appendHtmlElement,
	getPageStyleObject,
	print,
} from 'ejjy-global/dist/print/helper-receipt';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { DeliveryReceiptDocument } from 'components/Printing';

interface PrintDeliveryReceiptProps {
	deliveryReceipt: any;
	siteSettings?: any;
	isPdf?: boolean;
}

export const printDeliveryReceipt = ({
	deliveryReceipt,
	isPdf = false,
}: PrintDeliveryReceiptProps): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.2' })}
		>
			<DeliveryReceiptDocument deliveryReceipt={deliveryReceipt} />
		</div>,
	);

	if (isPdf) {
		return appendHtmlElement(data);
	}

	print(
		appendHtmlElement(data),
		'Delivery Receipt',
		undefined,
		printingTypes.HTML,
	);
	return data;
};
