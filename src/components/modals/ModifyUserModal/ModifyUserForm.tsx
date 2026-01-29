import { Button, Col, Divider, Input, Row, Select } from 'antd';
import { filterOption } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { userTypeBranchOptions, userTypeOptions, userTypes } from 'global';
import React, { useCallback, useState } from 'react';
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
	const [passwordFieldsVisible, setPasswordFieldsVisible] = useState(!user);
	const [pinFieldVisible, setPinFieldVisible] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				firstName: user?.first_name || account?.first_name || '',
				lastName: user?.last_name || account?.last_name || '',
				email: user?.email || account?.email_address || '',
				username: user?.username || '',
				pin: user?.pin || '',
				confirmPin: '',

				// NOTE: For create user only
				userType: user?.user_type || '',
				password: '',
				confirmPassword: '',
			},
			Schema: Yup.object().shape({
				firstName: Yup.string().required().label('First Name').trim(),
				lastName: Yup.string().required().label('Last Name').trim(),
				email: Yup.string().email().required().email().label('Email').trim(),
				userType: Yup.string().required().label('User Type').trim(),
				username: Yup.string().required().label('Username').trim(),
				pin:
					pinFieldVisible || !user
						? Yup.string()
								.matches(/^[0-9]+$/, 'PIN must only contain numbers')
								.min(4, 'PIN must be at least 4 digits')
								.max(6, 'PIN must be at most 6 digits')
								.label('PIN')
						: undefined,
				confirmPin:
					pinFieldVisible || !user
						? Yup.string()
								.required()
								.oneOf([Yup.ref('pin'), null], 'PINs must match')
								.label('Confirm PIN')
						: undefined,
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
		[passwordFieldsVisible, pinFieldVisible, user, account],
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
					pin: pinFieldVisible || !user ? formData.pin : undefined,
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

						{user?.user_type !== userTypes.ADMIN && <>{!user && <Divider />}</>}

						{user && (
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

						{user && (
							<Col span={24}>
								<Button
									className="d-block mx-auto"
									danger={pinFieldVisible}
									type="link"
									onClick={() => {
										setPinFieldVisible((value) => !value);
									}}
								>
									{pinFieldVisible ? 'Cancel Edit' : 'Edit'} PIN
								</Button>
							</Col>
						)}

						{pinFieldVisible || !user ? (
							<>
								<Col lg={12} span={24}>
									<Label label="PIN (4-6 digits)" spacing />
									<Input.Password
										maxLength={6}
										name="pin"
										placeholder="Enter PIN"
										value={values['pin']}
										onChange={(e) => {
											// Only allow numbers
											const value = e.target.value.replace(/\D/g, '');
											setFieldValue('pin', value);
										}}
									/>
									<ErrorMessage
										name="pin"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>

								<Col lg={12} span={24}>
									<Label label="Confirm PIN" spacing />
									<Input.Password
										maxLength={6}
										name="confirmPin"
										placeholder="Confirm PIN"
										value={values['confirmPin']}
										onChange={(e) => {
											// Only allow numbers
											const value = e.target.value.replace(/\D/g, '');
											setFieldValue('confirmPin', value);
										}}
									/>
									<ErrorMessage
										name="confirmPin"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
							</>
						) : null}
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
