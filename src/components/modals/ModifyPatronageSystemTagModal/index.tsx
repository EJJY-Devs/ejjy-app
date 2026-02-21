import { Button, Col, Input, message, Modal, Row } from 'antd';
import { RequestErrors } from 'components';
import { FieldError, FormattedInputNumber, Label } from 'components/elements';
import { ErrorMessage, Form, Formik } from 'formik';
import { usePatronageSystemTagCreate, usePatronageSystemTagEdit } from 'hooks';
import React, { useCallback } from 'react';
import { convertIntoArray, getId } from 'utils';
import * as Yup from 'yup';

interface ModalProps {
	patronageSystemTag: any;
	onClose: any;
}

export const ModifyPatronageSystemTagModal = ({
	patronageSystemTag,
	onClose,
}: ModalProps) => {
	const {
		mutateAsync: createPatronageSystemTag,
		isLoading: isCreatingPatronageSystemTag,
		error: createPatronageSystemTagError,
	} = usePatronageSystemTagCreate();
	const {
		mutateAsync: editPatronageSystemTag,
		isLoading: isEditingPatronageSystemTag,
		error: editPatronageSystemTagError,
	} = usePatronageSystemTagEdit();

	const handleSubmit = async (formData) => {
		if (patronageSystemTag) {
			await editPatronageSystemTag({
				...formData,
				id: getId(patronageSystemTag),
			});
			message.success('Patronage system tag was edited successfully');
		} else {
			await createPatronageSystemTag(formData);
			message.success('Patronage system tag was created successfully');
		}

		onClose();
	};

	return (
		<Modal
			footer={null}
			title={`${
				patronageSystemTag ? '[Edit]' : '[Create]'
			} Patronage System Tag`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(createPatronageSystemTagError?.errors),
					...convertIntoArray(editPatronageSystemTagError?.errors),
				]}
				withSpaceBottom
			/>

			<ModifyPatronageSystemTagForm
				isLoading={isCreatingPatronageSystemTag || isEditingPatronageSystemTag}
				patronageSystemTag={patronageSystemTag}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

interface FormProps {
	patronageSystemTag?: any;
	isLoading: boolean;
	onSubmit: any;
	onClose: any;
}

export const ModifyPatronageSystemTagForm = ({
	patronageSystemTag,
	isLoading,
	onSubmit,
	onClose,
}: FormProps) => {
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				name: patronageSystemTag?.name || '',
				divisorAmount: patronageSystemTag?.divisor_amount || '',
			},
			Schema: Yup.object().shape({
				name: Yup.string().required().max(75).label('Name').trim(),
				divisorAmount: Yup.string().required().label('Divisor Amount').trim(),
			}),
		}),
		[patronageSystemTag],
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
							{patronageSystemTag ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
