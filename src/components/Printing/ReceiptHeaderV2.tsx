import { Space, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface Props {
	branchMachine?: any;
	title?: string;
	branchHeader?: any;
	branchName?: string;
}

export const ReceiptHeaderV2 = ({
	branchMachine,
	title,
	branchHeader,
	branchName,
}: Props) => {
	// CUSTOM HOOKS

	const { branch } = branchMachine || {};

	const branchInfo = branch ?? branchHeader; // <-- fallback if branch is undefined

	return (
		<Space
			align="center"
			className="w-100 text-center"
			direction="vertical"
			size={0}
		>
			{branchInfo?.store_name && (
				<Text style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
					{branchInfo.store_name}
				</Text>
			)}

			{branchInfo?.store_address && (
				<Text style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
					{branchInfo.store_address}
				</Text>
			)}

			{(branchName ?? branchInfo?.name) && (
				<Text style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
					{branchName ?? branchInfo?.name}
				</Text>
			)}

			{branchInfo?.tin && (
				<Text style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
					{branchInfo.tin}
				</Text>
			)}

			{title && (
				<>
					<br />
					<Text strong>{title}</Text>
				</>
			)}
		</Space>
	);
};
