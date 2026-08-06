import {
	AutoComplete,
	Button,
	Col,
	Input,
	Modal,
	Radio,
	Row,
	Select,
} from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import React, { useMemo } from 'react';
import { MAX_PAGE_SIZE } from 'global';
import useAccounts from 'hooks/useAccounts';
import { getSupplierLabel } from 'screens/Shared/Accounts/components/TabSupplierPurchases/components/SupplierTotalBalance';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	isLoading: boolean;
	isPurchaseOrder?: boolean;
	onSubmit: (formData: any) => void;
	onClose: () => void;
};

const formDetails = {
	defaultValues: {
		paymentType: 'on_account',
		supplierAccountId: null,
		supplierName: '',
		overallRemarks: '',
	},
	schema: Yup.object().shape({
		paymentType: Yup.string()
			.oneOf(['pay', 'on_account'])
			.required()
			.label('Payment Type'),
		supplierAccountId: Yup.number()
			.nullable()
			.label('Supplier')
			.when('paymentType', {
				is: 'on_account',
				then: (schema) =>
					schema.required(
						'Supplier must be an existing account when payment type is On Account',
					),
			}),
		supplierName: Yup.string().trim().required().label('Supplier'),
		overallRemarks: Yup.string().nullable().label('Remarks').trim(),
	}),
};

export const CreatePurchaseVoucherModal = ({
	isLoading,
	isPurchaseOrder = false,
	onSubmit,
	onClose,
}: ModalProps) => {
	const { data: accountsData } = useAccounts({
		params: {
			withSupplierRegistration: true,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const supplierAccounts = accountsData?.accounts || [];

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

	return (
		<Modal
			footer={null}
			title={
				isPurchaseOrder ? 'Create Purchase Order' : 'Create Purchase Voucher'
			}
			width={500}
			centered
			closable
			destroyOnClose
			open
			onCancel={onClose}
		>
			<Formik
				initialValues={formDetails.defaultValues}
				validationSchema={formDetails.schema}
				onSubmit={(formData) => {
					onSubmit(formData);
				}}
			>
				{({ values, setFieldValue, isSubmitting }) => (
					<Form>
						<Row gutter={[16, 16]}>
							{!isPurchaseOrder && (
								<Col span={24}>
									<Label label="Payment Type" spacing />
									<Radio.Group
										value={values['paymentType']}
										onChange={(e) => {
											setFieldValue('paymentType', e.target.value);
											setFieldValue('supplierName', '');
											setFieldValue('supplierAccountId', null);
										}}
									>
										<Radio value="pay">Pay</Radio>
										<Radio value="on_account">On Account</Radio>
									</Radio.Group>
									<ErrorMessage
										name="paymentType"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
							)}

							<Col span={24}>
								<Label label="Supplier" spacing />
								{!isPurchaseOrder && values['paymentType'] === 'on_account' ? (
									<Select
										className="w-100"
										filterOption={(inputValue, option) =>
											(option?.label as string)
												?.toLowerCase()
												.includes(inputValue.toLowerCase())
										}
										options={supplierSelectOptions}
										placeholder="Select a supplier"
										value={values['supplierAccountId']}
										showSearch
										onChange={(value) => {
											setFieldValue('supplierAccountId', value);

											const matched = supplierSelectOptions.find(
												(option) => option.value === value,
											);
											setFieldValue(
												'supplierName',
												matched ? matched.label : '',
											);
										}}
									/>
								) : (
									<AutoComplete
										className="w-100"
										filterOption={(inputValue, option) =>
											(option?.value as string)
												?.toLowerCase()
												.includes(inputValue.toLowerCase())
										}
										options={supplierAutoCompleteOptions}
										placeholder="Select a supplier or type a name"
										value={values['supplierName']}
										onChange={(value) => {
											setFieldValue('supplierName', value);

											const matched = supplierAutoCompleteOptions.find(
												(option) => option.value === value,
											);
											setFieldValue(
												'supplierAccountId',
												matched ? matched.id : null,
											);
										}}
									/>
								)}
								<ErrorMessage
									name="supplierName"
									render={(error) => <FieldError error={error} />}
								/>
								<ErrorMessage
									name="supplierAccountId"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>

							<Col span={24}>
								<Label label="Remarks" spacing />
								<Input
									name="overallRemarks"
									value={values['overallRemarks']}
									onChange={(e) =>
										setFieldValue('overallRemarks', e.target.value)
									}
								/>
								<ErrorMessage
									name="overallRemarks"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						</Row>

						<div className="ModalCustomFooter">
							<Button
								disabled={isLoading || isSubmitting}
								htmlType="button"
								onClick={onClose}
							>
								Cancel
							</Button>
							<Button
								disabled={isLoading || isSubmitting}
								htmlType="submit"
								loading={isLoading || isSubmitting}
								type="primary"
							>
								Submit
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</Modal>
	);
};
