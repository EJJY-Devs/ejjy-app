import {
	EyeInvisibleOutlined,
	EyeOutlined,
	LoadingOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	DatePicker,
	Divider,
	Input,
	Radio,
	Row,
	Select,
	Upload,
} from 'antd';
import { RcFile } from 'antd/es/upload/interface';
import { filterOption } from 'ejjy-global';
import { ErrorMessage, Form, Formik, useFormikContext } from 'formik';
import { accountTypes } from 'global';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { FieldError, Label } from '../../elements';

interface Props {
	account?: any;
	loading: boolean;
	onSubmit: any;
	onClose: any;
}

const getEmployeeSchema = (label) =>
	Yup.string()
		.trim()
		.when('type', {
			is: accountTypes.EMPLOYEE,
			then: Yup.string().trim().required().label(label),
		});

const getCorporateGovernmentSchema = (label) =>
	Yup.string()
		.nullable()
		.when('type', {
			is: (type) =>
				[accountTypes.CORPORATE, accountTypes.GOVERNMENT].includes(type),
			then: Yup.string().trim().required().label(label),
		});

export const ModifyAccountForm = ({
	account,
	loading,
	onSubmit,
	onClose,
}: Props) => {
	// METHODS
	const getFormDetails = useCallback(
		() => ({
			defaultValues: {
				type: account?.type || accountTypes.PERSONAL,
				firstName: account?.first_name || '',
				middleName: account?.middle_name || undefined,
				lastName: account?.last_name || '',
				birthday: account?.birthday ? moment(account?.birthday) : null,
				tin: account?.tin || '',
				businessName: account?.business_name || undefined,
				homeAddress: account?.home_address || '',
				businessAddress: account?.business_address || undefined,
				contactNumber: account?.contact_number || '',
				gender: account?.gender || '',
				isPointSystemEligible: account?.is_point_system_eligible || false,

				civilStatus: account?.civil_status || undefined,
				nationality: account?.nationality || undefined,
				placeOfBirth: account?.place_of_birth || undefined,
				fatherName: account?.father_name || undefined,
				motherMaidenName: account?.mother_maiden_name || undefined,
				religion: account?.religion || undefined,
				emailAddress: account?.email_address || undefined,
				biodataImage: account?.biodata_image || undefined,
				pin: account?.pin || '',
			},
			schema: Yup.object().shape({
				type: Yup.string().required().label('Type'),
				firstName: Yup.string().trim().required().label('First Name'),
				middleName: Yup.string().nullable().label('Middle Name'),
				lastName: Yup.string().trim().required().label('Last Name'),
				birthday: Yup.date().nullable().required().label('Birthday'),
				tin: Yup.string().trim().required().label('TIN'),
				homeAddress: Yup.string().trim().required().label('Address (Home)'),
				businessName: getCorporateGovernmentSchema('Business Name'),
				businessAddress: getCorporateGovernmentSchema('Address (Business)'),

				contactNumber: Yup.string().trim().required().label('Contact Number'),
				gender: Yup.string().required().label('Gender'),
				isPointSystemEligible: Yup.boolean()
					.required()
					.label('Loyalty Membership'),

				civilStatus: getEmployeeSchema('Civil Status'),
				nationality: getEmployeeSchema('Nationality'),
				placeOfBirth: getEmployeeSchema('Place of Birth'),
				fatherName: getEmployeeSchema("Father's Name"),
				motherMaidenName: getEmployeeSchema("Mother's Maiden Name"),
				religion: getEmployeeSchema('Religion'),
				emailAddress: getEmployeeSchema('Email Address').email(),
				biodataImage: getEmployeeSchema('Biodata Image'),
				pin: Yup.string()
					.trim()
					.when('type', {
						is: accountTypes.EMPLOYEE,
						then: Yup.string()
							.trim()
							.required()
							.min(4, 'PIN must be at least 4 digits')
							.max(6, 'PIN must not exceed 6 digits')
							.matches(/^[0-9]+$/, 'PIN must contain only numbers')
							.label('PIN'),
					}),
			}),
		}),
		[account],
	);

	return (
		<Formik
			initialValues={getFormDetails().defaultValues}
			validationSchema={getFormDetails().schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit({
					...formData,
					middleName: formData.middleName || undefined,
					businessName: formData.businessName || undefined,
					businessAddress: formData.businessAddress || undefined,
					birthday: formData.birthday
						? formData.birthday.format('YYYY-MM-DD')
						: undefined,
					isPointSystemEligible:
						formData.type === accountTypes.EMPLOYEE
							? false
							: formData.isPointSystemEligible,
					pin:
						formData.type === accountTypes.EMPLOYEE ? formData.pin : undefined,
				});
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label id="type" label="Type" spacing />
							<Select
								className="w-100"
								disabled={account !== null}
								filterOption={filterOption}
								optionFilterProp="children"
								value={values.type}
								showSearch
								onChange={(value) => {
									setFieldValue('type', value);

									const employees = [
										accountTypes.PERSONAL,
										accountTypes.EMPLOYEE,
									];
									if (employees.includes(value)) {
										setFieldValue('businessName', undefined);
										setFieldValue('businessAddress', undefined);
									}
								}}
							>
								<Select.Option
									key={accountTypes.PERSONAL}
									value={accountTypes.PERSONAL}
								>
									Personal
								</Select.Option>
								<Select.Option
									key={accountTypes.CORPORATE}
									value={accountTypes.CORPORATE}
								>
									Corporate
								</Select.Option>
								<Select.Option
									key={accountTypes.EMPLOYEE}
									value={accountTypes.EMPLOYEE}
								>
									Employee
								</Select.Option>
								<Select.Option
									key={accountTypes.GOVERNMENT}
									value={accountTypes.GOVERNMENT}
								>
									Government
								</Select.Option>
							</Select>
							<ErrorMessage
								name="type"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Divider />
						<Col lg={8} span={24}>
							<Label label="First Name" spacing />
							<Input
								value={values.firstName}
								onChange={(e) => {
									setFieldValue('firstName', e.target.value);
								}}
							/>
							<ErrorMessage
								name="firstName"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col lg={8} span={24}>
							<Label label="Middle Name" spacing />
							<Input
								value={values.middleName}
								onChange={(e) => {
									setFieldValue('middleName', e.target.value);
								}}
							/>
							<ErrorMessage
								name="middleName"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col lg={8} span={24}>
							<Label label="Last Name" spacing />
							<Input
								value={values.lastName}
								onChange={(e) => {
									setFieldValue('lastName', e.target.value);
								}}
							/>
							<ErrorMessage
								name="lastName"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col lg={12} span={24}>
							<Label label="Gender" spacing />
							<Radio.Group
								options={[
									{ label: 'Male', value: 'm' },
									{ label: 'Female', value: 'f' },
								]}
								optionType="button"
								value={values.gender}
								onChange={(e) => {
									setFieldValue('gender', e.target.value);
								}}
							/>
							<ErrorMessage
								name="gender"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col lg={12} span={24}>
							<Label id="birthday" label="Birthday" spacing />
							<DatePicker
								allowClear={false}
								className="w-100"
								format="MMMM DD, YYYY"
								value={values.birthday}
								onSelect={(value) => setFieldValue('birthday', value)}
							/>
							<ErrorMessage
								name="birthday"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						{accountTypes.EMPLOYEE === values.type && (
							<>
								<Col span={24}>
									<Label label="Place of Birth" spacing />
									<Input
										value={values.placeOfBirth}
										onChange={(e) => {
											setFieldValue('placeOfBirth', e.target.value);
										}}
									/>
									<ErrorMessage
										name="placeOfBirth"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col span={24}>
									<Label label="Civil Status" spacing />
									<Radio.Group
										options={[
											{ label: 'Single', value: 'single' },
											{ label: 'Married', value: 'married' },
											{ label: 'Divorced', value: 'divorced' },
											{ label: 'Separated', value: 'separated' },
											{ label: 'Widowed', value: 'widowed' },
										]}
										optionType="button"
										value={values.civilStatus}
										onChange={(e) => {
											setFieldValue('civilStatus', e.target.value);
										}}
									/>
									<ErrorMessage
										name="civilStatus"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col lg={12} span={24}>
									<Label label="Nationality" spacing />
									<Input
										value={values.nationality}
										onChange={(e) => {
											setFieldValue('nationality', e.target.value);
										}}
									/>
									<ErrorMessage
										name="nationality"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col lg={12} span={24}>
									<Label label="Religion" spacing />
									<Input
										value={values.religion}
										onChange={(e) => {
											setFieldValue('religion', e.target.value);
										}}
									/>
									<ErrorMessage
										name="religion"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col lg={12} span={24}>
									<Label label="Father's Name" spacing />
									<Input
										value={values.fatherName}
										onChange={(e) => {
											setFieldValue('fatherName', e.target.value);
										}}
									/>
									<ErrorMessage
										name="fatherName"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col lg={12} span={24}>
									<Label label="Mother's Maiden Name" spacing />
									<Input
										value={values.motherMaidenName}
										onChange={(e) => {
											setFieldValue('motherMaidenName', e.target.value);
										}}
									/>
									<ErrorMessage
										name="motherMaidenName"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col span={24}>
									<Label label="Email Address" spacing />
									<Input
										type="email"
										value={values.emailAddress}
										onChange={(e) => {
											setFieldValue('emailAddress', e.target.value);
										}}
									/>
									<ErrorMessage
										name="emailAddress"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col span={24}>
									<Label label="PIN" spacing />
									<Input.Password
										iconRender={(visible) =>
											visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
										}
										maxLength={6}
										placeholder="Enter 4-6 digit PIN"
										value={values.pin}
										onChange={(e) => {
											setFieldValue('pin', e.target.value);
										}}
									/>
									<ErrorMessage
										name="pin"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col lg={12} span={24}>
									<Label label="Biodata Image" spacing />
									<ImageUploadField />
									<ErrorMessage
										name="biodataImage"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
							</>
						)}

						<Col span={24}>
							<Label label="TIN" spacing />
							<Input
								value={values.tin}
								onChange={(e) => {
									setFieldValue('tin', e.target.value);
								}}
							/>
							<ErrorMessage
								name="tin"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						{[accountTypes.CORPORATE, accountTypes.GOVERNMENT].includes(
							values.type,
						) && (
							<>
								<Col lg={12} span={24}>
									<Label
										label={
											values.type === accountTypes.CORPORATE
												? 'Business Name'
												: 'Agency Name'
										}
										spacing
									/>
									<Input
										value={values.businessName}
										onChange={(e) => {
											setFieldValue('businessName', e.target.value);
										}}
									/>
									<ErrorMessage
										name="businessName"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
								<Col lg={12} span={24}>
									<Label
										label={
											values.type === accountTypes.CORPORATE
												? 'Address (Business)'
												: 'Address (Agency)'
										}
										spacing
									/>
									<Input
										value={values.businessAddress}
										onChange={(e) => {
											setFieldValue('businessAddress', e.target.value);
										}}
									/>
									<ErrorMessage
										name="businessAddress"
										render={(error) => <FieldError error={error} />}
									/>
								</Col>
							</>
						)}
						<Col span={24}>
							<Label label="Address (Home)" spacing />
							<Input
								value={values.homeAddress}
								onChange={(e) => {
									setFieldValue('homeAddress', e.target.value);
								}}
							/>
							<ErrorMessage
								name="homeAddress"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col span={24}>
							<Label label="Contact Number" spacing />
							<Input
								value={values.contactNumber}
								onChange={(e) => {
									setFieldValue('contactNumber', e.target.value);
								}}
							/>
							<ErrorMessage
								name="contactNumber"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						{values.type !== accountTypes.EMPLOYEE && (
							<Col span={24}>
								<Label label="Loyalty Membership" spacing />
								<Radio.Group
									options={[
										{ label: 'Yes', value: true },
										{ label: 'No', value: false },
									]}
									optionType="button"
									value={values.isPointSystemEligible}
									onChange={(e) => {
										setFieldValue('isPointSystemEligible', e.target.value);
									}}
								/>
							</Col>
						)}
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={loading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={loading} type="primary">
							{account ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};

export const ImageUploadField = () => {
	// STATES
	const [isUploading, setIsUploading] = useState(false);

	// CUSTOM HOOKS
	const {
		values,
		setFieldValue,
		setFieldError,
		setFieldTouched,
	} = useFormikContext();

	// METHODS
	const getBase64 = (img: RcFile, callback: (url: string) => void) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result as string));
		reader.readAsDataURL(img);
	};

	const handleBeforeUpload = (file: RcFile) => {
		setIsUploading(true);

		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			setFieldTouched('biodataImage', true, false);
			setFieldError('biodataImage', 'Please only upload JPG orPNG file.');

			setIsUploading(false);
			return false;
		}

		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			setFieldTouched('biodataImage', true, false);
			setFieldError('biodataImage', 'Image must smaller than 2MB.');

			setIsUploading(false);
			return false;
		}

		getBase64(file, (url) => {
			setFieldValue('biodataImage', url);
			setIsUploading(false);
		});

		return false;
	};

	return (
		<Upload
			beforeUpload={handleBeforeUpload}
			className="avatar-uploader"
			listType="picture-card"
			name="avatar"
			showUploadList={false}
		>
			{values['biodataImage'] ? (
				<img
					alt="avatar"
					className="w-100"
					height={102}
					src={values['biodataImage']}
					style={{ objectFit: 'contain' }}
					width={102}
				/>
			) : (
				<div>
					{isUploading ? <LoadingOutlined /> : <PlusOutlined />}
					<div style={{ marginTop: 8 }}>Upload</div>
				</div>
			)}
		</Upload>
	);
};
