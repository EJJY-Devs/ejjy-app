import { Button, Form, Input, Modal, Select } from 'antd';
import React from 'react';
import { MAX_PAGE_SIZE } from 'global';
import { useAccountSubTypes, useAccountTypes, useNormalBalances } from 'hooks';

type Option = { label: string; value: number };

interface Props {
	accountTypeOptions?: Option[];
	isOptionsLoading?: boolean;
	normalBalanceOptions?: Option[];
	isSubmitting: boolean;
	open: boolean;
	subTypeOptions?: Option[];
	onClose: () => void;
	onCreate: (values: any) => Promise<void>;
}

export const CreateAccountModal = ({
	accountTypeOptions: accountTypeOptionsProp,
	isOptionsLoading: isOptionsLoadingProp,
	normalBalanceOptions: normalBalanceOptionsProp,
	isSubmitting,
	open,
	subTypeOptions: subTypeOptionsProp,
	onClose,
	onCreate,
}: Props) => {
	const [form] = Form.useForm();

	const {
		data: { accountTypes } = { accountTypes: [] },
		isFetching: isFetchingAccountTypes,
	} = useAccountTypes({ params: { pageSize: MAX_PAGE_SIZE } });
	const {
		data: { accountSubTypes } = { accountSubTypes: [] },
		isFetching: isFetchingAccountSubTypes,
	} = useAccountSubTypes({ params: { pageSize: MAX_PAGE_SIZE } });
	const {
		data: { normalBalances } = { normalBalances: [] },
		isFetching: isFetchingNormalBalances,
	} = useNormalBalances({ params: { pageSize: MAX_PAGE_SIZE } });

	const handleFinish = async (values: any) => {
		await onCreate(values);
		form.resetFields();
	};

	const fetchedAccountTypeOptions: Option[] = (accountTypes || []).map(
		(accountType: any) => ({
			label: accountType.name,
			value: accountType.id,
		}),
	);
	const fetchedSubTypeOptions: Option[] = (accountSubTypes || []).map(
		(accountSubType: any) => ({
			label: accountSubType.name,
			value: accountSubType.id,
		}),
	);
	const fetchedNormalBalanceOptions: Option[] = (normalBalances || []).map(
		(normalBalance: any) => ({
			label: normalBalance.name,
			value: normalBalance.id,
		}),
	);

	const accountTypeOptions =
		accountTypeOptionsProp ?? fetchedAccountTypeOptions;
	const subTypeOptions = subTypeOptionsProp ?? fetchedSubTypeOptions;
	const normalBalanceOptions =
		normalBalanceOptionsProp ?? fetchedNormalBalanceOptions;

	const isOptionsLoading =
		Boolean(isOptionsLoadingProp) ||
		isFetchingAccountTypes ||
		isFetchingAccountSubTypes ||
		isFetchingNormalBalances;

	return (
		<Modal
			footer={null}
			open={open}
			title="Create Account"
			destroyOnClose
			onCancel={onClose}
		>
			<Form
				className="CreateAccountModal_form"
				form={form}
				layout="vertical"
				onFinish={handleFinish}
			>
				<Form.Item
					label="Account Code"
					name="accountCode"
					rules={[{ required: true, message: 'Account code is required' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					label="Account Name"
					name="accountName"
					rules={[{ required: true, message: 'Account name is required' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					label="Account Type"
					name="accountType"
					rules={[{ required: true, message: 'Account type is required' }]}
				>
					<Select
						loading={isOptionsLoading}
						optionFilterProp="label"
						options={accountTypeOptions}
						showSearch
					/>
				</Form.Item>

				<Form.Item
					label="Sub-Type"
					name="subType"
					rules={[{ required: true, message: 'Sub-type is required' }]}
				>
					<Select
						loading={isOptionsLoading}
						optionFilterProp="label"
						options={subTypeOptions}
						showSearch
					/>
				</Form.Item>

				<Form.Item
					label="Normal Balance"
					name="normalBalance"
					rules={[{ required: true, message: 'Normal balance is required' }]}
				>
					<Select
						loading={isOptionsLoading}
						optionFilterProp="label"
						options={normalBalanceOptions}
						showSearch
					/>
				</Form.Item>

				<div className="CreateAccountModal_actions d-flex justify-end gap-2">
					<Button onClick={onClose}>Cancel</Button>
					<Button
						loading={isSubmitting}
						type="primary"
						onClick={() => form.submit()}
					>
						Create
					</Button>
				</div>
			</Form>
		</Modal>
	);
};
