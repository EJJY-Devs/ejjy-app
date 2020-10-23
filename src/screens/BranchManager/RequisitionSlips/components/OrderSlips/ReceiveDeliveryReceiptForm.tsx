import { Col, Divider, Row } from 'antd';
import { FieldArray, Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import {
	Button,
	FieldError,
	FormInput,
	UncontrolledInput,
	Label,
} from '../../../../../components/elements';
import { sleep } from '../../../../../utils/function';

interface Props {
	products: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const ReceiveDeliveryReceiptForm = ({ products, onSubmit, onClose, loading }) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				products: products.map((product) => ({
					order_slip_product_id: product.order_slip_product_id,
					received_quantity_piece: product.received_quantity_piece,
				})),
			},
			Schema: Yup.object().shape({
				products: Yup.array().of(
					Yup.object().shape({
						received_quantity_piece: Yup.number().min(0).required().label('Quantity'),
					}),
				),
			}),
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[products],
	);

	const getRow = (name, index, touched, errors) => {
		return (
			<Row gutter={[25, 8]}>
				<Col xs={24} sm={12}>
					<Label label="Product" spacing />
					<UncontrolledInput placeholder={name} onChange={null} disabled />
				</Col>

				<Col xs={24} sm={12}>
					<Label label="Quantity" spacing />
					<FormInput type="number" id={`products.${index}.received_quantity_piece`} />
					{errors?.products?.[index]?.received_quantity_piece &&
					touched?.products?.[index]?.received_quantity_piece ? (
						<FieldError error={errors?.products?.[index]?.received_quantity_piece} />
					) : null}
				</Col>
			</Row>
		);
	};

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			onSubmit={async (values: any) => {
				if (products.length > 0) {
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
					name="products"
					render={() => (
						<Form className="form">
							<Row gutter={[0, 20]}>
								{products.map(({ name }, index) => (
									<Col span={24}>{getRow(name, index, touched, errors)}</Col>
								))}
							</Row>

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
									text="Receive"
									variant="primary"
									loading={loading || isSubmitting}
									disabled={!products.length}
								/>
							</div>
						</Form>
					)}
				/>
			)}
		</Formik>
	);
};
