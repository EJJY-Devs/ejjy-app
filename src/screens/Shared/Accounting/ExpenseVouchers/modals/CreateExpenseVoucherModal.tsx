import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { AutoComplete, Button, Form, Input, InputNumber, Modal } from 'antd';
import { Label } from 'components/elements';
import { useAccounts } from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { getSupplierLabel } from 'screens/Shared/Accounts/components/TabSupplierPurchases/components/SupplierTotalBalance';
import { getLocalApiUrl, formatNumberWithCommas } from 'utils';

interface Particular {
	description: string;
	amount: number;
}

interface Props {
	isSubmitting: boolean;
	open: boolean;
	initialPayee?: string;
	supplierAccountId?: number;
	onClose: () => void;
	onCreate: (values: {
		payee: string;
		particulars: Particular[];
		amount: number;
		remarks: string;
		authorizerId: number;
		supplierAccountId?: number;
	}) => Promise<void>;
}

const pesoFormatter = (value: any) =>
	value || value === 0 ? `₱ ${formatNumberWithCommas(value)}` : '₱ ';
const pesoParser = (value: any) =>
	Number((value || '').replace(/₱\s?|,/g, '')) as any;

export const CreateExpenseVoucherModal = ({
	isSubmitting,
	open,
	initialPayee,
	supplierAccountId,
	onClose,
	onCreate,
}: Props) => {
	const [form] = Form.useForm();
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);
	const [autoSupplierAccountId, setAutoSupplierAccountId] = useState<
		number | null
	>(null);

	const isSupplierAccountFixed = !!supplierAccountId;
	const effectiveSupplierAccountId = isSupplierAccountFixed
		? supplierAccountId
		: autoSupplierAccountId;

	const { data: accountsData } = useAccounts({
		params: { withSupplierRegistration: true },
		options: { enabled: open && !isSupplierAccountFixed },
	});
	const supplierOptions = useMemo(
		() =>
			(accountsData?.accounts || []).map((account: any) => ({
				id: account.id,
				value: getSupplierLabel(account),
			})),
		[accountsData?.accounts],
	);

	useEffect(() => {
		if (!open) {
			form.resetFields();
			setAutoSupplierAccountId(null);
		} else if (initialPayee) {
			form.setFieldsValue({ payee: initialPayee });
		}
	}, [open, initialPayee]);

	const recomputeTotal = () => {
		const particulars: Particular[] = form.getFieldValue('particulars') || [];
		const total = particulars.reduce(
			(sum, item) => sum + (Number(item?.amount) || 0),
			0,
		);
		form.setFieldsValue({ amount: total });
	};

	const handlePayeeChange = (value: string) => {
		if (isSupplierAccountFixed) return;

		const matched = supplierOptions.find((option) => option.value === value);
		setAutoSupplierAccountId(matched ? matched.id : null);
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();

		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: 'Authorize Expense Voucher',
			onSuccess: async (authorizedUser) => {
				setAuthorizeConfig(null);
				await onCreate({
					payee: values.payee,
					particulars: values.particulars || [],
					amount: values.amount,
					remarks: values.remarks || '',
					authorizerId: authorizedUser.id,
					supplierAccountId: effectiveSupplierAccountId,
				});
				form.resetFields();
			},
			onCancel: () => setAuthorizeConfig(null),
		});
	};

	return (
		<>
			<Modal
				footer={null}
				maskClosable={false}
				open={open}
				title="Expense Voucher"
				width={560}
				centered
				closable
				destroyOnClose
				onCancel={onClose}
			>
				<Form
					form={form}
					initialValues={{ particulars: [{ description: '', amount: 0 }] }}
					layout="vertical"
				>
					<Form.Item
						label="Payee"
						name="payee"
						rules={[{ required: true, message: 'Payee is required' }]}
					>
						<AutoComplete
							disabled={isSupplierAccountFixed}
							filterOption={(inputValue, option) =>
								(option?.value as string)
									.toLowerCase()
									.includes(inputValue.toLowerCase())
							}
							options={supplierOptions}
							placeholder="Select a supplier or type a payee name"
							onChange={handlePayeeChange}
						/>
					</Form.Item>

					<Form.List name="particulars">
						{(fields, { add, remove }) => (
							<>
								<Label label="Particulars" spacing />
								{fields.map((field) => (
									<div key={field.key} className="d-flex" style={{ gap: 8 }}>
										<Form.Item
											name={[field.name, 'description']}
											rules={[
												{ required: true, message: 'Description is required' },
											]}
											style={{ flex: 1 }}
										>
											<Input placeholder="Enter particular" />
										</Form.Item>

										<Form.Item
											name={[field.name, 'amount']}
											rules={[
												{ required: true, message: 'Amount is required' },
											]}
											style={{ width: 160 }}
										>
											<InputNumber
												className="w-100"
												controls={false}
												formatter={pesoFormatter}
												min={0.01}
												parser={pesoParser}
												placeholder="0.00"
												precision={2}
												onChange={recomputeTotal}
											/>
										</Form.Item>

										<Button
											disabled={fields.length === 1}
											icon={<MinusCircleOutlined />}
											type="text"
											danger
											onClick={() => {
												remove(field.name);
												recomputeTotal();
											}}
										/>
									</div>
								))}

								<Button
									className="mb-4"
									icon={<PlusOutlined />}
									type="dashed"
									block
									onClick={() => add({ description: '', amount: 0 })}
								>
									Add Particular
								</Button>
							</>
						)}
					</Form.List>

					<Form.Item label="Amount" name="amount">
						<InputNumber
							className="w-100"
							controls={false}
							formatter={pesoFormatter}
							parser={pesoParser}
							precision={2}
							readOnly
						/>
					</Form.Item>

					<Form.Item label="Remarks" name="remarks">
						<Input placeholder="Enter remarks" />
					</Form.Item>

					<div className="ModalCustomFooter">
						<Button htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button
							htmlType="button"
							loading={isSubmitting}
							type="primary"
							onClick={handleSubmit}
						>
							Submit
						</Button>
					</div>
				</Form>
			</Modal>

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</>
	);
};
