import { Space, Typography } from 'antd';
import { useSiteSettings } from 'hooks';
import React from 'react';

const { Text } = Typography;

interface Props {
	branchMachine?: any;
	title?: string;
}

export const ReceiptHeader = ({ branchMachine, title }: Props) => {
	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettings();

	const {
		contact_number: contactNumber,
		address_of_tax_payer: location,
		proprietor,
		store_name: storeName,
		tax_type: taxType,
		tin,
	} = siteSettings || {};

	const {
		name = '',
		machine_identification_number: machineID = '',
		pos_terminal: posTerminal = '',
	} = branchMachine || {};

	return (
		<Space
			align="center"
			className="w-100 text-center"
			direction="vertical"
			size={0}
		>
			<Text style={{ whiteSpace: 'pre-line' }}>{storeName}</Text>
			<Text style={{ whiteSpace: 'pre-line' }}>{location}</Text>
			<Text>{[contactNumber, name].filter(Boolean).join(' | ')}</Text>
			<Text>{proprietor}</Text>
			<Text>{taxType === 'VAT' ? 'VAT REG TIN' : taxType}</Text>
			<Text>{tin}</Text>
			<Text>{machineID}</Text>
			<Text>{posTerminal}</Text>

			{title && (
				<>
					<br />
					<Text>[{title}]</Text>
				</>
			)}
		</Space>
	);
};
