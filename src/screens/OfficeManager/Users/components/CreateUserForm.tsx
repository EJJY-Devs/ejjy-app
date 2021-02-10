import { Col, Divider, Row } from 'antd';
import { Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import {
	Button,
	FieldError,
	FormInputLabel,
	FormSelect,
	Label,
} from '../../../../components/elements';
import { userTypes } from '../../../../global/types';
import { sleep } from '../../../../utils/function';

interface ICreateUser {
	username: string;
	password: string;
	confirm_password: string;
	email: string;
	user_type: string;
	first_name: string;
	last_name: string;
	contact_number?: string;
}

interface Props {
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const CreateUserForm = ({ onSubmit, onClose, loading }: Props) => {
	// STATES
	const [isSubmitting, setSubmitting] = useState(false);

	// METHODS
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				username: '',
				password: '',
				confirm_password: '',
				email: '',
				user_type: userTypes.BRANCH_MANAGER,
				first_name: '',
				last_name: '',
				contact_number: null,
			},
			Schema: Yup.object().shape({
				first_name: Yup.string().required().label('First Name'),
				last_name: Yup.string().required().label('Last Name'),
				email: Yup.string().required().email().label('Email'),
				username: Yup.string().required().label('Username'),
				user_type: Yup.string().required().label('User Type'),
				password: Yup.string().required().label('Password'),
				confirm_password: Yup.string()
					.required()
					.oneOf([Yup.ref('password'), null], 'Passwords must match')
					.label('Confirm Password'),
			}),
		}),
		[],
	);

	const userTypeOptions = [
		{
			name: 'Branch Manager',
			value: userTypes.BRANCH_MANAGER,
		},
		{
			name: 'Branch Personel',
			value: userTypes.BRANCH_PERSONNEL,
		},
	];

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: ICreateUser, { resetForm }) => {
				setSubmitting(true);
				await sleep(500);
				setSubmitting(false);

				values.confirm_password = undefined;
				onSubmit(values);
				resetForm();
			}}
			enableReinitialize
		>
			{({ errors, touched }) => (
				<Form className="form">
					<Row gutter={[15, 15]}>
						<Col sm={12} xs={24}>
							<FormInputLabel id="first_name" label="First Name" />
							{errors.first_name && touched.first_name ? (
								<FieldError error={errors.first_name} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel id="last_name" label="Last Name" />
							{errors.last_name && touched.last_name ? (
								<FieldError error={errors.last_name} />
							) : null}
						</Col>

						<Divider dashed />

						<Col sm={12} xs={24}>
							<FormInputLabel id="email" label="Email Address" />
							{errors.email && touched.email ? <FieldError error={errors.email} /> : null}
						</Col>

						<Col sm={12} xs={24}>
							<Label label="Type" spacing />
							<FormSelect id="user_type" options={userTypeOptions} />
							{errors.user_type && touched.user_type ? (
								<FieldError error={errors.user_type} />
							) : null}
						</Col>

						<Divider />

						<Col span={24}>
							<FormInputLabel id="username" label="Username" />
							{errors.username && touched.username ? <FieldError error={errors.username} /> : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel id="password" label="Password" type="password" />
							{errors.password && touched.password ? <FieldError error={errors.password} /> : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel id="confirm_password" label="Confirm Password" type="password" />
							{errors.confirm_password && touched.confirm_password ? (
								<FieldError error={errors.confirm_password} />
							) : null}
						</Col>
					</Row>

					<Divider />

					<div className="custom-footer">
						<Button
							type="button"
							text="Cancel"
							onClick={onClose}
							classNames="mr-10"
							disabled={loading || isSubmitting}
						/>
						<Button
							type="submit"
							text="Create"
							variant="primary"
							loading={loading || isSubmitting}
						/>
					</div>
				</Form>
			)}
		</Formik>
	);
};
