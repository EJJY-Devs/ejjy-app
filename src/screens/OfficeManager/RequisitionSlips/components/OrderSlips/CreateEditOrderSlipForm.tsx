import { Divider } from 'antd';
import { FieldArray, Form, Formik } from 'formik';
import { min } from 'lodash';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { TableNormal } from '../../../../../components';
import {
	Button,
	FieldError,
	FormCheckbox,
	FormInput,
	FormSelect,
} from '../../../../../components/elements';
import { quantityTypeOptions } from '../../../../../global/options';
import { quantityTypes } from '../../../../../global/types';
import { sleep } from '../../../../../utils/function';

const columns = [
	{ name: '', width: '80px' },
	{ name: 'Barcode' },
	{ name: 'Name' },
	{ name: 'Quantity', width: '200px' },
	{ name: 'Qty Reqstd', tooltip: 'Quantity Requested' },
	{ name: 'Balance', tooltip: "Assigned branch's remaining balance" },
	{ name: 'Assigned Personnel' },
];

interface Props {
	orderSlip: any;
	requestedProducts: any;
	assignedPersonnelOptions: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const CreateEditOrderSlipForm = ({
	orderSlip,
	requestedProducts,
	assignedPersonnelOptions,
	onSubmit,
	onClose,
	loading,
}: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				requestedProducts: requestedProducts.map((requestedProduct) => ({
					selected: requestedProduct?.selected,
					order_slip_product_id: requestedProduct?.order_slip_product_id,
					quantity: requestedProduct?.quantity,
					quantity_type: requestedProduct?.quantity_type,
					product_id: requestedProduct?.product_id,
					assigned_personnel: requestedProduct?.assigned_personnel,
					pieces_in_bulk: requestedProduct?.product_pieces_in_bulk,
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
							})
							.label('Qty'),
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

	const getSelectRadioButton = (index) => {
		return <FormCheckbox id={`requestedProducts.${index}.selected`} />;
	};

	const getQuantity = (index, values, touched, errors, maxPiece, maxBulk) => {
		return (
			<>
				<div className="quantity-container">
					<FormInput
						type="number"
						id={`requestedProducts.${index}.quantity`}
						min={0}
						max={
							values?.requestedProducts?.[index]?.quantity_type === quantityTypes.PIECE
								? maxPiece
								: maxBulk
						}
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
				if (requestedProducts.length > 0) {
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
								data={requestedProducts.map((requestedProduct, index) => [
									// Select
									getSelectRadioButton(index),
									// Barcode
									requestedProduct?.product_barcode,
									// Name
									requestedProduct?.product_name,
									// Quantity / Bulk | Pieces
									getQuantity(
										index,
										values,
										touched,
										errors,
										min([
											requestedProduct?.branch_current,
											requestedProduct?.ordered_quantity_piece,
										]),
										min([
											requestedProduct?.branch_current_bulk,
											requestedProduct?.ordered_quantity_bulk,
										]),
									),
									// Order / Bulk | Pieces
									getOrdered(
										index,
										requestedProduct?.ordered_quantity_piece,
										requestedProduct?.ordered_quantity_bulk,
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
									text={orderSlip ? 'Edit' : 'Create'}
									variant="primary"
									loading={loading || isSubmitting}
									disabled={!requestedProducts.length}
								/>
							</div>
						</Form>
					)}
				/>
			)}
		</Formik>
	);
};
