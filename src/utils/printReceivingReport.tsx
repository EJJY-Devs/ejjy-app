import { printingTypes } from 'ejjy-global';
import {
	appendHtmlElement,
	getPageStyleObject,
	print,
} from 'ejjy-global/dist/print/helper-receipt';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { ReceivingReportDocument } from 'components/Printing';

interface PrintReceivingReportProps {
	receivingReport: any;
	siteSettings?: any;
	isPdf?: boolean;
}

export const printReceivingReport = ({
	receivingReport,
	isPdf = false,
}: PrintReceivingReportProps): string | undefined => {
	const data = ReactDOM.renderToStaticMarkup(
		<div
			className="container"
			style={getPageStyleObject({ lineHeight: '1.2' })}
		>
			<ReceivingReportDocument receivingReport={receivingReport} />
		</div>,
	);

	if (isPdf) {
		return appendHtmlElement(data);
	}

	print(
		appendHtmlElement(data),
		'Receiving Report',
		undefined,
		printingTypes.HTML,
	);
	return data;
};
