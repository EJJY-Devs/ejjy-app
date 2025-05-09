import { Button, Col, message, Modal, Row, TimePicker } from 'antd';
import { ErrorMessage, Form, Formik } from 'formik';
import { useAttendanceLogEdit, useSiteSettings } from 'hooks';
import { convertIntoArray, getId } from 'utils';
import * as Yup from 'yup';
import React, { useCallback } from 'react';
import moment from 'moment';
import dayjs from 'dayjs';
import { RequestErrors } from '../..';
import { FieldError, Label } from '../../elements';

interface ModalProps {
	attendanceLog: any;
	onClose: any;
}

export const EditAttendanceLogModal = ({
	attendanceLog,
	onClose,
}: ModalProps) => {
	// CUSTOM HOOKS
	const {
		mutateAsync: editAttendanceLog,
		isLoading: isEditingAttendanceLog,
		error: editAttendanceLogError,
	} = useAttendanceLogEdit();
	// METHODS
	const handleSubmit = async (formData) => {
		await editAttendanceLog({
			...formData,
			id: getId(attendanceLog),
		});
		message.success('Attendance log has been edited successfully');

		onClose();
	};

	return (
		<Modal
			footer={null}
			title="[Edit] Attendance Log"
			centered
			closable
			open
			onCancel={onClose}
		>
			<RequestErrors
				errors={convertIntoArray(editAttendanceLogError?.errors)}
				withSpaceBottom
			/>

			<EditAttendanceLogForm
				attendanceLog={attendanceLog}
				isLoading={isEditingAttendanceLog}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

interface FormProps {
	attendanceLog?: any;
	isLoading: boolean;
	onSubmit: any;
	onClose: any;
}

export const EditAttendanceLogForm = ({
	attendanceLog,
	isLoading,
	onSubmit,
	onClose,
}: FormProps) => {
	// CUSTOM HOOKS
	const { data: siteSettings } = useSiteSettings();

	// METHODS
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				realTime: attendanceLog?.realTime,
			},
			Schema: Yup.object().shape({
				realTime: Yup.string().required().label('New Time').trim(),
			}),
		}),
		[attendanceLog, siteSettings],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={(formData) => {
				onSubmit(formData);
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label="New Time" spacing />
							<TimePicker
								allowClear={false}
								className="w-100"
								defaultValue={moment(
									dayjs.tz(attendanceLog.real_time, 'GMT').format('HH:mm:ss'),
									'HH:mm:ss',
								)}
								format="h:mm A"
								value={values['realTime']}
								hideDisabledOptions
								use12Hours
								onSelect={(value) => setFieldValue('realTime', value)}
							/>

							<ErrorMessage
								name="realTime"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							Edit
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
