import { Divider } from 'antd';
import { FieldArray, Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { TableNormal } from '../../../../components';
import { Button, FieldError, FormInput, FormSelect } from '../../../../components/elements';
import { quantityTypeOptions } from '../../../../global/options';
import { quantityTypes } from '../../../../global/types';
import { convertToBulk, sleep } from '../../../../utils/function';

const columns = [
	{ name: 'Barcode' },
	{ name: 'Ordered' },
	{ name: 'Name' },
	{ name: 'Quantity', width: '200px' },
];

interface Props {
	preparationSlipProducts: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const FulfillPreparationSlipForm = ({
	preparationSlipProducts,
	onSubmit,
	onClose,
	loading,
}: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				preparationSlipProducts: preparationSlipProducts.map((product) => ({
					pieces_in_bulk: product.pieces_in_bulk,
					quantity_type: product.quantity_type,
					order_slip_product_id: product.order_slip_product_id,
					product_id: product.product_id,
					quantity: product.quantity,
					fulfilled_quantity: product.fulfilled_quantity || '',
					assigned_person_id: product.assigned_person_id,
				})),
			},
			Schema: Yup.object().shape({
				preparationSlipProducts: Yup.array().of(
					Yup.object().shape({
						fulfilled_quantity: Yup.number()
							.min(1, 'Must greater than zero')
							.required('Qty required'),
					}),
				),
			}),
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[preparationSlipProducts],
	);

	const getFulfilledQuantity = (index, touched, errors) => {
		return (
			<>
				<div className="quantity-container">
					<FormInput
						type="number"
						id={`preparationSlipProducts.${index}.fulfilled_quantity`}
						min={1}
					/>
					<FormSelect
						id={`preparationSlipProducts.${index}.quantity_type`}
						options={quantityTypeOptions}
					/>
				</div>
				{errors?.preparationSlipProducts?.[index]?.fulfilled_quantity &&
				touched?.preparationSlipProducts?.[index]?.fulfilled_quantity ? (
					<FieldError error={errors?.preparationSlipProducts?.[index]?.fulfilled_quantity} />
				) : null}
			</>
		);
	};

	const getOrdered = (index, ordered, pieces_in_bulk, values) => {
		return values?.preparationSlipProducts?.[index]?.quantity_type === quantityTypes.PIECE ? (
			<span>{ordered}</span>
		) : (
			<span>{convertToBulk(ordered, pieces_in_bulk)}</span>
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
					name="preparationSlipProducts"
					render={() => (
						<Form className="form">
							<TableNormal
								columns={columns}
								data={preparationSlipProducts.map((product, index) => [
									// Name
									product?.name,
									// Ordered
									getOrdered(index, product?.quantity, product?.pieces_in_bulk, values),
									// Barcode
									product?.barcode,
									// Fulfilled quantity / Bulk | Pieces
									getFulfilledQuantity(index, touched, errors),
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
									text="Fulfill"
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
