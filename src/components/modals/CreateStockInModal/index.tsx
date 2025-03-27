import { Button, Col, Input, Modal, Row, Select } from 'antd';
import { RequestErrors } from 'components/RequestErrors';
import { filterOption, getFullName, ServiceType, useUsers } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { MAX_PAGE_SIZE } from 'global';
import React from 'react';
import { convertIntoArray, getId, getLocalApiUrl } from 'utils';
import * as Yup from 'yup';
import { FieldError, Label } from '../../elements';

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

type Props = {
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
};

export const CreateStockInModal = ({ isLoading, onSubmit, onClose }: Props) => {
	// CUSTOM HOOKS
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: userError,
	} = useUsers({
		params: { pageSize: MAX_PAGE_SIZE },
		serviceOptions: {
			baseURL: getLocalApiUrl(),
			type: ServiceType.ONLINE,
		},
	});

	return (
		<Modal
			footer={null}
			title="Stock In Details"
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors errors={convertIntoArray(userError)} withSpaceBottom />

			<Formik
				initialValues={formDetails.defaultValues}
				validationSchema={formDetails.schema}
				onSubmit={(formData) => {
					onSubmit(formData);
				}}
			>
				{({ values, setFieldValue }) => (
					<Form>
						<Row gutter={[16, 16]}>
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
