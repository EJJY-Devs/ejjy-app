import { Button, Col, Input, Modal, Row, Select } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { filterOption, getFullName, ServiceType, useUsers } from 'ejjy-global';
import React from 'react';
import { MAX_PAGE_SIZE } from 'global';
import { getId, getLocalApiUrl } from 'utils';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	type: string;
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
};

const formDetails = {
	defaultValues: {
		supplierName: '',
		supplierAddress: '',
		supplierTin: '',
		encodedById: null,
		checkedById: null,
	},
	schema: Yup.object().shape({
		supplierName: Yup.string().required().label('Vendor Name').trim(),
		supplierAddress: Yup.string().label('Vendor Address').trim(),
		encodedById: Yup.number().nullable().required().label('Encoded By Id'),
		checkedById: Yup.number().nullable().label('Checked By Id'),
	}),
};

export const CreateInventoryTransferModal = ({
	type,
	isLoading,
	onSubmit,
	onClose,
}: ModalProps) => {
	// CUSTOM HOOKS
	const { data: usersData, isFetching: isFetchingUsers } = useUsers({
		params: { pageSize: MAX_PAGE_SIZE },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: ServiceType.ONLINE,
		},
	});

	// Conditional schema based on `type`
	const formSchema =
		type === 'Delivery Receipt'
			? Yup.object().shape({
					encodedById: Yup.number().nullable().required().label('Encoder'),
					overallRemarks: Yup.string().nullable().label('Remarks').trim(),
					customerName: Yup.string().required().label('Customer Name').trim(),
					customerAddress: Yup.string().label('Customer Address').trim(),
					customerTin: Yup.string().label('Customer TIN').trim(),
			  })
			: formDetails.schema;

	const initialValues =
		type === 'Delivery Receipt'
			? {
					encodedById: null,
					customerName: '',
					customerAddress: '',
					customerTin: '',
			  }
			: formDetails.defaultValues;

	return (
		<Modal
			footer={null}
			title={`Create ${type}`}
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
				onSubmit={(formData) => {
					onSubmit(formData);
					onClose();
				}}
			>
				{({ values, setFieldValue }) => (
					<Form>
						<Row gutter={[16, 16]}>
							{/* Render different fields based on `type` */}
							{type === 'Delivery Receipt' ? (
								<>
									<Col span={24}>
										<Label id="encodedById" label="Encoder" spacing />
										<Select
											className="w-100"
											disabled={isFetchingUsers}
											filterOption={filterOption}
											optionFilterProp="children"
											value={values['encodedById']}
											showSearch
											onChange={(value) => {
												setFieldValue('encodedById', value);
											}}
										>
											{usersData?.list.map((user) => {
												const id = getId(user);
												return id ? (
													<Select.Option key={id} value={id}>
														{getFullName(user)}
													</Select.Option>
												) : null;
											})}
										</Select>
										<ErrorMessage
											name="encodedById"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>

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
										<Label id="encodedById" label="Encoder" spacing />
										<Select
											className="w-100"
											disabled={isFetchingUsers}
											filterOption={filterOption}
											optionFilterProp="children"
											value={values['encodedById']}
											showSearch
											onChange={(value) => {
												setFieldValue('encodedById', value);
											}}
										>
											{usersData?.list.map((user) => {
												const id = getId(user);
												return id ? (
													<Select.Option key={id} value={id}>
														{getFullName(user)}
													</Select.Option>
												) : null;
											})}
										</Select>
										<ErrorMessage
											name="encodedById"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
								</>
							)}
						</Row>

						<div className="ModalCustomFooter">
							<Button disabled={isLoading} htmlType="button" onClick={onClose}>
								Cancel
							</Button>
							<Button htmlType="submit" loading={isLoading} type="primary">
								Submit
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</Modal>
	);
};
