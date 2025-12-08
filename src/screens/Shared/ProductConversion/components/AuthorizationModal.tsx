import { Modal, Button, Row, Col, Input } from 'antd';
import { RequestErrors } from 'components';
import { FieldError, Label } from 'components/elements';
import { ErrorMessage, Form, Formik } from 'formik';
import React from 'react';
import { useUserAuthenticate } from 'ejjy-global';
import { convertIntoArray, getLocalApiUrl } from 'utils';
import * as Yup from 'yup';

const formDetails = {
	defaultValues: {
		username: '',
		password: '',
	},
	schema: Yup.object().shape({
		username: Yup.string().required().label('Username').trim(),
		password: Yup.string().required().label('Password').trim(),
	}),
};

interface AuthorizationModalProps {
	isLoading: boolean;
	onSubmit: (userId: number) => void;
	onClose: () => void;
}

export const AuthorizationModal = ({
	isLoading,
	onSubmit,
	onClose,
}: AuthorizationModalProps) => {
	const {
		mutateAsync: authenticateUser,
		isLoading: isAuthenticating,
		error: authenticateError,
	} = useUserAuthenticate(null, getLocalApiUrl());

	const handleSubmit = async (formData: any, { setFieldError }) => {
		try {
			// Authenticate user with username and password
			const { data } = await authenticateUser({
				login: formData.username,
				password: formData.password,
			});

			if (data) {
				onSubmit(data.id);
			} else {
				setFieldError('username', 'Authentication failed');
			}
		} catch (error: any) {
			setFieldError('username', 'Invalid username or password');
		}
	};

	return (
		<Modal
			footer={null}
			title="Authorization"
			width={400}
			centered
			closable
			open
			onCancel={onClose}
		>
			<RequestErrors
				errors={[...convertIntoArray(authenticateError?.errors)]}
				withSpaceBottom
			/>

			<Formik
				initialValues={formDetails.defaultValues}
				validationSchema={formDetails.schema}
				onSubmit={handleSubmit}
			>
				{({ values, setFieldValue }) => (
					<Form>
						<Row gutter={[16, 16]}>
							<Col span={24}>
								<Label label="Username" spacing />
								<Input
									placeholder="Enter username"
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

							<Col span={24}>
								<Label label="Password" spacing />
								<Input.Password
									placeholder="Enter password"
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
						</Row>

						<div className="ModalCustomFooter">
							<Button
								disabled={isLoading || isAuthenticating}
								htmlType="button"
								onClick={onClose}
							>
								Cancel
							</Button>
							<Button
								htmlType="submit"
								loading={isLoading || isAuthenticating}
								type="primary"
							>
								Authorize
							</Button>
						</div>
					</Form>
				)}
			</Formik>
		</Modal>
	);
};
