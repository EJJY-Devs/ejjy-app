import { Divider } from 'antd';
import { FieldArray, Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { TableNormal } from '../../../../components';
import { Button, FieldError, FormInput, FormSelect } from '../../../../components/elements';
import { quantityTypeOptions } from '../../../../global/options';
import { quantityTypes } from '../../../../global/types';
import { sleep } from '../../../../utils/function';

const columns = [{ name: 'Barcode' }, { name: 'Name' }, { name: 'Quantity', width: '200px' }];

interface Props {
	products: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const FulfillCheckForm = ({ products, onSubmit, onClose, loading }: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				products: products.map((product) => ({
					product_check_product_id: product.product_check_product_id,
					pieces_in_bulk: product.pieces_in_bulk,
					quantity_type: quantityTypes.PIECE,
					fulfilled_quantity_piece: '',
				})),
			},
			Schema: Yup.object().shape({
				products: Yup.array().of(
					Yup.object().shape({
						fulfilled_quantity_piece: Yup.number()
							.min(1, 'Must greater than zero')
							.required('Qty required'),
					}),
				),
			}),
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[products],
	);

	const getFulfilledQuantity = (index, touched, errors) => {
		return (
			<>
				<div className="quantity-container">
					<FormInput type="number" id={`products.${index}.fulfilled_quantity_piece`} />
					<FormSelect id={`products.${index}.quantity_type`} options={quantityTypeOptions} />
				</div>
				{errors?.products?.[index]?.fulfilled_quantity_piece &&
				touched?.products?.[index]?.fulfilled_quantity_piece ? (
					<FieldError error={errors?.products?.[index]?.fulfilled_quantity_piece} />
				) : null}
			</>
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
			{({ errors, touched }) => (
				<FieldArray
					name="products"
					render={() => (
						<Form className="form">
							<TableNormal
								columns={columns}
								data={products.map((product, index) => [
									// Name
									product?.name,
									// Barcode
									product?.barcode,
									// Quantity / Bulk | Pieces
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
									text="Submit"
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
