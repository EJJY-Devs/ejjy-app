import { Col, Divider } from 'antd';
import { Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { DetailsRow, DetailsSingle } from '../../../../../components';
import {
	Button,
	FieldError,
	FormInputLabel,
	FormRadioButton,
	Label,
} from '../../../../../components/elements';
import { productTypes, unitOfMeasurementTypes } from '../../../../../global/types';
import { sleep } from '../../../../../utils/function';

interface ICreateBranch {
	id?: number;
	branch_id?: number;
	product_id?: number;
	reorder_point?: number;
	max_balance?: number;
	price_per_piece?: number;
	price_per_bulk?: number;
	current_balance?: number;
}

interface Props {
	branchId: number;
	branchProduct: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const EditBranchProductsForm = ({
	branchId,
	branchProduct,
	onSubmit,
	onClose,
	loading,
}: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				product_id: branchProduct?.product_id || '',
				is_daily_checked: branchProduct?.is_daily_checked?.toString(),
				is_randomly_checked: branchProduct?.is_randomly_checked?.toString(),
				type: branchProduct?.product?.type,
				unit_of_measurement: branchProduct?.product?.unit_of_measurement,
				reorder_point: branchProduct?.reorder_point || '',
				max_balance: branchProduct?.max_balance || '',
				price_per_piece: branchProduct?.price_per_piece || '',
				price_per_bulk: branchProduct?.price_per_bulk || '',
				current_balance: branchProduct?.current_balance || '',
				allowable_spoilage: branchProduct?.allowable_spoilage * 100 || '',
			},
			Schema: Yup.object().shape({
				reorder_point: Yup.number().required().min(0).max(65535).label('Reorder Point'),
				max_balance: Yup.number().required().min(0).max(65535).label('Max Balance'),
				price_per_piece: Yup.number().required().min(0).label('Price per Piece'),
				price_per_bulk: Yup.number().required().min(0).label('Price per Bulk'),
				current_balance: Yup.number().nullable().min(0).max(65535),
				allowable_spoilage: Yup.number()
					.integer()
					.min(0)
					.max(99)
					.when(['type', 'unit_of_measurement'], {
						is: (type, unit_of_measurement) =>
							type === productTypes.WET && unit_of_measurement === unitOfMeasurementTypes.WEIGHING,
						then: Yup.number().required(),
						otherwise: Yup.number().notRequired(),
					})
					.label('Allowable Spoilage'),
			}),
		}),
		[branchProduct],
	);

	const dailyChecking = [
		{
			id: 'daily-no',
			label: 'No',
			value: 'false',
		},
		{
			id: 'daily-yes',
			label: 'Yes',
			value: 'true',
		},
	];

	const randomChecking = [
		{
			id: 'random-no',
			label: 'No',
			value: 'false',
		},
		{
			id: 'random-yes',
			label: 'Yes',
			value: 'true',
		},
	];

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: ICreateBranch) => {
				setSubmitting(true);
				await sleep(500);
				setSubmitting(false);

				values.id = branchProduct?.id;
				values.branch_id = branchId;
				onSubmit(values);
			}}
			enableReinitialize
		>
			{({ values, errors, touched }) => (
				<Form className="form">
					<DetailsRow>
						<DetailsSingle label="Barcode" value={branchProduct?.product?.id} />
						<DetailsSingle label="Name" value={branchProduct?.product?.name} />

						<Divider dashed />

						<Col sm={12} xs={24}>
							<Label label="Is Daily Checked?" spacing />
							<FormRadioButton name="is_daily_checked" items={dailyChecking} />
							{errors.is_daily_checked && touched.is_daily_checked ? (
								<FieldError error={errors.is_daily_checked} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<Label label="Is Randomly Checked?" spacing />
							<FormRadioButton name="is_randomly_checked" items={randomChecking} />
							{errors.is_randomly_checked && touched.is_randomly_checked ? (
								<FieldError error={errors.is_randomly_checked} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel min={0} type="number" id="reorder_point" label="Reorder Point" />
							{errors.reorder_point && touched.reorder_point ? (
								<FieldError error={errors.reorder_point} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel min={0} type="number" id="max_balance" label="Max Balance" />
							{errors.max_balance && touched.max_balance ? (
								<FieldError error={errors.max_balance} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel min={0} type="number" id="price_per_piece" label="Price (Piece)" />
							{errors.price_per_piece && touched.price_per_piece ? (
								<FieldError error={errors.price_per_piece} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel min={0} type="number" id="price_per_bulk" label="Price (Bulk)" />
							{errors.price_per_bulk && touched.price_per_bulk ? (
								<FieldError error={errors.price_per_bulk} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel
								min={0}
								type="number"
								id="allowable_spoilage"
								label="Allowable Spoilage"
								disabled={
									!(
										values?.type === productTypes.WET &&
										values?.unit_of_measurement === unitOfMeasurementTypes.WEIGHING
									)
								}
							/>
							{errors.allowable_spoilage && touched.allowable_spoilage ? (
								<FieldError error={errors.allowable_spoilage} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel min={0} type="number" id="current_balance" label="Current Balance" />
							{errors.current_balance && touched.current_balance ? (
								<FieldError error={errors.current_balance} />
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
							text={branchProduct ? 'Edit' : 'Create'}
							variant="primary"
							loading={loading || isSubmitting}
						/>
					</div>
				</Form>
			)}
		</Formik>
	);
};
