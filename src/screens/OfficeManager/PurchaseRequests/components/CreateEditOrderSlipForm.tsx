import { Divider } from 'antd';
import { Field, FieldArray, Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { TableNormal } from '../../../../components';
import {
	Button,
	FieldError,
	FormCheckbox,
	FormInput,
	FormSelect,
} from '../../../../components/elements';
import { quantityTypeOptions } from '../../../../global/options';
import { quantityTypes } from '../../../../global/types';
import { sleep } from '../../../../utils/function';

const columns = [
	{ name: '', width: '80px' },
	{ name: 'Barcode' },
	{ name: 'Name' },
	{ name: 'Quantity', width: '200px' },
	{ name: 'Ordered' },
	{ name: 'Balance' },
	{ name: 'Assigned Personnel' },
];

interface Props {
	branchProducts: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const CreateEditOrderSlipForm = ({
	requestedProducts,
	assignedPersonnelOptions,
	onSubmit,
	onClose,
	loading,
}) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				requestedProducts: requestedProducts.map((requestedProduct) => ({
					selected: requestedProduct?.selected,
					quantity: requestedProduct?.quantity,
					quantity_type: requestedProduct?.quantity_type,
					product_id: requestedProduct?.product_id,
					assigned_personnel: requestedProduct?.assigned_personnel,
				})),
			},
			Schema: Yup.object().shape({
				requestedProducts: Yup.array().of(
					Yup.object().shape({
						quantity: Yup.number()
							.positive()
							.when('selected', {
								is: true,
								then: Yup.number().required('Qty required'),
								otherwise: Yup.number().notRequired(),
							}),
						assigned_personnel: Yup.number().when('selected', {
							is: true,
							then: Yup.number().required('Personnel required'),
							otherwise: Yup.number().notRequired(),
						}),
					}),
				),
			}),
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[requestedProducts],
	);

	const getExtraFields = (index) => (
		<Field type="hidden" name={`requestedProducts.${index}.product_id`} />
	);

	const getSelectRadioButton = (index) => {
		return <FormCheckbox id={`requestedProducts.${index}.selected`} />;
	};

	const getQuantity = (index, values, touched, errors) => {
		return (
			<>
				<div className="quantity-container">
					<FormInput
						type="number"
						id={`requestedProducts.${index}.quantity`}
						min={1}
						disabled={!values?.requestedProducts?.[index]?.selected}
					/>
					<FormSelect
						id={`requestedProducts.${index}.quantity_type`}
						options={quantityTypeOptions}
						disabled={!values?.requestedProducts?.[index]?.selected}
					/>
				</div>
				{errors?.requestedProducts?.[index]?.quantity &&
				touched?.requestedProducts?.[index]?.quantity ? (
					<FieldError error={errors?.requestedProducts?.[index]?.quantity} />
				) : null}
			</>
		);
	};

	const getOrdered = (index, quantity_piece, quantity_bulk, values) => {
		return values?.requestedProducts?.[index]?.quantity_type === quantityTypes.PIECE ? (
			<span>{quantity_piece}</span>
		) : (
			<span>{quantity_bulk}</span>
		);
	};

	const getBalance = (
		index,
		branch_current,
		branch_max_balance,
		branch_current_bulk,
		branch_max_balance_bulk,
		values,
	) => {
		return values?.requestedProducts?.[index]?.quantity_type === quantityTypes.PIECE ? (
			<span>{`${branch_current} / ${branch_max_balance}`}</span>
		) : (
			<span>{`${branch_current_bulk} / ${branch_max_balance_bulk}`}</span>
		);
	};

	const getAssignedPersonnel = (index, values) => {
		return (
			<FormSelect
				id={`requestedProducts.${index}.assigned_personnel`}
				options={assignedPersonnelOptions}
				disabled={!values?.requestedProducts?.[index]?.selected}
			/>
		);
	};

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: any) => {
				setSubmitting(true);
				await sleep(500);
				setSubmitting(false);
				onSubmit(values);
			}}
			enableReinitialize
		>
			{({ values, errors, touched }) => (
				<FieldArray
					name="requestedProducts"
					render={() => (
						<Form className="form">
							<TableNormal
								columns={columns}
								data={requestedProducts.map((requestedProduct, index) => [
									// Select
									<>
										{getSelectRadioButton(index)}
										{getExtraFields(index)}
									</>,
									// Barcode
									requestedProduct?.product_barcode,
									// Name
									requestedProduct?.product_name,
									// Quantity / Bulk | Pieces
									getQuantity(index, values, touched, errors),
									// Quantity / Bulk | Pieces
									getOrdered(
										index,
										requestedProduct?.quantity_piece,
										requestedProduct?.quantity_bulk,
										values,
									),
									// Current Balance
									getBalance(
										index,
										requestedProduct?.branch_current,
										requestedProduct?.branch_max_balance,
										requestedProduct?.branch_current_bulk,
										requestedProduct?.branch_max_balance_bulk,
										values,
									),
									// Assigned Personnel
									getAssignedPersonnel(index, values),
								])}
							/>

							<Divider dashed />

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
									text="Create"
									variant="primary"
									loading={loading || isSubmitting}
								/>
							</div>
						</Form>
					)}
				/>
			)}
		</Formik>
	);
};
