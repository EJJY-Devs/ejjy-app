import { Button, Col, Input, Modal, Row, Select } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import _ from 'lodash';
import * as Yup from 'yup';
import { filterOption, getFullName, ServiceType, useUsers } from 'ejjy-global';
import React from 'react';
import { MAX_PAGE_SIZE } from 'global';
import { getId, getLocalApiUrl, isStandAlone } from 'utils';
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
		supplierName: Yup.string().required().label('Supplier Name').trim(),
		supplierAddress: Yup.string().required().label('Supplier Address').trim(),
		supplierTin: Yup.string().required().label('Supplier TIN').trim(),
		encodedById: Yup.number().nullable().required().label('Encoded By Id'),
		checkedById: Yup.number().nullable().required().label('Checked By Id'),
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
			type: isStandAlone() ? ServiceType.ONLINE : ServiceType.OFFLINE,
		},
	});

	// Conditional schema based on `type`
	const formSchema =
		type === 'Delivery Receipt'
			? Yup.object().shape({
					encodedById: Yup.number().nullable().required().label('Encoder'),
					overallRemarks: Yup.string().required().label('Remarks').trim(),
					customerName: Yup.string().required().label('Customer Name').trim(),
					customerAddress: Yup.string()
						.required()
						.label('Customer Address')
						.trim(),
					customerTin: Yup.string().required().label('Customer TIN').trim(),
			  })
			: formDetails.schema;

	const initialValues =
		type === 'Delivery Receipt'
			? {
					encodedById: null,
					overallRemarks: '',
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
			onCancel={onClose}
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
									<Col span={24}>
										<Label label="Customer TIN" spacing />
										<Input
											name="customerTin"
											value={values['customerTin']}
											onChange={(e) => {
												setFieldValue('customerTin', e.target.value);
											}}
										/>
										<ErrorMessage
											name="customerTin"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
									<Col span={24}>
										<Label label="Remarks" spacing />
										<Input.TextArea
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
								</>
							) : (
								<>
									<Col span={24}>
										<Label label="Supplier Name" spacing />
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
										<Label label="Supplier Address" spacing />
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
										<Label label="Supplier TIN" spacing />
										<Input
											name="supplierTin"
											value={values['supplierTin']}
											onChange={(e) => {
												setFieldValue('supplierTin', e.target.value);
											}}
										/>
										<ErrorMessage
											name="supplierTin"
											render={(error) => <FieldError error={error} />}
										/>
									</Col>
									<Col span={24}>
										<Label id="encodedById" label="Encoded By" spacing />
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
										<Label id="checkedById" label="Checked By" spacing />
										<Select
											className="w-100"
											disabled={isFetchingUsers}
											filterOption={filterOption}
											optionFilterProp="children"
											value={values['checkedById']}
											showSearch
											onChange={(value) => {
												setFieldValue('checkedById', value);
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
											name="checkedById"
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
