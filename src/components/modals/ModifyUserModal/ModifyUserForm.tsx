import { Button, Col, Divider, Input, Row, Select } from 'antd';
import { filterOption } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { userTypeBranchOptions, userTypeOptions, userTypes } from 'global';
import React, { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { FieldError, Label } from '../../elements';

interface Props {
	user?: any;
	branchUsersOnly?: boolean;
	isLoading: boolean;
	onSubmit: any;
	onClose: any;
}

export const ModifyUserForm = ({
	user,
	branchUsersOnly,
	isLoading,
	onSubmit,
	onClose,
}: Props) => {
	const [passwordFieldsVisible, setPasswordFieldsVisible] = useState(!user);

	// METHODS
	useEffect(() => {
		if (user?.user_type === userTypes.ADMIN) {
			setPasswordFieldsVisible(true);
		}
	}, [user]);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				firstName: user?.first_name || '',
				lastName: user?.last_name || '',
				email: user?.email || '',

				// NOTE: For create user only
				userType: user?.user_type || '',
				username: '',
				password: '',
				confirmPassword: '',
			},
			Schema: Yup.object().shape({
				firstName: Yup.string().required().label('First Name').trim(),
				lastName: Yup.string().required().label('Last Name').trim(),
				email: Yup.string().email().required().email().label('Email').trim(),
				userType: Yup.string().required().label('User Type').trim(),
				username: user
					? undefined
					: Yup.string().required().label('Username').trim(),
				password:
					user && !passwordFieldsVisible
						? undefined
						: Yup.string().required().label('Password').trim(),
				confirmPassword:
					user && !passwordFieldsVisible
						? undefined
						: Yup.string()
								.required()
								.oneOf([Yup.ref('password'), null], 'Passwords must match')
								.label('Confirm Password')
								.trim(),
			}),
		}),
		[passwordFieldsVisible],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit({
					...formData,
					password: passwordFieldsVisible ? formData.password : undefined,
				});
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						{user?.user_type !== userTypes.ADMIN && (
							<>
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
											<Select.Option
												key={userType.value}
												value={userType.value}
											>
												{userType.name}
											</Select.Option>
										))}
									</Select>
									<ErrorMessage
										name="userType"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
							</>
						)}

						{user?.user_type !== userTypes.ADMIN && (
							<>
								{user ? (
									<Col span={24}>
										<Button
											className="d-block mx-auto"
											danger={passwordFieldsVisible}
											type="link"
											onClick={() => {
												setPasswordFieldsVisible((value) => !value);
											}}
										>
											{passwordFieldsVisible ? 'Cancel Edit' : 'Edit'} Password
										</Button>
									</Col>
								) : (
									<>
										<Divider />
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
									</>
								)}
							</>
						)}

						{passwordFieldsVisible && (
							<>
								<Col lg={12}>
									<Label label="Password" spacing />
									<Input.Password
										name="password"
										value={values['password']}
										onChange={(e) => {
											setFieldValue('password', e.target.value);
										}}
									/>
									<ErrorMessage
										name="password"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>

								<Col lg={12}>
									<Label label="Confirm Password" spacing />
									<Input.Password
										name="confirmPassword"
										value={values['confirmPassword']}
										onChange={(e) => {
											setFieldValue('confirmPassword', e.target.value);
										}}
									/>
									<ErrorMessage
										name="confirmPassword"
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
							{user ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
