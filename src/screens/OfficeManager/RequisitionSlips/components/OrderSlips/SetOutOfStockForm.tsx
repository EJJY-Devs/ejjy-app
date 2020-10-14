import { Divider } from 'antd';
import { FieldArray, Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import { TableNormal } from '../../../../../components';
import { Button, FormCheckbox } from '../../../../../components/elements';
import { sleep } from '../../../../../utils/function';

const columns = [{ name: '', width: '80px' }, { name: 'Barcode' }, { name: 'Name' }];

interface Props {
	products: any;
	onSubmit: any;
	onClose: any;
	loading: boolean;
}

export const SetOutOfStockForm = ({ products, onSubmit, onClose, loading }: Props) => {
	const [isSubmitting, setSubmitting] = useState(false);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				products: products.map(({ requisition_slip_product_id }) => ({
					selected: false,
					requisition_slip_product_id,
				})),
			},
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[products],
	);

	const getSelectRadioButton = (index) => {
		return <FormCheckbox id={`products.${index}.selected`} />;
	};

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
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
			{() => (
				<FieldArray
					name="products"
					render={() => (
						<Form className="form">
							<TableNormal
								columns={columns}
								data={products.map((product, index) => [
									// Select
									getSelectRadioButton(index),
									// Barcode
									product?.product_barcode,
									// Name
									product?.product_name,
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
									text="Submit"
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
