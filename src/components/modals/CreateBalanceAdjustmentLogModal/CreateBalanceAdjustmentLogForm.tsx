import { Col, Input, Row, Button } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import { ADMIN_PASSWORD, unitOfMeasurementTypes } from 'global';
import { isInteger } from 'lodash';
import React, { useCallback } from 'react';
import * as Yup from 'yup';
import { FieldError, Label } from '../../elements';

interface Props {
	branchProduct: any;
	onSubmit: any;
	onClose: any;
	isLoading: boolean;
}

export const CreateBalanceAdjustmentLogForm = ({
	branchProduct,
	onSubmit,
	onClose,
	isLoading,
}: Props) => {
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				newBalance: '',
				password: '',
			},
			Schema: Yup.object().shape({
				newBalance: Yup.number()
					.required()
					.min(0)
					.test(
						'is-whole-number',
						'Non-weighing items require whole number quantity.',
						(value) =>
							branchProduct.product.unit_of_measurement ===
							unitOfMeasurementTypes.NON_WEIGHING
								? isInteger(Number(value))
								: true,
					)
					.label('New Balance'),
			}),
		}),
		[branchProduct],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={async (formData, { setFieldError }) => {
				if (formData.password === ADMIN_PASSWORD) {
					onSubmit(formData);
				} else {
					setFieldError('password', 'Incorrect admin password.');
				}
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label="New Balance" spacing />
							<Input
								type="number"
								value={values.newBalance}
								onChange={(e) => {
									setFieldValue('newBalance', e.target.value);
								}}
							/>
							<ErrorMessage
								name="newBalance"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col span={24}>
							<Label label="Admin Password" spacing />
							<Input.Password
								type="password"
								value={values['password']}
								onChange={(e) => {
									setFieldValue('password', e.target.value);
								}}
							/>
							<ErrorMessage
								name="password"
								render={(error) => <FieldError error={error} withSpaceTop />}
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
	);
};
