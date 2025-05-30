import { Space, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface Props {
	branchMachine?: any;
	title?: string;
	branchHeader?: any;
}

export const ReceiptHeaderV2 = ({
	branchMachine,
	title,
	branchHeader,
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
			<Text style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
				{branchInfo?.store_name}
			</Text>

			{title && (
				<>
					<br />
					<Text>{title}</Text>
				</>
			)}
		</Space>
	);
};
