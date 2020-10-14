import { Divider } from 'antd';
import { FieldArray, Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { TableNormal } from '../../../../../components';
import { Button, FieldError, FormCheckbox, FormInput } from '../../../../../components/elements';
import { getDeliveryReceiptStatus, sleep } from '../../../../../utils/function';

const columns = [
	{ name: '', width: '80px' },
	{ name: 'Name' },
	{ name: 'Status' },
	{ name: 'Current Delivered', width: '120px', center: true },
	{ name: 'New Delivered', width: '150px', center: true },
	{ name: 'Current Received', width: '120px', center: true },
	{ name: 'New Received', width: '150px', center: true },
];

interface Props {
	deliveryReceiptProducts: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const CreateAdjustmentSlipForm = ({
	deliveryReceiptProducts,
	onSubmit,
	onClose,
	loading,
}) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				deliveryReceiptProducts: deliveryReceiptProducts.map((drProduct) => ({
					selected: true,
					is_adjusted: drProduct.is_adjusted,
					delivery_receipt_product_id: drProduct.id,
					new_delivered_quantity_piece: null,
					new_received_quantity_piece: null,
				})),
			},
			Schema: Yup.object().shape({
				deliveryReceiptProducts: Yup.array().of(
					Yup.object().shape({
						new_delivered_quantity_piece: Yup.number()
							.when('selected', {
								is: true,
								then: Yup.number().positive(),
								otherwise: Yup.number().notRequired(),
							})
							.nullable()
							.label('Qty'),
						new_received_quantity_piece: Yup.number()
							.when('selected', {
								is: true,
								then: Yup.number().positive(),
								otherwise: Yup.number().notRequired(),
							})
							.nullable()
							.label('Qty'),
					}),
				),
			}),
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[deliveryReceiptProducts],
	);

	const getSelectRadioButton = (index) => {
		return <FormCheckbox id={`deliveryReceiptProducts.${index}.selected`} />;
	};

	const getQuantity = (index, key, values, touched, errors) => {
		return (
			<>
				<FormInput
					type="number"
					id={`deliveryReceiptProducts.${index}.${key}`}
					disabled={!values?.deliveryReceiptProducts?.[index]?.selected}
				/>
				{errors?.deliveryReceiptProducts?.[index]?.[key] &&
				touched?.deliveryReceiptProducts?.[index]?.[key] ? (
					<FieldError error={errors?.deliveryReceiptProducts?.[index]?.[key]} />
				) : null}
			</>
		);
	};

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: any) => {
				if (deliveryReceiptProducts.length > 0) {
					setSubmitting(true);
					await sleep(500);
					setSubmitting(false);
					onSubmit(values);
				}
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
								data={deliveryReceiptProducts.map((drProduct, index) => [
									// Select
									getSelectRadioButton(index),
									// Name
									drProduct?.name,
									// Status
									getDeliveryReceiptStatus(
										`${drProduct.status}-${drProduct.is_adjusted}`,
										drProduct.status,
										drProduct.is_adjusted,
									),
									// Current Delivered
									drProduct?.delivered_quantity_piece,
									// New Delivered
									getQuantity(index, 'new_delivered_quantity_piece', values, touched, errors),
									// Current Received
									drProduct?.received_quantity_piece,
									// New Received
									getQuantity(index, 'new_received_quantity_piece', values, touched, errors),
								])}
								loading={loading}
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
									disabled={!deliveryReceiptProducts.length}
								/>
							</div>
						</Form>
					)}
				/>
			)}
		</Formik>
	);
};
