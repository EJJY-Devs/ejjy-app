import { Space, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface Props {
	branchMachine?: any;
	title?: string;
	branchHeader?: any;
}

export const ReceiptHeader = ({
	branchMachine,
	title,
	branchHeader,
}: Props) => {
	// CUSTOM HOOKS

	const {
		name,
		machine_identification_number: machineID,
		pos_terminal: posTerminal,
		branch,
		ptu_date_issued: ptuDateIssued,
		permit_to_use,
	} = branchMachine || {};

	const branchInfo = branch ?? branchHeader; // <-- fallback if branch is undefined

	return (
		<Space
			align="center"
			className="w-100 text-center"
			direction="vertical"
			size={0}
		>
			<Text style={{ whiteSpace: 'pre-line' }}>{branchInfo?.store_name}</Text>
			<Text style={{ whiteSpace: 'pre-line' }}>
				{branchInfo?.store_address}
			</Text>
			<Text>
				{[branchInfo?.contact_number, name].filter(Boolean).join(' | ')}
			</Text>
			<Text>{branchInfo?.proprietor}</Text>
			<Text>
				{branchInfo?.vatType === 'VAT' ? 'VAT REG TIN' : branchInfo?.vatType}
			</Text>
			<Text>{branchInfo?.tin}</Text>

			{machineID && <Text>{`MIN: ${machineID}`}</Text>}
			{posTerminal && <Text>{`SN: ${posTerminal}`}</Text>}
			{permit_to_use && <Text>{`PTU No: ${permit_to_use}`}</Text>}
			{ptuDateIssued && <Text>{`Date Issued: ${ptuDateIssued}`}</Text>}

			{title && (
				<>
					<br />
					<Text>{title}</Text>
				</>
			)}
		</Space>
	);
};
