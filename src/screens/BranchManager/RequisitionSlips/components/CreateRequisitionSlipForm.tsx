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
import { convertToBulk, getBranchProductStatus, sleep } from '../../../../utils/function';

const columns = [
	{ name: '', width: '80px' },
	{ name: 'Name' },
	{ name: 'Quantity', width: '200px' },
	{ name: 'Balance' },
	{ name: 'Status' },
];

interface Props {
	branchProducts: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const CreateRequisitionSlipForm = ({
	branchProducts,
	onSubmit,
	onClose,
	loading,
}: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				branchProducts: branchProducts.map((branchProduct) => ({
					selected: true,
					quantity: '',
					quantity_type: quantityTypes.PIECE,
					product_id: branchProduct?.product?.id,
					pieces_in_bulk: branchProduct?.product?.pieces_in_bulk,
				})),
			},
			Schema: Yup.object().shape({
				branchProducts: Yup.array().of(
					Yup.object().shape({
						selected: Yup.boolean(),
						quantity: Yup.number()
							.min(1, 'Must greater than zero')
							.when('selected', {
								is: true,
								then: Yup.number().required('Qty required'),
								otherwise: Yup.number().notRequired(),
							}),
					}),
				),
			}),
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[branchProducts],
	);

	const getExtraFields = (index) => (
		<Field type="hidden" name={`branchProducts.${index}.product_id`} />
	);

	const getSelectRadioButton = (index) => <FormCheckbox id={`branchProducts.${index}.selected`} />;

	const getQuantity = (index, values, touched, errors) => {
		return (
			<>
				<div className="quantity-container">
					<FormInput
						type="number"
						id={`branchProducts.${index}.quantity`}
						min={1}
						disabled={!values?.branchProducts?.[index]?.selected}
					/>
					<FormSelect
						id={`branchProducts.${index}.quantity_type`}
						options={quantityTypeOptions}
						disabled={!values?.branchProducts?.[index]?.selected}
					/>
				</div>
				{errors?.branchProducts?.[index]?.quantity && touched?.branchProducts?.[index]?.quantity ? (
					<FieldError error={errors?.branchProducts?.[index]?.quantity} />
				) : null}
			</>
		);
	};

	const getCurrentBalance = (index, current_balance, pieces_in_bulk, values) => {
		return values?.branchProducts?.[index]?.quantity_type === quantityTypes.PIECE ? (
			<span>{current_balance}</span>
		) : (
			<span>{convertToBulk(current_balance, pieces_in_bulk)}</span>
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
					name="branchProducts"
					render={() => (
						<Form className="form">
							<TableNormal
								columns={columns}
								data={branchProducts.map((branchProduct, index) => [
									// Select
									<>
										{getSelectRadioButton(index)}
										{getExtraFields(index)}
									</>,
									// Name
									branchProduct?.product?.name,
									// Quantity / Bulk | Pieces
									getQuantity(index, values, touched, errors),
									// Current Balance
									getCurrentBalance(
										index,
										branchProduct?.current_balance,
										branchProduct?.product?.pieces_in_bulk,
										values,
									),
									// Status
									getBranchProductStatus(branchProduct?.product_status),
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
