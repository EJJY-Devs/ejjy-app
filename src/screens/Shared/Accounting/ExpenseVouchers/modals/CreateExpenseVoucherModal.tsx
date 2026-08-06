import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import {
	AutoComplete,
	Button,
	Form,
	Input,
	InputNumber,
	Modal,
	Radio,
	Select,
} from 'antd';
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
		paymentType: 'pay' | 'on_account';
		particulars: Particular[];
		amount: number;
		remarks: string;
		authorizerId: number;
		supplierAccountId?: number;
	}) => Promise<void>;
}

const pesoFormatter = (
	value: any,
	info?: { userTyping: boolean; input: string },
) => {
	if (!value && value !== 0) {
		return '₱ ';
	}

	const display = info?.userTyping ? value : Number(value).toFixed(2);
	return `₱ ${formatNumberWithCommas(display)}`;
};
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

	const isSupplierAccountFixed = !!supplierAccountId;
	const paymentType = Form.useWatch('paymentType', form) || 'pay';

	const { data: accountsData } = useAccounts({
		params: { withSupplierRegistration: true },
		options: { enabled: open && !isSupplierAccountFixed },
	});
	const supplierAutoCompleteOptions = useMemo(
		() =>
			(accountsData?.accounts || []).map((account: any) => ({
				id: account.id,
				value: getSupplierLabel(account),
			})),
		[accountsData?.accounts],
	);
	const supplierSelectOptions = useMemo(
		() =>
			(accountsData?.accounts || []).map((account: any) => ({
				value: account.id,
				label: getSupplierLabel(account),
			})),
		[accountsData?.accounts],
	);

	useEffect(() => {
		if (!open) {
			form.resetFields();
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

	const handlePaymentTypeChange = (value: string) => {
		form.setFieldsValue({
			paymentType: value,
			payee: '',
			supplierAccountId: null,
		});
	};

	const handlePayeeAutoCompleteChange = (value: string) => {
		if (isSupplierAccountFixed) return;

		const matched = supplierAutoCompleteOptions.find(
			(option) => option.value === value,
		);
		form.setFieldsValue({
			supplierAccountId: matched ? matched.id : null,
		});
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();

		const effectiveSupplierAccountId = isSupplierAccountFixed
			? supplierAccountId
			: values.supplierAccountId;

		const payee =
			values.paymentType === 'on_account'
				? supplierSelectOptions.find(
						(option) => option.value === values.supplierAccountId,
				  )?.label || ''
				: values.payee;

		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: 'Authorize Expense Voucher',
			onSuccess: async (authorizedUser) => {
				setAuthorizeConfig(null);
				await onCreate({
					payee,
					paymentType: values.paymentType,
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
					initialValues={{
						paymentType: 'pay',
						particulars: [{ description: '', amount: 0 }],
					}}
					layout="vertical"
				>
					<Label label="Payment Type" spacing />
					<Form.Item name="paymentType">
						<Radio.Group
							disabled={isSupplierAccountFixed}
							onChange={(e) => handlePaymentTypeChange(e.target.value)}
						>
							<Radio value="pay">Pay</Radio>
							<Radio value="on_account">On Account</Radio>
						</Radio.Group>
					</Form.Item>

					<Label label="Payee" spacing />
					{paymentType === 'on_account' ? (
						<Form.Item
							name="supplierAccountId"
							rules={[{ required: true, message: 'Supplier is required' }]}
						>
							<Select
								disabled={isSupplierAccountFixed}
								options={supplierSelectOptions}
								placeholder="Select a supplier"
							/>
						</Form.Item>
					) : (
						<Form.Item
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
								options={supplierAutoCompleteOptions}
								placeholder="Select a supplier or type a payee name"
								onChange={handlePayeeAutoCompleteChange}
							/>
						</Form.Item>
					)}

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
												min={0}
												parser={pesoParser}
												placeholder="0.00"
												precision={2}
												onChange={recomputeTotal}
												onFocus={(e) => e.target.select()}
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

					<Label label="Amount" spacing />
					<Form.Item name="amount">
						<InputNumber
							className="w-100"
							controls={false}
							formatter={pesoFormatter}
							parser={pesoParser}
							precision={2}
							readOnly
						/>
					</Form.Item>

					<Label label="Remarks" spacing />
					<Form.Item name="remarks">
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
