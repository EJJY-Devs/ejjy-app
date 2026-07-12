import { Button, Col, Input, Modal, Row, Select } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import React from 'react';
import { MAX_PAGE_SIZE } from 'global';
import useAccounts from 'hooks/useAccounts';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	isLoading: boolean;
	onSubmit: (formData: any) => void;
	onClose: () => void;
};

const formDetails = {
	defaultValues: {
		supplierAccountId: null,
		supplierName: '',
		overallRemarks: '',
	},
	schema: Yup.object().shape({
		supplierAccountId: Yup.number().required().nullable().label('Supplier'),
		overallRemarks: Yup.string().nullable().label('Remarks').trim(),
	}),
};

const getSupplierName = (account: any) =>
	account.business_name ||
	`${account.first_name || ''} ${account.last_name || ''}`.trim();

export const CreatePurchaseModal = ({
	isLoading,
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

	return (
		<Modal
			footer={null}
			title="Create Purchase"
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
							<Col span={24}>
								<Label label="Supplier" spacing />
								<Select
									className="w-100"
									filterOption={(input, option) =>
										(option?.label as string)
											?.toLowerCase()
											.includes(input.toLowerCase())
									}
									options={supplierAccounts.map((account: any) => ({
										value: account.id,
										label: getSupplierName(account),
									}))}
									placeholder="Select supplier"
									value={values['supplierAccountId']}
									showSearch
									onChange={(value, option: any) => {
										setFieldValue('supplierAccountId', value);
										setFieldValue('supplierName', option?.label || '');
									}}
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
