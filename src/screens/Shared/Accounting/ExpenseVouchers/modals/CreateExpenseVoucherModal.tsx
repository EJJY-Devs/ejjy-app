import { AutoComplete, Button, Form, Input, Modal, Radio, Select } from 'antd';
import { Label } from 'components/elements';
import { accountTypes, MAX_PAGE_SIZE } from 'global';
import { useAccounts } from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { getSupplierLabel } from 'screens/Shared/Accounts/components/TabSupplierPurchases/components/SupplierTotalBalance';

import { Cart } from 'screens/Shared/Cart';

interface DetailsFormData {
	payee: string;
	paymentType: 'pay' | 'on_account';
	supplierAccountId?: number;
	invoiceNumber: string;
	remarks: string;
}

interface Props {
	open: boolean;
	initialPayee?: string;
	supplierAccountId?: number;
	onClose: () => void;
}

export const CreateExpenseVoucherModal = ({
	open,
	initialPayee,
	supplierAccountId,
	onClose,
}: Props) => {
	const [step, setStep] = useState<'details' | 'products'>('details');
	const [detailsData, setDetailsData] = useState<DetailsFormData | null>(null);

	const [detailsForm] = Form.useForm();
	const isSupplierAccountFixed = !!supplierAccountId;
	const detailsPaymentType = Form.useWatch('paymentType', detailsForm) || 'pay';

	const { data: accountsData } = useAccounts({
		params: { withSupplierRegistration: true, pageSize: MAX_PAGE_SIZE },
		options: { enabled: open && step === 'details' && !isSupplierAccountFixed },
	});

	const supplierAccounts = useMemo(
		() =>
			(accountsData?.accounts || []).filter(
				(account: any) =>
					[accountTypes.PERSONAL, accountTypes.CORPORATE].includes(
						account.type,
					) && !!account.tax_type,
			),
		[accountsData?.accounts],
	);
	const supplierAutoCompleteOptions = useMemo(
		() =>
			supplierAccounts.map((account: any) => ({
				id: account.id,
				value: getSupplierLabel(account),
			})),
		[supplierAccounts],
	);
	const supplierSelectOptions = useMemo(
		() =>
			supplierAccounts.map((account: any) => ({
				value: account.id,
				label: getSupplierLabel(account),
			})),
		[supplierAccounts],
	);

	useEffect(() => {
		if (!open) {
			setStep('details');
			setDetailsData(null);
			detailsForm.resetFields();
		} else if (initialPayee) {
			detailsForm.setFieldsValue({ payee: initialPayee });
		}
	}, [open, initialPayee]);

	const handlePaymentTypeChange = (value: string) => {
		detailsForm.setFieldsValue({
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
		detailsForm.setFieldsValue({
			supplierAccountId: matched ? matched.id : null,
		});
	};

	const handleDetailsSubmit = async () => {
		const values = await detailsForm.validateFields();

		const effectiveSupplierAccountId = isSupplierAccountFixed
			? supplierAccountId
			: detailsForm.getFieldValue('supplierAccountId');

		const payee =
			values.paymentType === 'on_account'
				? supplierSelectOptions.find(
						(option) => option.value === effectiveSupplierAccountId,
				  )?.label || ''
				: values.payee;

		setDetailsData({
			payee,
			paymentType: values.paymentType,
			// Keep the matched supplier account even for "Pay" vouchers (picked
			// via the payee autocomplete, see handlePayeeAutoCompleteChange) so
			// VAT applicability can still be resolved from the linked account's
			// Tax Type - see isPurchaseVatApplicable. Previously this was
			// dropped for anything but "On Account", so a "Pay" voucher to a
			// registered VAT supplier always printed as VAT Exempt with no VAT
			// computed.
			supplierAccountId: effectiveSupplierAccountId || undefined,
			invoiceNumber: values.invoiceNumber || '',
			remarks: values.remarks || '',
		});
		setStep('products');
	};

	if (open && step === 'details') {
		return (
			<Modal
				footer={null}
				maskClosable={false}
				title="Expense Voucher"
				width={560}
				centered
				closable
				destroyOnClose
				open
				onCancel={onClose}
			>
				<Form
					form={detailsForm}
					initialValues={{ paymentType: 'pay' }}
					layout="vertical"
				>
					<Label label="Type" spacing />
					<Form.Item name="paymentType">
						<Radio.Group
							disabled={isSupplierAccountFixed}
							onChange={(e) => handlePaymentTypeChange(e.target.value)}
						>
							<Radio value="pay">Pay</Radio>
							<Radio value="on_account">On Account</Radio>
						</Radio.Group>
					</Form.Item>

					<Label label="Supplier" spacing />
					{detailsPaymentType === 'on_account' ? (
						<Form.Item
							name="supplierAccountId"
							rules={[{ required: true, message: 'Supplier is required' }]}
						>
							<Select
								disabled={isSupplierAccountFixed}
								filterOption={(inputValue, option) =>
									(option?.label as string)
										?.toLowerCase()
										.includes(inputValue.toLowerCase())
								}
								options={supplierSelectOptions}
								placeholder="Select a supplier"
								showSearch
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

					<Label label="Invoice #" spacing />
					<Form.Item name="invoiceNumber">
						<Input placeholder="Enter invoice number" />
					</Form.Item>

					<Label label="Remarks" spacing />
					<Form.Item name="remarks">
						<Input placeholder="Enter remarks" />
					</Form.Item>
				</Form>

				<div className="ModalCustomFooter">
					<Button htmlType="button" onClick={onClose}>
						Cancel
					</Button>
					<Button type="primary" onClick={handleDetailsSubmit}>
						Next
					</Button>
				</div>
			</Modal>
		);
	}

	// Product-picking + submission step - the actual Cart, same as Create
	// Purchase Voucher. It owns the search/results grid, the F8 Submit
	// button, the authorization prompt, and the create-voucher API call.
	if (open && step === 'products') {
		return (
			<Cart
				expenseVoucherDetails={detailsData || undefined}
				type="Expense Voucher"
				onClose={onClose}
			/>
		);
	}

	return null;
};
