import { Button, Col, Input, Modal, Row, Select } from 'antd';
import { RequestErrors } from 'components';
import { filterOption, getFullName, ServiceType, useUsers } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { MAX_PAGE_SIZE } from 'global';
import React from 'react';
import { convertIntoArray, getId, getLocalApiUrl, isStandAlone } from 'utils';
import * as Yup from 'yup';
import { FieldError, Label } from '../../elements';

const formDetails = {
	defaultValues: {
		encodedById: null,
		overallRemarks: '',
	},
	schema: Yup.object().shape({
		encodedById: Yup.number().nullable().required().label('Encoded By Id'),
		overallRemarks: Yup.string().required().label('Overall Remarks').trim(),
	}),
};

interface Props {
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
}

export const CreateStockOutModal = ({
	isLoading,
	onSubmit,
	onClose,
}: Props) => {
	const {
		data: usersData,
		isFetching: isFetchingUsers,
		error: usersError,
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
			title="Stock Out Details"
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors errors={convertIntoArray(usersError)} withSpaceBottom />

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
								<Label label="Encoded By" spacing />
								<Select
									className="w-100"
									disabled={isFetchingUsers}
									filterOption={filterOption}
									loading={isFetchingUsers}
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
								<Label label="Overall Remarks" spacing />
								<Input.TextArea
									rows={2}
									onChange={(e) => {
										setFieldValue('overallRemarks', e.target.value);
									}}
								/>
								<ErrorMessage
									name="overallRemarks"
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
