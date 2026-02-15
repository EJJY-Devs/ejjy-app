import { Button, Col, Input, message, Modal, Row } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import { usePointSystemTagCreate, usePointSystemTagEdit } from 'hooks';
import React, { useCallback } from 'react';
import { convertIntoArray, getId } from 'utils';
import * as Yup from 'yup';
import { RequestErrors } from '../..';
import { FieldError, FormattedInputNumber, Label } from '../../elements';

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
		isLoading: isCreatingPointSystemTag,
		error: createPointSystemTagError,
	} = usePointSystemTagCreate();
	const {
		mutateAsync: editPointSystemTag,
		isLoading: isEditingPointSystemTag,
		error: editPointSystemTagError,
	} = usePointSystemTagEdit();

	// METHODS
	const handleSubmit = async (formData) => {
		if (pointSystemTag) {
			await editPointSystemTag({
				...formData,
				id: getId(pointSystemTag),
			});
			message.success('Patronage system tag was edited successfully');
		} else {
			await createPointSystemTag(formData);
			message.success('Patronage system tag was created successfully');
		}

		onClose();
	};

	return (
		<Modal
			footer={null}
			title={`${pointSystemTag ? '[Edit]' : '[Create]'} Patronage System Tag`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(createPointSystemTagError?.errors),
					...convertIntoArray(editPointSystemTagError?.errors),
				]}
				withSpaceBottom
			/>

			<ModifyPointSystemTagForm
				isLoading={isCreatingPointSystemTag || isEditingPointSystemTag}
				pointSystemTag={pointSystemTag}
				onClose={onClose}
				onSubmit={handleSubmit}
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
				name: pointSystemTag?.name || '',
				divisorAmount: pointSystemTag?.divisor_amount || '',
			},
			Schema: Yup.object().shape({
				name: Yup.string().required().max(75).label('Name').trim(),
				divisorAmount: Yup.string().required().label('Divisor Amount').trim(),
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
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label="Name" spacing />
							<Input
								value={values['name']}
								onChange={(e) => {
									setFieldValue('name', e.target.value);
								}}
							/>
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
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							{pointSystemTag ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
