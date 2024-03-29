import { Button, Col, message, Modal, Row, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { filterOption } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { MAX_PAGE_SIZE } from 'global';
import {
	useBranchMachines,
	useCashieringAssignmentCreate,
	useCashieringAssignmentEdit,
} from 'hooks';
import moment, { Moment } from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import { convertIntoArray } from 'utils';
import * as Yup from 'yup';
import { RequestErrors } from '../..';
import { FieldError, Label } from '../../elements';

const setDateToTime = ({ assignment, date, times }) => {
	const selectedDate = assignment ? dayjs.tz(assignment.datetime_start) : date;
	const datetimeStart = times[0];
	const datetimeEnd = times[1];

	datetimeStart
		.date(selectedDate.date())
		.month(selectedDate.month())
		.year(selectedDate.year());
	datetimeEnd
		.date(selectedDate.date())
		.month(selectedDate.month())
		.year(selectedDate.year());

	return {
		datetimeStart,
		datetimeEnd,
	};
};

interface ModalProps {
	assignment?: any;
	assignments?: any;
	date?: any;
	userId: number;
	onClose: any;
}

export const ModifyCashieringAssignmentModal = ({
	assignment,
	assignments,
	date,
	userId,
	onClose,
}: ModalProps) => {
	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: { pageSize: MAX_PAGE_SIZE },
	});
	const {
		mutateAsync: createCashieringAssignment,
		isLoading: isCreatingCashieringAssignment,
		error: createError,
	} = useCashieringAssignmentCreate();
	const {
		mutateAsync: editCashieringAssignment,
		isLoading: isEditingCashieringAssignment,
		error: editError,
	} = useCashieringAssignmentEdit();

	// METHODS
	const handleSubmit = async (formData) => {
		const { datetimeStart, datetimeEnd } = setDateToTime({
			assignment,
			date,
			times: formData.times,
		});

		const data = {
			...formData,
			actingUserId: user.id,
			datetimeStart: datetimeStart.format('MM/DD/YYYY HH:mm:ss [GMT]'),
			datetimeEnd: datetimeEnd.format('MM/DD/YYYY HH:mm:ss [GMT]'),
			userId,
		};

		if (assignment) {
			await editCashieringAssignment(data);
			message.success('Cashiering assignment was created successfully');
		} else {
			await createCashieringAssignment(data);
			message.success('Cashiering assignment was edited successfully');
		}

		onClose();
	};

	return (
		<Modal
			footer={null}
			title={`${
				assignment
					? '[Edit] Assignment'
					: `[Create] Assignment (${date.format('MMM D, YYYY')})`
			}`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(createError?.errors),
					...convertIntoArray(editError?.errors),
					...convertIntoArray(branchMachinesError, 'Branch Machines'),
				]}
				withSpaceBottom
			/>

			<ModifyCashieringAssignmentForm
				assignment={assignment}
				assignments={assignments}
				branchMachines={branchMachines}
				date={date}
				isLoading={
					isCreatingCashieringAssignment ||
					isEditingCashieringAssignment ||
					isFetchingBranchMachines
				}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

interface FormProps {
	assignment?: any;
	assignments?: any;
	branchMachines: any;
	date?: any;
	isLoading: boolean;
	onClose: any;
	onSubmit: any;
}

export const ModifyCashieringAssignmentForm = ({
	assignment,
	assignments,
	branchMachines,
	date,
	isLoading,
	onClose,
	onSubmit,
}: FormProps) => {
	// STATES
	const [filteredAssignments, setFilteredAssignments] = useState([]);

	// METHODS
	useEffect(() => {
		const selectedDate = assignment
			? dayjs.tz(assignment.datetime_start)
			: date;

		setFilteredAssignments(
			assignments.filter(
				(ca) =>
					dayjs.tz(ca.datetime_start).isSame(selectedDate, 'date') &&
					ca.id !== assignment?.id,
			),
		);
	}, [assignment, assignments, date]);

	const getFormDetails = useCallback(() => {
		interface DefaultValues {
			id?: number;
			branchMachineId?: number;
			times?: [Moment, Moment];
		}

		const defaultValues: DefaultValues = {
			id: assignment?.id,
			branchMachineId: null,
			times: assignment
				? [
						moment(dayjs.tz(assignment.datetime_start).toDate()),
						moment(dayjs.tz(assignment.datetime_end).toDate()),
				  ]
				: null,
		};

		return {
			defaultValues,
			schema: Yup.object().shape({
				branchMachineId: !assignment
					? Yup.number().nullable().required().label('Branch Machine')
					: null,
				times: Yup.array()
					.nullable()
					.required()
					.label('Schedule')
					.test(
						'overlap',
						'Selected time overlaps existing assignments.',
						(times) => {
							if (filteredAssignments?.length > 0 && times?.length > 0) {
								const { datetimeStart, datetimeEnd } = setDateToTime({
									assignment,
									date,
									times,
								});

								const hasOverlap = filteredAssignments.some((ca) => {
									const datetimeStartB = dayjs.tz(ca.datetime_start);
									const datetimeEndB = dayjs.tz(ca.datetime_end);

									return (
										datetimeStart <= datetimeEndB &&
										datetimeStartB <= datetimeEnd
									);
								});

								return !hasOverlap;
							}

							return true;
						},
					),
			}),
		};
	}, [assignment, filteredAssignments, date]);

	return (
		<Formik
			initialValues={getFormDetails().defaultValues}
			validationSchema={getFormDetails().schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit(formData);
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						{!assignment && (
							<Col span={24}>
								<Label label="Branch Machine" spacing />
								<Select
									className="w-100"
									filterOption={filterOption}
									loading={isLoading}
									optionFilterProp="children"
									value={values.branchMachineId}
									allowClear
									showSearch
									onChange={(value) => {
										setFieldValue('branchMachineId', value);
									}}
								>
									{branchMachines.map(({ id, name, branch }) => (
										<Select.Option key={id} value={id}>
											[{branch.name}] {name}
										</Select.Option>
									))}
								</Select>
								<ErrorMessage
									name="branchMachineId"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						)}

						<Col span={24}>
							<Label label="Schedule" spacing />
							<TimePicker.RangePicker
								className="w-100"
								format="h:mm A"
								value={values.times}
								hideDisabledOptions
								use12Hours
								onChange={(times: any) => {
									setFieldValue('times', times);
								}}
							/>
							<ErrorMessage
								name="times"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							{assignment ? 'Edit' : 'Create'}
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
