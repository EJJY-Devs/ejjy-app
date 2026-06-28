import { AutoComplete, Button, Col, Input, Modal, Row } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import React, { useState } from 'react';
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
		supplierName: '',
		overallRemarks: '',
	},
	schema: Yup.object().shape({
		supplierName: Yup.string().required().label('Supplier Name').trim(),
		overallRemarks: Yup.string().nullable().label('Remarks').trim(),
	}),
};

export const CreatePurchaseModal = ({
	isLoading,
	onSubmit,
	onClose,
}: ModalProps) => {
	const [supplierSearch, setSupplierSearch] = useState('');

	const { data: accountsData } = useAccounts({
		params: {
			withSupplierRegistration: true,
			pageSize: MAX_PAGE_SIZE,
		},
	});

	const supplierOptions = (accountsData?.accounts || [])
		.map((account: any) => {
			const name =
				account.business_name ||
				`${account.first_name || ''} ${account.last_name || ''}`.trim();
			return name ? { value: name } : null;
		})
		.filter(Boolean)
		.filter((opt: any) =>
			opt.value.toLowerCase().includes(supplierSearch.toLowerCase()),
		);

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
								<Label label="Supplier Name" spacing />
								<AutoComplete
									className="w-100"
									options={supplierOptions}
									placeholder="Type or select supplier"
									value={values['supplierName']}
									onSearch={(text) => {
										setSupplierSearch(text);
										setFieldValue('supplierName', text);
									}}
									onSelect={(value) => setFieldValue('supplierName', value)}
								/>
								<ErrorMessage
									name="supplierName"
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
