import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import {
	AutoComplete,
	Button,
	Descriptions,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Radio,
	Select,
	Table,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Label } from 'components/elements';
import { MAX_PAGE_SIZE } from 'global';
import { useAccounts } from 'hooks';
import useExpenseVouchers from 'hooks/useExpenseVouchers';
import React, { useEffect, useMemo, useState } from 'react';
import { getSupplierLabel } from 'screens/Shared/Accounts/components/TabSupplierPurchases/components/SupplierTotalBalance';
import { getLocalApiUrl, formatNumberWithCommas } from 'utils';

interface Particular {
	description: string;
	amount: number;
	type: 'V' | 'VE';
}

interface DetailsFormData {
	payee: string;
	paymentType: 'pay' | 'on_account';
	supplierAccountId?: number;
	invoiceNumber: string;
	remarks: string;
}

interface Props {
	isSubmitting: boolean;
	open: boolean;
	initialPayee?: string;
	supplierAccountId?: number;
	onClose: () => void;
	onCreate: (values: {
		payee: string;
		invoiceNumber: string;
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

const typeOptions = [
	{ value: 'V', label: 'Vatable' },
	{ value: 'VE', label: 'Vat Exempt' },
];

export const CreateExpenseVoucherModal = ({
	isSubmitting,
	open,
	initialPayee,
	supplierAccountId,
	onClose,
	onCreate,
}: Props) => {
	const [step, setStep] = useState<'details' | 'particulars'>('details');
	const [detailsData, setDetailsData] = useState<DetailsFormData | null>(null);
	const [searchText, setSearchText] = useState('');
	const [particularsForm] = Form.useForm();
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	const [detailsForm] = Form.useForm();
	const isSupplierAccountFixed = !!supplierAccountId;
	const detailsPaymentType = Form.useWatch('paymentType', detailsForm) || 'pay';

	const { data: accountsData } = useAccounts({
		params: { withSupplierRegistration: true, pageSize: MAX_PAGE_SIZE },
		options: { enabled: open && step === 'details' && !isSupplierAccountFixed },
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

	// Options for the particulars search bar - past descriptions used across
	// previously created expense vouchers, so a recurring particular (e.g.
	// "Electric Bill") can be found and re-added instead of retyped.
	const { data: historyData } = useExpenseVouchers({
		params: { pageSize: MAX_PAGE_SIZE, journalEntryStatus: 'all' },
		options: { enabled: open && step === 'particulars' },
	});
	const particularSearchOptions = useMemo(() => {
		const descriptions = new Set<string>();
		(historyData?.expenseVouchers || []).forEach((voucher: any) => {
			(voucher.particulars || []).forEach((particular: any) => {
				if (particular.description) {
					descriptions.add(particular.description);
				}
			});
		});
		return Array.from(descriptions).map((value) => ({ value }));
	}, [historyData]);

	useEffect(() => {
		if (!open) {
			setStep('details');
			setDetailsData(null);
			setSearchText('');
			detailsForm.resetFields();
			particularsForm.resetFields();
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
			: values.supplierAccountId;

		const payee =
			values.paymentType === 'on_account'
				? supplierSelectOptions.find(
						(option) => option.value === effectiveSupplierAccountId,
				  )?.label || ''
				: values.payee;

		setDetailsData({
			payee,
			paymentType: values.paymentType,
			supplierAccountId:
				values.paymentType === 'on_account'
					? effectiveSupplierAccountId
					: undefined,
			invoiceNumber: values.invoiceNumber || '',
			remarks: values.remarks || '',
		});
		setStep('particulars');
	};

	const recomputeTotal = () => {
		const particulars: Particular[] =
			particularsForm.getFieldValue('particulars') || [];
		const total = particulars.reduce(
			(sum, item) => sum + (Number(item?.amount) || 0),
			0,
		);
		particularsForm.setFieldsValue({ amount: total });
	};

	const handleAddParticular = (
		description: string,
		add: (item: Particular) => void,
	) => {
		if (!description.trim()) return;
		add({ description: description.trim(), type: 'V', amount: 0 });
		setSearchText('');
	};

	const handleBackToDetails = () => setStep('details');

	const handleClose = () => {
		const currentParticulars = particularsForm.getFieldValue('particulars');
		if (currentParticulars?.length > 0) {
			Modal.confirm({
				title: 'Warning',
				content:
					'Closing this will discard the particulars you already entered. Are you sure you want to continue?',
				okText: 'Confirm',
				cancelText: 'Cancel',
				autoFocusButton: 'ok',
				onOk: onClose,
			});
			return;
		}
		onClose();
	};

	const handleParticularsSubmit = async () => {
		const values = await particularsForm.validateFields();

		if (!values.particulars?.length) {
			message.error('Please add at least one particular.');
			return;
		}

		if (!detailsData) return;

		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: 'Authorize Expense Voucher',
			onSuccess: async (authorizedUser) => {
				setAuthorizeConfig(null);
				await onCreate({
					payee: detailsData.payee,
					invoiceNumber: detailsData.invoiceNumber,
					paymentType: detailsData.paymentType,
					particulars: values.particulars || [],
					amount: values.amount,
					remarks: detailsData.remarks,
					authorizerId: authorizedUser.id,
					supplierAccountId: detailsData.supplierAccountId,
				});
			},
			onCancel: () => setAuthorizeConfig(null),
		});
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

	const columns: ColumnsType<any> = [
		{
			title: 'Particular',
			dataIndex: 'description',
			render: (_value, field: any) => (
				<Form.Item
					name={[field.name, 'description']}
					rules={[{ required: true, message: 'Required' }]}
					style={{ marginBottom: 0 }}
				>
					<Input placeholder="Enter particular" />
				</Form.Item>
			),
		},
		{
			title: 'Type',
			dataIndex: 'type',
			width: 150,
			render: (_value, field: any) => (
				<Form.Item name={[field.name, 'type']} style={{ marginBottom: 0 }}>
					<Select options={typeOptions} />
				</Form.Item>
			),
		},
		{
			title: 'Amount',
			dataIndex: 'amount',
			width: 180,
			render: (_value, field: any) => (
				<Form.Item
					name={[field.name, 'amount']}
					rules={[{ required: true, message: 'Required' }]}
					style={{ marginBottom: 0 }}
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
			),
		},
		{
			title: '',
			key: 'action',
			width: 50,
			render: () => null,
		},
	];

	return (
		<>
			<Modal
				footer={null}
				maskClosable={false}
				open={open && step === 'particulars'}
				title="Expense Voucher"
				width={760}
				centered
				closable
				destroyOnClose
				onCancel={handleClose}
			>
				{detailsData && (
					<Descriptions className="mb-4" column={2} size="small" bordered>
						<Descriptions.Item label="Payee">
							{detailsData.payee}
						</Descriptions.Item>
						<Descriptions.Item label="Type">
							{detailsData.paymentType === 'on_account' ? 'On Account' : 'Pay'}
						</Descriptions.Item>
						<Descriptions.Item label="Invoice #">
							{detailsData.invoiceNumber || '—'}
						</Descriptions.Item>
						<Descriptions.Item label="Remarks">
							{detailsData.remarks || '—'}
						</Descriptions.Item>
					</Descriptions>
				)}
				<Button
					className="mb-4"
					size="small"
					type="link"
					onClick={handleBackToDetails}
				>
					Edit Details
				</Button>

				<Form
					form={particularsForm}
					initialValues={{ particulars: [], amount: 0 }}
					layout="vertical"
				>
					<Form.List name="particulars">
						{(fields, { add, remove }) => (
							<>
								<Label label="Search Particular" spacing />
								<div className="d-flex mb-4" style={{ gap: 8 }}>
									<AutoComplete
										className="w-100"
										filterOption={(inputValue, option) =>
											(option?.value as string)
												?.toLowerCase()
												.includes(inputValue.toLowerCase())
										}
										options={particularSearchOptions}
										placeholder="Search a previous particular or type a new one"
										value={searchText}
										onChange={setSearchText}
										onSelect={(value) => handleAddParticular(value, add)}
									/>
									<Button
										disabled={!searchText.trim()}
										icon={<PlusOutlined />}
										onClick={() => handleAddParticular(searchText, add)}
									>
										Add
									</Button>
								</div>

								<Table
									columns={columns.map((column) =>
										column.key === 'action'
											? {
													...column,
													render: (_value: any, field: any) => (
														<Button
															icon={<MinusCircleOutlined />}
															type="text"
															danger
															onClick={() => {
																remove(field.name);
																recomputeTotal();
															}}
														/>
													),
											  }
											: column,
									)}
									dataSource={fields}
									locale={{
										emptyText:
											'No particulars yet. Search above or add one manually.',
									}}
									pagination={false}
									rowKey="key"
									size="small"
									bordered
								/>

								<Button
									className="mt-4 mb-4"
									icon={<PlusOutlined />}
									type="dashed"
									block
									onClick={() => add({ description: '', amount: 0, type: 'V' })}
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
				</Form>

				<div className="ModalCustomFooter">
					<Button htmlType="button" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						htmlType="button"
						loading={isSubmitting}
						type="primary"
						onClick={handleParticularsSubmit}
					>
						Submit
					</Button>
				</div>
			</Modal>

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</>
	);
};
