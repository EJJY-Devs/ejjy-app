import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { Button, Form, Input, InputNumber, Modal, Select } from 'antd';
import { Label } from 'components/elements';
import { usePurchases } from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { getLocalApiUrl, formatNumberWithCommas, formatInPeso } from 'utils';

interface Particular {
	description: string;
	amount: number;
}

const PAYMENT_METHOD_OPTIONS = [
	{ label: 'Cash', value: 'cash' },
	{ label: 'Check', value: 'check' },
	{ label: 'E-Payment', value: 'e_payment' },
];

interface Props {
	isSubmitting: boolean;
	open: boolean;
	initialPayee: string;
	supplierAccountId: number;
	onClose: () => void;
	onCreate: (values: {
		payee: string;
		particulars: Particular[];
		amount: number;
		paymentMethod: string;
		remarks: string;
		authorizerId: number;
		supplierAccountId: number;
		purchaseId?: number;
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

export const CreateDisbursementVoucherModal = ({
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

	const { data: purchasesData } = usePurchases({
		params: {
			supplierAccountId,
			journalEntryStatus: 'all',
			pageSize: 100,
		},
		options: { enabled: open && !!supplierAccountId },
	});
	const purchaseOptions = useMemo(
		() =>
			(purchasesData?.purchases || []).map((purchase: any) => ({
				label: `${
					purchase.reference_number || `PV-${purchase.id}`
				} — ${formatInPeso(purchase.total_amount)}`,
				value: purchase.id,
			})),
		[purchasesData?.purchases],
	);

	useEffect(() => {
		if (!open) {
			form.resetFields();
		} else {
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

	const handleSubmit = async () => {
		const values = await form.validateFields();

		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: 'Authorize Disbursement Voucher',
			onSuccess: async (authorizedUser) => {
				setAuthorizeConfig(null);
				await onCreate({
					payee: values.payee,
					particulars: values.particulars || [],
					amount: values.amount,
					paymentMethod: values.paymentMethod,
					remarks: values.remarks || '',
					authorizerId: authorizedUser.id,
					supplierAccountId,
					purchaseId: values.purchaseId,
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
				title="Disbursement Voucher"
				width={560}
				centered
				closable
				destroyOnClose
				onCancel={onClose}
			>
				<Form
					form={form}
					initialValues={{
						particulars: [{ description: '', amount: 0 }],
						paymentMethod: 'cash',
					}}
					layout="vertical"
				>
					<Label label="Payee" spacing />
					<Form.Item name="payee">
						<Input disabled />
					</Form.Item>

					<Label label="Payment Method" spacing />
					<Form.Item name="paymentMethod">
						<Select options={PAYMENT_METHOD_OPTIONS} />
					</Form.Item>

					<Label label="Purchase Voucher (optional)" spacing />
					<Form.Item name="purchaseId">
						<Select
							options={purchaseOptions}
							placeholder="Select a purchase voucher to settle (optional)"
							allowClear
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
