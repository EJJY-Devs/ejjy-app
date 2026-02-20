import { Button, Col, Input, Row, Select } from 'antd';
import { filterOption } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { userTypeBranchOptions, userTypeOptions, userTypes } from 'global';
import React, { useCallback } from 'react';
import * as Yup from 'yup';
import { FieldError, Label } from '../../elements';

interface Props {
	user?: any;
	account?: any;
	branchUsersOnly?: boolean;
	isLoading: boolean;
	onSubmit: any;
	onClose: any;
}

export const ModifyUserForm = ({
	user,
	account,
	branchUsersOnly,
	isLoading,
	onSubmit,
	onClose,
}: Props) => {
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				firstName: user?.first_name || account?.first_name || '',
				lastName: user?.last_name || account?.last_name || '',
				email: user?.email || account?.email_address || '',
				username: user?.username || '',

				userType: user?.user_type || '',
			},
			Schema: Yup.object().shape({
				firstName: Yup.string().required().label('First Name').trim(),
				lastName: Yup.string().required().label('Last Name').trim(),
				email: Yup.string().email().required().email().label('Email').trim(),
				userType: Yup.string().required().label('User Type').trim(),
				username: Yup.string().required().label('Username').trim(),
			}),
		}),
		[user, account],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit(formData);
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label="First Name" spacing />
							<Input
								value={values['firstName']}
								onChange={(e) => {
									setFieldValue('firstName', e.target.value);
								}}
							/>
							<ErrorMessage
								name="firstName"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Last Name" spacing />
							<Input
								value={values['lastName']}
								onChange={(e) => {
									setFieldValue('lastName', e.target.value);
								}}
							/>
							<ErrorMessage
								name="lastName"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Email Address" spacing />
							<Input
								type="email"
								value={values['email']}
								onChange={(e) => {
									setFieldValue('email', e.target.value);
								}}
							/>
							<ErrorMessage
								name="email"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						{user?.user_type !== userTypes.ADMIN && (
							<Col span={24}>
								<Label label="User Type" spacing />
								<Select
									allowClear={false}
									className="w-100"
									filterOption={filterOption}
									optionFilterProp="children"
									value={values.userType}
									showSearch
									onChange={(value) => {
										setFieldValue('userType', value);
									}}
								>
									{(branchUsersOnly
										? userTypeBranchOptions
										: userTypeOptions
									).map((userType) => (
										<Select.Option key={userType.value} value={userType.value}>
											{userType.name}
										</Select.Option>
									))}
								</Select>
								<ErrorMessage
									name="userType"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						)}

						<Col span={24}>
							<Label label="Username" spacing />
							<Input
								name="username"
								value={values['username']}
								onChange={(e) => {
									setFieldValue('username', e.target.value);
								}}
							/>
							<ErrorMessage
								name="username"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							{user ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
