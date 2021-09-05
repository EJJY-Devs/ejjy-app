import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { ErrorMessage, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';
import {
	Button,
	FieldError,
	FormInput,
	FormSelect,
} from '../../../../components/elements';
import { quantityTypeOptions } from '../../../../global/options';
import { quantityTypes } from '../../../../global/types';
import { sleep } from '../../../../utils/function';

const columns: ColumnsType = [
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Quantity Received', dataIndex: 'quantity' },
];

interface Props {
	returnItemSlip: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const FulfillReturnItemSlipForm = ({
	returnItemSlip,
	onSubmit,
	onClose,
	loading,
}: Props) => {
	// STATES
	const [data, setData] = useState([]);
	const [isSubmitting, setSubmitting] = useState(false);

	// METHODS
	useEffect(() => {
		setData(
			returnItemSlip.products.map((product, index) => ({
				key: product.id,
				name: product.product.name,
				quantity: renderQuantity(`products.${index}`),
			})),
		);
	}, [returnItemSlip]);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				products: returnItemSlip.products.map((product) => ({
					product_id: product.product.id,
					name: product.product.name,
					piecesInBulk: 1,
					quantity: '',
					quantityType: quantityTypes.PIECE,
				})),
			},
			Schema: Yup.object().shape({
				products: Yup.array().of(
					Yup.object().shape({
						quantity: Yup.number()
							.required()
							.nullable()
							.min(0)
							.max(65535)
							.label('Quantity'),
					}),
				),
			}),
		}),
		[returnItemSlip],
	);

	const renderQuantity = (fieldKey) => (
		<>
			<div className="QuantityContainer">
				<FormInput type="number" id={`${fieldKey}.quantity`} />
				<FormSelect
					id={`${fieldKey}.quantityType`}
					options={quantityTypeOptions}
				/>
			</div>
			<ErrorMessage
				name={`${fieldKey}.quantity`}
				render={(error) => <FieldError error={error} />}
			/>
		</>
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (formData, { resetForm }) => {
				setSubmitting(true);
				await sleep(500);
				setSubmitting(false);

				onSubmit(formData, resetForm);
			}}
			enableReinitialize
		>
			<Form>
				<Table
					rowKey="key"
					columns={columns}
					dataSource={data}
					pagination={false}
					loading={loading || isSubmitting}
				/>

				<div className="ModalCustomFooter">
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
		</Formik>
	);
};
