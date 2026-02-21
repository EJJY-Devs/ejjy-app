import { Button, Col, Input, Row } from 'antd';
import { RequestErrors } from 'components';
import { FieldError, Label } from 'components/elements';
import { ErrorMessage, Form, Formik } from 'formik';
import React from 'react';
import { convertIntoArray } from 'utils';
import * as Yup from 'yup';
import '../style.scss';

const FormDetails = {
	DefaultValues: {
		pin: '',
	},
	Schema: Yup.object().shape({
		pin: Yup.string().required().label('PIN').trim().max(6),
	}),
};

interface Props {
	errors: string[];
	loading: boolean;
	onSubmit: any;
}

export const LoginForm = ({ errors, loading, onSubmit }: Props) => (
	<>
		<RequestErrors errors={convertIntoArray(errors)} withSpaceBottom />

		<Formik
			initialValues={FormDetails.DefaultValues}
			validationSchema={FormDetails.Schema}
			onSubmit={(formData) => {
				onSubmit(formData);
			}}
		>
			{({ values, setFieldValue }) => (
				<Form className="w-100">
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label="PIN" spacing />
							<Input.Password
								inputMode="numeric"
								maxLength={6}
								value={values['pin']}
								onChange={(e) => {
									setFieldValue('pin', e.target.value);
								}}
							/>
							<ErrorMessage
								name="pin"
								render={(error) => <FieldError error={error} withSpaceTop />}
							/>
						</Col>

						<Col span={24}>
							<Button
								className="mt-2"
								htmlType="submit"
								loading={loading}
								type="primary"
								block
							>
								Login
							</Button>
						</Col>
					</Row>
				</Form>
			)}
		</Formik>
	</>
);
