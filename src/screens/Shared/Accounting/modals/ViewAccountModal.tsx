import { Descriptions, Modal } from 'antd';
import React from 'react';

interface Props {
	account: any;
	open: boolean;
	onClose: () => void;
}

export const ViewAccountModal = ({ account, open, onClose }: Props) => {
	const accountTypeOptions = [
		{ label: 'Asset', value: 'asset' },
		{ label: 'Liability', value: 'liability' },
		{ label: 'Equity', value: 'equity' },
		{ label: 'Income', value: 'income' },
		{ label: 'Expense', value: 'expense' },
	];

	const subTypeOptions = [
		{ label: 'Current', value: 'current' },
		{ label: 'Non-current', value: 'non-current' },
		{ label: 'Contra', value: 'contra' },
	];

	const normalBalanceOptions = [
		{ label: 'Debit', value: 'debit' },
		{ label: 'Credit', value: 'credit' },
	];

	const getOptionLabel = (value: string, options: any[]) =>
		options.find((option) => option.value === value)?.label || '-';

	return (
		<Modal
			className="Modal__large Modal__hasFooter"
			footer={null}
			open={open}
			title="View - Account"
			destroyOnClose
			onCancel={onClose}
		>
			<Descriptions
				column={2}
				labelStyle={{ fontWeight: 600, width: 160 }}
				bordered
			>
				<Descriptions.Item label="Account Code">
					{account?.account_code || '-'}
				</Descriptions.Item>
				<Descriptions.Item label="Account Name">
					{account?.account_name || '-'}
				</Descriptions.Item>
				<Descriptions.Item label="Account Type">
					{getOptionLabel(account?.account_type, accountTypeOptions)}
				</Descriptions.Item>
				<Descriptions.Item label="Sub-Type">
					{getOptionLabel(account?.sub_type, subTypeOptions)}
				</Descriptions.Item>
				<Descriptions.Item label="Normal Balance">
					{getOptionLabel(account?.normal_balance, normalBalanceOptions)}
				</Descriptions.Item>
			</Descriptions>
		</Modal>
	);
};
