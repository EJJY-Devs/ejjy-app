import { Button, Col, Input, message, Modal, Row, Select } from 'antd';
import { RequestErrors } from 'components';
import { ErrorMessage, Form, Formik } from 'formik';
import { useBranchCreate, useBranchEdit } from 'hooks';
import { filterOption, taxTypes } from 'ejjy-global';
import React, { useCallback } from 'react';
import { convertIntoArray, getId } from 'utils';
import * as Yup from 'yup';
import { FieldError, Label } from '../../elements';

interface Props {
	branch: any;
	onClose: any;
	onSuccess: any;
}

export const ModifyBranchModal = ({ branch, onClose, onSuccess }: Props) => {
	// CUSTOM HOOKS
	const {
		mutateAsync: createBranch,
		isLoading: isCreatingBranch,
		error: createBranchError,
	} = useBranchCreate();
	const {
		mutateAsync: editBranch,
		isLoading: isEditingBranch,
		error: editBranchError,
	} = useBranchEdit();

	// METHODS
	const handleSubmit = async (formData) => {
		if (branch) {
			await editBranch({
				id: getId(branch),
				...formData,
			});
			message.success('Branch was edited successfully');
		} else {
			await createBranch(formData);
			message.success('Branch was created successfully');
		}

		onSuccess?.();
		onClose();
	};

	return (
		<Modal
			footer={null}
			title={`${branch ? '[Edit]' : '[Create]'} Branch`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(createBranchError?.errors),
					...convertIntoArray(editBranchError?.errors),
				]}
				withSpaceBottom
			/>

			<ModifyBranchForm
				branch={branch}
				isLoading={isCreatingBranch || isEditingBranch}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

interface FormProps {
	branch?: any;
	isLoading: boolean;
	onSubmit: any;
	onClose: any;
}

export const ModifyBranchForm = ({
	branch,
	isLoading,
	onSubmit,
	onClose,
}: FormProps) => {
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				name: branch?.name || '',
				serverUrl: branch?.server_url || '',
				storeName: branch?.store_name || '',
				storeAddress: branch?.store_address || '',
				proprietor: branch?.proprietor || '',
				contactNumber: branch?.contact_number || '',
				vatType: branch?.vat_type || '',
				tin: branch?.tin || '',
			},
			Schema: Yup.object().shape({
				name: Yup.string().required().max(75).label('Name').trim(),
				serverUrl: Yup.string().required().label('Server URL').trim(),
				storeName: Yup.string().required().label('Store Name').trim(),
				storeAddress: Yup.string().required().label('Store Address').trim(),
				proprietor: Yup.string().required().label('Proprietor').trim(),
				contactNumber: Yup.string().required().label('Contact Number').trim(),
				vatType: Yup.string().required().label('Vat Type').trim(),
				tin: Yup.string().required().label('Tin').trim(),
			}),
		}),
		[branch],
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
							<Label label="Server URL" spacing />
							<Input
								value={values['serverUrl']}
								onChange={(e) => {
									setFieldValue('serverUrl', e.target.value);
								}}
							/>
							<ErrorMessage
								name="serverUrl"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col span={24}>
							<Label label="Store Name" spacing />
							<Input
								name="storeName"
								value={values['storeName']}
								onChange={(e) => {
									setFieldValue('storeName', e.target.value);
								}}
							/>
							<ErrorMessage
								name="storeName"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Store Address" spacing />
							<Input
								name="storeAddress"
								value={values['storeAddress']}
								onChange={(e) => {
									setFieldValue('storeAddress', e.target.value);
								}}
							/>
							<ErrorMessage
								name="storeAddress"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Proprietor" spacing />
							<Input
								name="proprietor"
								value={values['proprietor']}
								onChange={(e) => {
									setFieldValue('proprietor', e.target.value);
								}}
							/>
							<ErrorMessage
								name="proprietor"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Contact Number" spacing />
							<Input
								name="contactNumber"
								value={values['contactNumber']}
								onChange={(e) => {
									setFieldValue('contactNumber', e.target.value);
								}}
							/>
							<ErrorMessage
								name="contactNumber"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Vat Type" spacing />
							<Select
								className="w-100"
								filterOption={filterOption}
								optionFilterProp="children"
								value={values['vatType']}
								allowClear
								showSearch
								onChange={(value) => {
									setFieldValue('vatType', value);
								}}
							>
								{[taxTypes.NVAT, taxTypes.VAT].map((type) => (
									<Select.Option key={type} value={type}>
										{type}
									</Select.Option>
								))}
							</Select>
							<ErrorMessage
								name="taxType"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col span={24}>
							<Label label="Tin" spacing />
							<Input
								name="tin"
								value={values['tin']}
								onChange={(e) => {
									setFieldValue('tin', e.target.value);
								}}
							/>
							<ErrorMessage
								name="tin"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							{branch ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
