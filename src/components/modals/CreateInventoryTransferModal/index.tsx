import { Button, Col, Input, Modal, Row } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import React from 'react';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	type: string;
	isLoading: boolean;
	onSubmit: (formData) => Promise<void>;
	onClose: () => void;
};

const formDetails = {
	defaultValues: {
		supplierName: '',
		supplierAddress: '',
		supplierTin: '',
		checkedById: null,
		overallRemarks: '',
	},
	schema: Yup.object().shape({
		supplierName: Yup.string().required().label('Vendor Name').trim(),
		supplierAddress: Yup.string().label('Vendor Address').trim(),
		checkedById: Yup.number().nullable().label('Checked By Id'),
		overallRemarks: Yup.string().nullable().label('Remarks').trim(),
	}),
};

export const CreateInventoryTransferModal = ({
	type,
	isLoading,
	onSubmit,
	onClose,
}: ModalProps) => {
	// Conditional schema based on `type`
	const formSchema =
		type === 'Delivery Receipt'
			? Yup.object().shape({
					overallRemarks: Yup.string().nullable().label('Remarks').trim(),
					customerName: Yup.string().required().label('Customer Name').trim(),
					customerAddress: Yup.string().label('Customer Address').trim(),
					customerTin: Yup.string().label('Customer TIN').trim(),
			  })
			: formDetails.schema;

	const initialValues =
		type === 'Delivery Receipt'
			? {
					customerName: '',
					customerAddress: '',
					customerTin: '',
			  }
			: formDetails.defaultValues;

	return (
		<Modal
			footer={null}
			title={`Create ${type}`}
			centered
			closable
			destroyOnClose
			open
			onCancel={() => {
				onClose();
			}}
		>
			<Formik
				initialValues={initialValues}
				validationSchema={formSchema}
				onSubmit={async (formData) => {
					await onSubmit(formData);
					onClose();
				}}
			>
				{({ values, setFieldValue, isSubmitting }) => (
					<Form>
						<Row gutter={[16, 16]}>
							{/* Render different fields based on `type` */}
							{type === 'Delivery Receipt' ? (
								<>
									<Col span={24}>
										<Label label="Customer Name" spacing />
										<Input
											name="customerName"
											value={values['customerName']}
											onChange={(e) => {
												setFieldValue('customerName', e.target.value);
											}}
										/>
										<ErrorMessage
											name="customerName"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
									<Col span={24}>
										<Label label="Customer Address" spacing />
										<Input
											name="customerAddress"
											value={values['customerAddress']}
											onChange={(e) => {
												setFieldValue('customerAddress', e.target.value);
											}}
										/>
										<ErrorMessage
											name="customerAddress"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
									<Col span={24}>
										<Label label="Remarks" spacing />
										<Input
											name="overallRemarks"
											value={values['overallRemarks']}
											onChange={(e) => {
												setFieldValue('overallRemarks', e.target.value);
											}}
										/>
										<ErrorMessage
											name="overallRemarks"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
								</>
							) : (
								<>
									<Col span={24}>
										<Label label="Vendor Name" spacing />
										<Input
											name="supplierName"
											value={values['supplierName']}
											onChange={(e) => {
												setFieldValue('supplierName', e.target.value);
											}}
										/>
										<ErrorMessage
											name="supplierName"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
									<Col span={24}>
										<Label label="Vendor Address" spacing />
										<Input
											name="supplierAddress"
											value={values['supplierAddress']}
											onChange={(e) => {
												setFieldValue('supplierAddress', e.target.value);
											}}
										/>
										<ErrorMessage
											name="supplierAddress"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
									<Col span={24}>
										<Label label="Remarks" spacing />
										<Input
											name="overallRemarks"
											value={values['overallRemarks']}
											onChange={(e) => {
												setFieldValue('overallRemarks', e.target.value);
											}}
										/>
										<ErrorMessage
											name="overallRemarks"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
								</>
							)}
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
