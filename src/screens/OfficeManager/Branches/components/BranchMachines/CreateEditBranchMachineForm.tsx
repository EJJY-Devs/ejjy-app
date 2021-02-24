import { Col, Divider } from 'antd';
import { Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { DetailsRow } from '../../../../../components';
import { Button, FieldError, FormInputLabel } from '../../../../../components/elements';
import { sleep } from '../../../../../utils/function';

interface ICreateEditBranchMachine {
	id?: number;
	branchId?: number;
	name: string;
	machine_id: string;
	machine_printer_serial_number: string;
}

interface Props {
	branchMachine?: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const CreateEditBranchMachineForm = ({
	branchMachine,
	onSubmit,
	onClose,
	loading,
}: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				id: branchMachine?.id || null,
				name: branchMachine?.name || '',
				machine_id: branchMachine?.machine_id || '',
				machine_printer_serial_number: branchMachine?.machine_printer_serial_number || '',
			},
			Schema: Yup.object().shape({
				name: Yup.string().required().max(30).label('Name'),
				machine_id: Yup.string().required().max(50).label('Machine ID'),
				machine_printer_serial_number: Yup.string()
					.required()
					.max(50)
					.label('Machine Printer Serial Number'),
			}),
		}),
		[branchMachine],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: ICreateEditBranchMachine) => {
				setSubmitting(true);
				await sleep(500);
				setSubmitting(false);

				onSubmit(values);
			}}
			enableReinitialize
		>
			{({ values, errors, touched }) => (
				<Form className="form">
					<DetailsRow>
						<Col xs={24}>
							<FormInputLabel id="name" label="Name" />
							{errors.name && touched.name ? <FieldError error={errors.name} /> : null}
						</Col>

						<Col xs={24}>
							<FormInputLabel id="machine_id" label="Machine ID" />
							{errors.machine_id && touched.machine_id ? (
								<FieldError error={errors.machine_id} />
							) : null}
						</Col>

						<Col xs={24}>
							<FormInputLabel
								id="machine_printer_serial_number"
								label="Machine Printer Serial Number"
							/>
							{errors.machine_printer_serial_number && touched.machine_printer_serial_number ? (
								<FieldError error={errors.machine_printer_serial_number} />
							) : null}
						</Col>
					</DetailsRow>

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
							text={branchMachine ? 'Edit' : 'Create'}
							variant="primary"
							loading={loading || isSubmitting}
						/>
					</div>
				</Form>
			)}
		</Formik>
	);
};
