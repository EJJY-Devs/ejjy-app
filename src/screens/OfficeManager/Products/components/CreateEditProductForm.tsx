import { Col, Divider, Row } from 'antd';
import { Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import {
	Button,
	FieldError,
	FormInputLabel,
	FormRadioButton,
	FormTextareaLabel,
	Label,
} from '../../../../components/elements';
import { productTypes, unitOfMeasurementTypes } from '../../../../global/types';
import { sleep } from '../../../../utils/function';

interface ICreateProduct {
	id?: number;
	barcode?: string;
	textcode?: string;
	name: string;
	type: 'Wet' | 'Dry';
	unit_of_measurement: 'Weighing' | 'Non-Weighing';
	print_details: string;
	description: string;
	allowable_spoilage?: number | string;
	cost_per_piece: number;
	cost_per_bulk: number;
	reorder_point: number;
	max_balance: number;
	price_per_piece: number;
	price_per_bulk: number;
}

interface Props {
	product: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const CreateEditProductForm = ({ product, onSubmit, onClose, loading }: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				barcode: product?.barcode || '',
				textcode: product?.textcode || '',
				name: product?.name || '',
				type: product?.type || productTypes.WET,
				unit_of_measurement: product?.unit_of_measurement || unitOfMeasurementTypes.WEIGHING,
				print_details: product?.name || '',
				description: product?.name || '',
				allowable_spoilage: product?.allowable_spoilage * 100 || '',
				pieces_in_bulk: product?.pieces_in_bulk || '',
				cost_per_piece: product?.cost_per_piece || '',
				cost_per_bulk: product?.cost_per_bulk || '',
				reorder_point: product?.reorder_point || '',
				max_balance: product?.max_balance || '',
				price_per_piece: product?.price_per_piece || '',
				price_per_bulk: product?.price_per_bulk || '',
			},
			Schema: Yup.object().shape(
				{
					barcode: Yup.string()
						.max(50, 'Barcode/Textcode must be at most 50 characters')
						.test(
							'notBothAtTheSameTime',
							'You can only input either barcode or textcode',
							function (barcode) {
								return !(this.parent.textcode && barcode);
							},
						)
						.when('textcode', {
							is: (value) => !value?.length,
							then: Yup.string().required('Barcode/Textcode is a required field'),
						}),
					textcode: Yup.string()
						.max(50, 'Barcode/Textcode must be at most 50 characters')
						.test(
							'notBothAtTheSameTime',
							'You can only input either barcode or textcode',
							function (textcode) {
								return !(this.parent.barcode && textcode);
							},
						)
						.when('barcode', {
							is: (value) => !value?.length,
							then: Yup.string().required('Barcode/Textcode is a required field'),
						}),
					name: Yup.string().required().max(70).label('Name'),
					type: Yup.string().label('Type'),
					unit_of_measurement: Yup.string().label('Unit of Measurement'),
					print_details: Yup.string().required().label('Print Details'),
					description: Yup.string().required().label('Description'),
					pieces_in_bulk: Yup.number().required().min(0).label('Pieces in Bulk'),
					allowable_spoilage: Yup.number()
						.integer()
						.min(0)
						.max(99)
						.when(['type', 'unit_of_measurement'], {
							is: (type, unit_of_measurement) =>
								type === productTypes.WET &&
								unit_of_measurement === unitOfMeasurementTypes.WEIGHING,
							then: Yup.number().required(),
							otherwise: Yup.number().notRequired(),
						})
						.label('Allowable Spoilage'),
					cost_per_piece: Yup.number().required().min(0).label('Cost per Piece'),
					cost_per_bulk: Yup.number().required().min(0).label('Cost Per Bulk'),
					reorder_point: Yup.number().required().min(0).max(65535).label('Reorder Point'),
					max_balance: Yup.number().required().min(0).max(65535).label('Max Balance'),
					price_per_piece: Yup.number().required().min(0).label('Price per Piece'),
					price_per_bulk: Yup.number().required().min(0).label('Price per Bulk'),
				},
				[['barcode', 'textcode']],
			),
		}),
		[product],
	);

	const type = [
		{
			id: productTypes.WET,
			label: 'Wet',
			value: productTypes.WET,
		},
		{
			id: productTypes.DRY,
			label: 'Dry',
			value: productTypes.DRY,
		},
	];

	const unitOfMeasurement = [
		{
			id: unitOfMeasurementTypes.WEIGHING,
			label: 'Weighing',
			value: unitOfMeasurementTypes.WEIGHING,
		},
		{
			id: unitOfMeasurementTypes.NON_WEIGHING,
			label: 'Non-Weighing',
			value: unitOfMeasurementTypes.NON_WEIGHING,
		},
	];

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: ICreateProduct) => {
				setSubmitting(true);
				await sleep(500);
				setSubmitting(false);

				values.id = product?.id;
				onSubmit(values);
			}}
			enableReinitialize
		>
			{({ values, errors, touched }) => (
				<Form className="form">
					<Row gutter={[15, 15]}>
						<Col sm={12} xs={24}>
							<Row gutter={[15, 15]}>
								<Col xs={24} md={12}>
									<FormInputLabel id="barcode" label="Barcode" />
								</Col>
								<Col xs={24} md={12}>
									<FormInputLabel id="textcode" label="Textcode" />
								</Col>
								{(errors.textcode || errors.barcode) && (touched.textcode || touched.barcode) ? (
									<FieldError
										classNames="custom-field-error"
										error={errors.textcode || errors.barcode}
									/>
								) : null}
							</Row>
						</Col>
						<Col sm={12} xs={24}>
							<FormInputLabel id="name" label="Name" />
							{errors.name && touched.name ? <FieldError error={errors.name} /> : null}
						</Col>

						<Col sm={12} xs={24}>
							<Label label="Tag Type PT01" spacing />
							<FormRadioButton name="type" items={type} />
							{errors.type && touched.type ? <FieldError error={errors.type} /> : null}
						</Col>

						<Col sm={12} xs={24}>
							<Label label="Tag Type PT02" spacing />
							<FormRadioButton name="unit_of_measurement" items={unitOfMeasurement} />
							{errors.unit_of_measurement && touched.unit_of_measurement ? (
								<FieldError error={errors.unit_of_measurement} />
							) : null}
						</Col>

						<Col span={24}>
							<FormTextareaLabel id="print_details" label="Print Details" />
							{errors.print_details && touched.print_details ? (
								<FieldError error={errors.print_details} />
							) : null}
						</Col>

						<Col span={24}>
							<FormTextareaLabel id="description" label="Description" />
							{errors.description && touched.description ? (
								<FieldError error={errors.description} />
							) : null}
						</Col>

						<Divider dashed />

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
							<FormInputLabel min={0} type="number" id="pieces_in_bulk" label="Pieces in Bulk" />
							{errors.pieces_in_bulk && touched.pieces_in_bulk ? (
								<FieldError error={errors.pieces_in_bulk} />
							) : null}
						</Col>

						<Col span={12}>
							<FormInputLabel
								min={0}
								max={99}
								type="number"
								id="allowable_spoilage"
								label="Allowable Spoilage (%)"
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
							<FormInputLabel min={0} type="number" id="cost_per_piece" label="Cost (Piece)" />
							{errors.cost_per_piece && touched.cost_per_piece ? (
								<FieldError error={errors.cost_per_piece} />
							) : null}
						</Col>

						<Col sm={12} xs={24}>
							<FormInputLabel min={0} type="number" id="cost_per_bulk" label="Cost (Bulk)" />
							{errors.cost_per_bulk && touched.cost_per_bulk ? (
								<FieldError error={errors.cost_per_bulk} />
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
					</Row>

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
							text={product ? 'Edit' : 'Create'}
							variant="primary"
							loading={loading || isSubmitting}
						/>
					</div>
				</Form>
			)}
		</Formik>
	);
};
