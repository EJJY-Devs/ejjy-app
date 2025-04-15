import {
	Button,
	Col,
	Input,
	message,
	Modal,
	Row,
	Select,
	DatePicker,
} from 'antd';
import {
	BranchMachine,
	filterOption,
	useBranchMachineCreate,
	useBranchMachineEdit,
} from 'ejjy-global';
import moment from 'moment';
import { ErrorMessage, Form, Formik } from 'formik';
import { branchMachineTypes } from 'global';
import React, { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useUserStore } from 'stores';
import {
	convertIntoArray,
	getBranchMachineTypeName,
	getGoogleApiUrl,
	getId,
	getLocalApiUrl,
	isCUDShown,
	isUserFromOffice,
} from 'utils';
import * as Yup from 'yup';
import { RequestErrors } from '../..';
import { FieldError, Label } from '../../elements';

type ModalProps = {
	branchId?: number;
	branchMachine?: BranchMachine;
	onClose: () => void;
};

export const ModifyBranchMachineModal = ({
	branchId,
	branchMachine,
	onClose,
}: ModalProps) => {
	const queryClient = useQueryClient();
	const user = useUserStore((state) => state.user);

	// CUSTOM HOOKS
	const {
		mutateAsync: createBranchMachine,
		isLoading: isCreatingBranchMachine,
		error: createBranchMachineError,
	} = useBranchMachineCreate(
		null,
		isUserFromOffice(user.user_type) && isCUDShown(user.user_type)
			? getGoogleApiUrl()
			: getLocalApiUrl(),
	);
	const {
		mutateAsync: editBranchMachine,
		isLoading: isEditingBranchMachine,
		error: editBranchMachineError,
	} = useBranchMachineEdit(
		null,
		isUserFromOffice(user.user_type) && isCUDShown(user.user_type)
			? getGoogleApiUrl()
			: getLocalApiUrl(),
	);

	// METHODS
	const handleSubmit = async (formData) => {
		if (branchMachine) {
			await editBranchMachine({
				id: getId(branchMachine),
				...formData,
			});
			message.success('Branch machine was edited successfully');
		} else {
			await createBranchMachine(formData);
			message.success('Branch machine was created successfully');
		}

		queryClient.invalidateQueries('useBranchMachines');
		onClose();
	};

	return (
		<Modal
			footer={null}
			title={`${branchMachine ? '[Edit]' : '[Create]'} Branch Machine`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(createBranchMachineError?.errors),
					...convertIntoArray(editBranchMachineError?.errors),
				]}
				withSpaceBottom
			/>

			<ModifyBranchMachineForm
				branchId={branchId}
				branchMachine={branchMachine}
				isLoading={isCreatingBranchMachine || isEditingBranchMachine}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

interface FormProps {
	branchId?: number;
	branchMachine?: BranchMachine;
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
}

export const ModifyBranchMachineForm = ({
	branchId,
	branchMachine,
	isLoading,
	onSubmit,
	onClose,
}: FormProps) => {
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				branchId: branchMachine?.branch?.id || branchId,
				machineIdentificationNumber:
					branchMachine?.machine_identification_number || '',
				name: branchMachine?.name || '',
				permitToUse: branchMachine?.permit_to_use || '',
				storageSerialNumber: branchMachine?.storage_serial_number || '',
				serverUrl: branchMachine?.server_url || '',
				type: branchMachine?.type || branchMachineTypes.CASHIERING,
				ptuDateIssued: branchMachine?.ptu_date_issued
					? moment(branchMachine?.ptu_date_issued)
					: null,
			},
			Schema: Yup.object().shape({
				branchId: Yup.string().required().label('Branch ID'),
				machineIdentificationNumber: Yup.string()
					.required()
					.max(75)
					.label('Machine Identification Number')
					.trim(),
				name: Yup.string().required().max(30).label('Name').trim(),
				permitToUse: Yup.string()
					.required()
					.max(75)
					.label('Permit To Use')
					.trim(),
				storageSerialNumber: Yup.string()
					.required()
					.max(75)
					.label('Storage Serial Number')
					.trim(),
				serverUrl: Yup.string().required().max(75).label('Server URL').trim(),
				type: Yup.string().required().label('Type'),
				ptuDateIssued: Yup.string()
					.required()
					.max(75)
					.label('PTU Date Issued')
					.trim(),
			}),
		}),
		[branchMachine],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit({
					...formData,
					ptuDateIssued: formData.ptuDateIssued
						? formData.ptuDateIssued.format('YYYY-MM-DD')
						: undefined,
				});
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label="Name" spacing />
							<Input
								name="name"
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
								name="serverUrl"
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
							<Label label="Type" spacing />
							<Select
								className="w-100"
								filterOption={filterOption}
								optionFilterProp="children"
								value={values['type']}
								allowClear
								showSearch
								onChange={(value) => {
									setFieldValue('type', value);
								}}
							>
								{[
									branchMachineTypes.CASHIERING,
									branchMachineTypes.SCALE,
									branchMachineTypes.SCALE_AND_CASHIERING,
								].map((type) => (
									<Select.Option key={type} value={type}>
										{getBranchMachineTypeName(type)}
									</Select.Option>
								))}
							</Select>
							<ErrorMessage
								name="type"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Machine Identification Number" spacing />
							<Input
								name="machineIdentificationNumber"
								value={values['machineIdentificationNumber']}
								onChange={(e) => {
									setFieldValue('machineIdentificationNumber', e.target.value);
								}}
							/>
							<ErrorMessage
								name="machineIdentificationNumber"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="PTU Number" spacing />
							<Input
								name="permitToUse"
								value={values['permitToUse']}
								onChange={(e) => {
									setFieldValue('permitToUse', e.target.value);
								}}
							/>
							<ErrorMessage
								name="permitToUse"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label id="ptuDateIssued" label="PTU Date Issued" spacing />
							<DatePicker
								allowClear={false}
								className="w-100"
								format="MMMM DD, YYYY"
								value={
									values.ptuDateIssued
										? moment(values.ptuDateIssued).startOf('day')
										: null
								}
								onChange={(value) => setFieldValue('ptuDateIssued', value)}
							/>
							<ErrorMessage
								name="ptuDateIssued"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label label="Storage Serial #" spacing />
							<Input
								name="storageSerialNumber"
								value={values['storageSerialNumber']}
								onChange={(e) => {
									setFieldValue('storageSerialNumber', e.target.value);
								}}
							/>
							<ErrorMessage
								name="storageSerialNumber"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							{branchMachine ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
