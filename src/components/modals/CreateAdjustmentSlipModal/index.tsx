import { Button, Col, Modal, Row, Select } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { filterOption, getFullName, ServiceType, useUsers } from 'ejjy-global';
import React from 'react';
import { MAX_PAGE_SIZE } from 'global';
import { getLocalApiUrl } from 'utils';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
};

const formDetails = {
	defaultValues: {
		encodedById: null,
	},
	schema: Yup.object().shape({
		encodedById: Yup.number().nullable().required().label('Encoder'),
	}),
};

export const CreateAdjustmentSlipModal = ({
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

	return (
		<Modal
			footer={null}
			title="Create Adjustment Slip"
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
					onClose();
				}}
			>
				{({ values, setFieldValue }) => (
					<Form>
						<Row gutter={[16, 16]}>
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
										const { id } = user;
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
