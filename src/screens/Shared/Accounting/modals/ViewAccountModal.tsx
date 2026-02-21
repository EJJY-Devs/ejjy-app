import { Descriptions, Modal } from 'antd';
import React from 'react';
import { MAX_PAGE_SIZE } from 'global';
import { useAccountSubTypes, useAccountTypes, useNormalBalances } from 'hooks';

interface Props {
	account: any;
	open: boolean;
	onClose: () => void;
}

export const ViewAccountModal = ({ account, open, onClose }: Props) => {
	const { data: { accountTypes } = { accountTypes: [] } } = useAccountTypes({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		data: { accountSubTypes } = { accountSubTypes: [] },
	} = useAccountSubTypes({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		data: { normalBalances } = { normalBalances: [] },
	} = useNormalBalances({
		params: { pageSize: MAX_PAGE_SIZE },
	});

	const accountTypeOptions = (accountTypes || []).map((accountType: any) => ({
		label: accountType.name,
		value: accountType.name,
	}));
	const subTypeOptions = (accountSubTypes || []).map((accountSubType: any) => ({
		label: accountSubType.name,
		value: accountSubType.name,
	}));
	const normalBalanceOptions = (normalBalances || []).map(
		(normalBalance: any) => ({
			label: normalBalance.name,
			value: normalBalance.name,
		}),
	);

	const getOptionLabel = (value: string, options: any[]) =>
		options.find((option) => option.value === value)?.label || '';

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
