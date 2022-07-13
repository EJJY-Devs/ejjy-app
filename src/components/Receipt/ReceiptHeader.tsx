import { Space, Typography } from 'antd';
import { useSiteSettingsRetrieve } from 'hooks';
import React from 'react';

const { Text } = Typography;

interface Props {
	branchMachine: any;
	title?: string;
}

export const ReceiptHeader = ({ branchMachine, title }: Props) => {
	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettingsRetrieve();

	const {
		contact_number: contactNumber,
		address_of_tax_payer: location,
		proprietor,
		store_name: storeName,
		tax_type: taxType,
		tin,
	} = siteSettings;

	const {
		name,
		permit_to_use: ptuNumber,
		machine_identification_number: machineID,
		pos_terminal: posTerminal,
	} = branchMachine;

	return (
		<Space
			align="center"
			className="w-100 text-center"
			direction="vertical"
			size={0}
		>
			<Text style={{ whiteSpace: 'pre-line' }}>{storeName}</Text>
			<Text style={{ whiteSpace: 'pre-line' }}>{location}</Text>
			<Text>
				{contactNumber} | {name}
			</Text>
			<Text>{proprietor}</Text>
			<Text>
				{taxType} | {tin}
			</Text>
			<Text>{machineID}</Text>
			<Text>{ptuNumber}</Text>
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
