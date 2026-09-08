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
	Select,
} from 'antd';
import { Label } from 'components/elements';
import { orderOfPaymentPurposes } from 'global';
import { usePurchases } from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { getLocalApiUrl, formatNumberWithCommas, formatInPeso } from 'utils';

const PAYMENT_METHOD_OPTIONS = [
	{ label: 'Cash', value: 'cash' },
	{ label: 'Check', value: 'check' },
	{ label: 'E-Payment', value: 'e_payment' },
];

const PURPOSE_OPTIONS = [
	{ label: 'Full Payment', value: orderOfPaymentPurposes.FULL_PAYMENT },
	{ label: 'Partial Payment', value: orderOfPaymentPurposes.PARTIAL_PAYMENT },
	{ label: 'Others', value: orderOfPaymentPurposes.OTHERS },
];

interface Props {
	isSubmitting: boolean;
	open: boolean;
	initialPayee: string;
	supplierAccountId: number;
	onClose: () => void;
	onCreate: (values: {
		payee: string;
		particulars: never[];
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
	const purpose = Form.useWatch('purpose', form);

	const { data: purchasesData } = usePurchases({
		params: {
			supplierAccountId,
			journalEntryStatus: 'all',
			pageSize: 100,
		},
		options: { enabled: open && !!supplierAccountId },
	});
	const purchaseAutoCompleteOptions = useMemo(
		() =>
			(purchasesData?.purchases || []).map((purchase: any) => {
				const referenceNumber =
					purchase.reference_number || `PV-${purchase.id}`;

				return {
					id: purchase.id,
					value: referenceNumber,
					label: `${referenceNumber} — ${formatInPeso(purchase.total_amount)}`,
				};
			}),
		[purchasesData?.purchases],
	);

	useEffect(() => {
		if (!open) {
			form.resetFields();
		} else {
			form.setFieldsValue({ payee: initialPayee });
		}
	}, [open, initialPayee]);

	const handlePurchaseAutoCompleteChange = (value: string) => {
		const matched = purchaseAutoCompleteOptions.find(
			(option) => option.value === value,
		);
		form.setFieldsValue({ purchaseId: matched ? matched.id : undefined });
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();

		const remarks =
			values.purpose === orderOfPaymentPurposes.OTHERS
				? values.purposeOthers
				: PURPOSE_OPTIONS.find((option) => option.value === values.purpose)
						?.label || '';

		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: 'Authorize Disbursement Voucher',
			onSuccess: async (authorizedUser) => {
				setAuthorizeConfig(null);
				await onCreate({
					payee: values.payee,
					particulars: [],
					amount: values.amount,
					paymentMethod: values.paymentMethod,
					remarks,
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

					<Label label="Purpose" spacing />
					<Form.Item
						name="purpose"
						rules={[{ required: true, message: 'Purpose is required' }]}
					>
						<Select
							options={PURPOSE_OPTIONS}
							placeholder="Select a purpose"
							onChange={() => form.setFieldsValue({ purposeOthers: '' })}
						/>
					</Form.Item>

					{purpose === orderOfPaymentPurposes.OTHERS && (
						<>
							<Label label="Purpose Description" spacing />
							<Form.Item
								name="purposeOthers"
								rules={[
									{
										required: true,
										message: 'Purpose description is required',
									},
								]}
							>
								<Input placeholder="Enter purpose description" />
							</Form.Item>
						</>
					)}

					<Label label="Purchase Voucher (optional)" spacing />
					<Form.Item name="purchaseReference">
						<AutoComplete
							filterOption={(inputValue, option) =>
								(option?.value as string)
									.toLowerCase()
									.includes(inputValue.toLowerCase())
							}
							options={purchaseAutoCompleteOptions}
							placeholder="Select a purchase voucher to settle or type a reference number (optional)"
							allowClear
							onChange={handlePurchaseAutoCompleteChange}
						/>
					</Form.Item>
					<Form.Item name="purchaseId" hidden>
						<Input />
					</Form.Item>

					<Label label="Amount" spacing />
					<Form.Item
						name="amount"
						rules={[{ required: true, message: 'Amount is required' }]}
					>
						<InputNumber
							className="w-100"
							controls={false}
							formatter={pesoFormatter}
							min={0}
							parser={pesoParser}
							placeholder="0.00"
							precision={2}
							onFocus={(e) => e.target.select()}
						/>
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
