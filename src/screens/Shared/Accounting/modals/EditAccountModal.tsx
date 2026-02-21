import { Button, Form, Input, Modal, Select } from 'antd';
import React, { useEffect } from 'react';

interface Props {
	account: any;
	isSubmitting: boolean;
	open: boolean;
	onClose: () => void;
	onUpdate: (values: any) => Promise<void>;
}

export const EditAccountModal = ({
	account,
	isSubmitting,
	open,
	onClose,
	onUpdate,
}: Props) => {
	const [form] = Form.useForm();

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

	useEffect(() => {
		if (open && account) {
			form.setFieldsValue({
				accountCode: account.account_code,
				accountName: account.account_name,
				accountType: account.account_type,
				subType: account.sub_type,
				normalBalance: account.normal_balance,
			});
		}

		if (!open) {
			form.resetFields();
		}
	}, [account, form, open]);

	const handleFinish = async (values: any) => {
		await onUpdate(values);
		form.resetFields();
	};

	return (
		<Modal
			footer={null}
			open={open}
			title="Edit Account"
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
						Save
					</Button>
				</div>
			</Form>
		</Modal>
	);
};
