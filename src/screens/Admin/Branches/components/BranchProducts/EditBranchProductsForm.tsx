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
import {
	productCheckingTypes,
	productTypes,
	unitOfMeasurementTypes,
} from '../../../../../global/types';
import { sleep } from '../../../../../utils/function';

interface IEditBranchProduct {
	id?: number;
	branch_id?: number;
	product_id?: number;
	reorder_point?: number;
	max_balance?: number;
	price_per_piece?: number;
	price_per_bulk?: number;
	current_balance?: number;
	checking?: string;
	is_daily_checked?: boolean;
	is_randomly_checked?: boolean;
}

interface Props {
	branchProduct: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const EditBranchProductsForm = ({ branchProduct, onSubmit, onClose, loading }: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				product_id: branchProduct?.product_id,
				checking: branchProduct?.is_daily_checked
					? productCheckingTypes.DAILY
					: productCheckingTypes.RANDOM,
				type: branchProduct?.product?.type,
				unit_of_measurement: branchProduct?.product?.unit_of_measurement,
				reorder_point: branchProduct?.reorder_point,
				max_balance: branchProduct?.max_balance,
				price_per_piece: branchProduct?.price_per_piece,
				discounted_price_per_piece1: branchProduct?.discounted_price_per_piece1,
				discounted_price_per_piece2: branchProduct?.discounted_price_per_piece2,
				price_per_bulk: branchProduct?.price_per_bulk,
				discounted_price_per_bulk1: branchProduct?.discounted_price_per_bulk1,
				discounted_price_per_bulk2: branchProduct?.discounted_price_per_bulk2,
				current_balance: branchProduct?.current_balance,
				allowable_spoilage: branchProduct?.allowable_spoilage * 100,
				is_shown_in_scale_list: branchProduct?.is_shown_in_scale_list ? 'true' : 'false',
			},
			Schema: Yup.object().shape({
				checking: Yup.string().required().label('Checking'),
				reorder_point: Yup.number().required().min(0).max(65535).label('Reorder Point'),
				max_balance: Yup.number().required().min(0).max(65535).label('Max Balance'),
				price_per_piece: Yup.number().required().min(0).label('Price per Piece'),
				discounted_price_per_piece1: Yup.number()
					.required()
					.min(0)
					.label('Discounted Price per Piece 1'),
				discounted_price_per_piece2: Yup.number()
					.required()
					.min(0)
					.label('Discounted Price per Piece 2'),
				price_per_bulk: Yup.number().required().min(0).label('Price per Bulk'),
				discounted_price_per_bulk1: Yup.number()
					.required()
					.min(0)
					.label('Discounted Price per Bulk 1'),
				discounted_price_per_bulk2: Yup.number()
					.required()
					.min(0)
					.label('Discounted Price per Bulk 2'),
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

	const checkingTypesOptions = [
		{
			id: productCheckingTypes.DAILY,
			label: 'Daily',
			value: productCheckingTypes.DAILY,
		},
		{
			id: productCheckingTypes.RANDOM,
			label: 'Random',
			value: productCheckingTypes.RANDOM,
		},
	];

	const isShownInScaleListOptions = [
		{
			id: 'no',
			label: 'No',
			value: 'false',
		},
		{
			id: 'yes',
			label: 'Yes',
			value: 'true',
		},
	];

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: IEditBranchProduct) => {
				setSubmitting(true);
				await sleep(500);
				setSubmitting(false);

				values.id = branchProduct?.id;
				values.is_daily_checked = values.checking === productCheckingTypes.DAILY;
				values.is_randomly_checked = values.checking === productCheckingTypes.RANDOM;
				onSubmit(values);
			}}
			enableReinitialize
		>
			{({ values, errors, touched }) => (
				<Form className="form">
					<DetailsRow>
						<DetailsSingle
							label="Barcode"
							value={branchProduct?.product?.barcode || branchProduct?.product?.textcode}
						/>
						<DetailsSingle label="Name" value={branchProduct?.product?.name} />

						<Divider dashed />

						<Col sm={12} xs={24}>
							<Label label="Checking" spacing />
							<FormRadioButton name="checking" items={checkingTypesOptions} />
							{errors.checking && touched.checking ? <FieldError error={errors.checking} /> : null}
						</Col>

						<Col sm={12} xs={24}>
							<Label label="Is Shown in Scale List?" spacing />
							<FormRadioButton name="is_shown_in_scale_list" items={isShownInScaleListOptions} />
							{errors.is_shown_in_scale_list && touched.is_shown_in_scale_list ? (
								<FieldError error={errors.is_shown_in_scale_list} />
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

						<Divider />

						<Col sm={8} xs={24}>
							<FormInputLabel min={0} type="number" id="price_per_piece" label="Price (Piece)" />
							{errors.price_per_piece && touched.price_per_piece ? (
								<FieldError error={errors.price_per_piece} />
							) : null}
						</Col>
						<Col sm={8} xs={24}>
							<FormInputLabel
								min={0}
								type="number"
								id="discounted_price_per_piece1"
								label="Discounted Price per Piece 1"
							/>
							{errors.discounted_price_per_piece1 && touched.discounted_price_per_piece1 ? (
								<FieldError error={errors.discounted_price_per_piece1} />
							) : null}
						</Col>
						<Col sm={8} xs={24}>
							<FormInputLabel
								min={0}
								type="number"
								id="discounted_price_per_piece2"
								label="Discounted Price per Piece 2"
							/>
							{errors.discounted_price_per_piece2 && touched.discounted_price_per_piece2 ? (
								<FieldError error={errors.discounted_price_per_piece2} />
							) : null}
						</Col>

						<Col sm={8} xs={24}>
							<FormInputLabel min={0} type="number" id="price_per_bulk" label="Price (Bulk)" />
							{errors.price_per_bulk && touched.price_per_bulk ? (
								<FieldError error={errors.price_per_bulk} />
							) : null}
						</Col>
						<Col sm={8} xs={24}>
							<FormInputLabel
								min={0}
								type="number"
								id="discounted_price_per_bulk1"
								label="Discounted Price per Bulk 1"
							/>
							{errors.discounted_price_per_bulk1 && touched.discounted_price_per_bulk1 ? (
								<FieldError error={errors.discounted_price_per_bulk1} />
							) : null}
						</Col>
						<Col sm={8} xs={24}>
							<FormInputLabel
								min={0}
								type="number"
								id="discounted_price_per_bulk2"
								label="Discounted Price per Bulk 2"
							/>
							{errors.discounted_price_per_bulk2 && touched.discounted_price_per_bulk2 ? (
								<FieldError error={errors.discounted_price_per_bulk2} />
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
