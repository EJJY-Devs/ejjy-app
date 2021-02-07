import { Divider } from 'antd';
import { Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { Button, FieldError, FormSelect } from '../../../../components/elements';
import { Option } from '../../../../components/elements/Select/Select';
import { sleep } from '../../../../utils/function';

interface ICreateEditUser {
	id: number;
	branch_id: number;
}

interface Props {
	user: any;
	branchOptions: Option[];
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const EditUserForm = ({ user, branchOptions, onSubmit, onClose, loading }: Props) => {
	// STATES
	const [isSubmitting, setSubmitting] = useState(false);

	// METHODS
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				id: user?.id,
				branch_id: user?.branch?.id || null,
			},
			Schema: Yup.object().shape({
				branch_id: Yup.string().required().label('Branch'),
			}),
		}),
		[user],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: ICreateEditUser) => {
				setSubmitting(true);
				await sleep(500);
				setSubmitting(false);

				onSubmit(values);
			}}
			enableReinitialize
		>
			{({ errors, touched }) => (
				<Form className="form">
					<FormSelect id="branch_id" options={branchOptions} />
					{errors.branch_id && touched.branch_id ? <FieldError error={errors.branch_id} /> : null}

					<Divider />

					<div className="custom-footer">
						<Button
							type="button"
							text="Cancel"
							onClick={onClose}
							classNames="mr-10"
							disabled={loading || isSubmitting}
						/>
						<Button type="submit" text="Edit" variant="primary" loading={loading || isSubmitting} />
					</div>
				</Form>
			)}
		</Formik>
	);
};
