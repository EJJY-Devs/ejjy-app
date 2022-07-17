import { Col, message, Modal, Row } from 'antd';
import { RequestErrors } from 'components/RequestErrors/RequestErrors';
import { ErrorMessage, Form, Formik } from 'formik';
import { usePointSystemTagCreate, usePointSystemTagEdit } from 'hooks';
import React, { useCallback } from 'react';
import { convertIntoArray } from 'utils';
import * as Yup from 'yup';
import {
	Button,
	FieldError,
	FormattedInputNumber,
	FormInputLabel,
	Label,
} from '../../elements';

interface ModalProps {
	pointSystemTag: any;
	onClose: any;
}

export const ModifyPointSystemTagModal = ({
	pointSystemTag,
	onClose,
}: ModalProps) => {
	// CUSTOM HOOKS
	const {
		mutateAsync: createPointSystemTag,
		isLoading: isCreateLoading,
		error: createError,
	} = usePointSystemTagCreate();
	const {
		mutateAsync: editPointSystemTag,
		isLoading: isEditLoading,
		error: editError,
	} = usePointSystemTagEdit();

	// METHODS
	const onSubmit = async (formData) => {
		if (pointSystemTag) {
			await editPointSystemTag(formData);
			message.success('Point system tag was edited successfully');
		} else {
			await createPointSystemTag(formData);
			message.success('Point system tag was created successfully');
		}

		onClose();
	};

	return (
		<Modal
			footer={null}
			title={`${pointSystemTag ? '[Edit]' : '[Create]'} Point System Tag`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(createError?.errors),
					...convertIntoArray(editError?.errors),
				]}
				withSpaceBottom
			/>

			<ModifyPointSystemTagForm
				isLoading={isCreateLoading || isEditLoading}
				pointSystemTag={pointSystemTag}
				onClose={onClose}
				onSubmit={onSubmit}
			/>
		</Modal>
	);
};

interface FormProps {
	pointSystemTag?: any;
	isLoading: boolean;
	onSubmit: any;
	onClose: any;
}

export const ModifyPointSystemTagForm = ({
	pointSystemTag,
	isLoading,
	onSubmit,
	onClose,
}: FormProps) => {
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				id: pointSystemTag?.id || undefined,
				name: pointSystemTag?.name || '',
				divisorAmount: pointSystemTag?.divisor_amount || '',
			},
			Schema: Yup.object().shape({
				name: Yup.string().required().max(75).label('Name'),
				divisorAmount: Yup.string().required().label('Divisor Amount'),
			}),
		}),
		[pointSystemTag],
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
				<Form className="form">
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<FormInputLabel id="name" label="Name" />
							<ErrorMessage
								name="name"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label id="divisorAmount" label="Divisor Amount" spacing />
							<FormattedInputNumber
								className="w-100"
								controls={false}
								size="large"
								value={values.divisorAmount}
								onChange={(value) => {
									setFieldValue('divisorAmount', value);
								}}
							/>
							<ErrorMessage
								name="divisorAmount"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button
							disabled={isLoading}
							text="Cancel"
							type="button"
							onClick={onClose}
						/>
						<Button
							loading={isLoading}
							text={pointSystemTag ? 'Edit' : 'Create'}
							type="submit"
							variant="primary"
						/>
					</div>
				</Form>
			)}
		</Formik>
	);
};
