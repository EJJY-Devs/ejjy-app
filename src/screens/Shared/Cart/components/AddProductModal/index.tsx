import { Col, Divider, InputNumber, message, Modal, Row, Space } from 'antd';
import { FieldError, Label } from 'components/elements';
import { ErrorMessage, Form, Formik } from 'formik';
import { unitOfMeasurementTypes } from 'global';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import * as Yup from 'yup';
import { WEIGHING_DECIMAL_DIGITS } from '../../data';
import { useBoundStore } from '../../stores/useBoundStore';
import CartButton from '../CartButton';
import './style.scss';

interface Props {
	product: any;
	onSuccess: any;
	onClose: any;
}

export const AddProductModal = ({ product, onClose, onSuccess }: Props) => {
	// CUSTOM HOOKS
	const { products, addProduct, editProduct } = useBoundStore((state: any) => ({
		products: state.products,
		addProduct: state.addProduct,
		editProduct: state.editProduct,
	}));

	// METHODS
	const handleSubmit = (formData) => {
		const existingProduct = products.find(
			(p) => p?.product?.key === product?.product?.key,
		);

		if (existingProduct) {
			editProduct({
				key: product.product.key,
				product: {
					...existingProduct,
					quantity: existingProduct.quantity + formData.quantity, // Increase quantity
				},
			});
		} else {
			addProduct({
				...product,
				quantity: formData.quantity,
			});
		}

		message.success(`${product.product.name} was added successfully.`);
		onClose();
		onSuccess();
	};

	return (
		<Modal
			className="Modal__hasFooter"
			footer={null}
			title="Add Product"
			centered
			closable
			visible
			onCancel={onClose}
		>
			<AddProductForm
				product={product}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

export const AddProductForm = ({ product, onClose, onSubmit }) => {
	// REFS
	const inputRef = useRef(null);

	// METHODS
	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 500);
	}, [inputRef.current]);

	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				quantity: '',
			},
			Schema: Yup.object().shape({
				quantity: Yup.number()
					.required()
					.moreThan(0)
					.test(
						'is-whole-number',
						'Non-weighing items require whole number quantity.',
						(value) =>
							product.unit_of_measurement === unitOfMeasurementTypes.WEIGHING
								? true
								: _.isInteger(Number(value)),
					)
					.label('Quantity'),
			}),
		}),
		[product],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit({ quantity: Number(formData.quantity) });
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label="Quantity" spacing />
							<InputNumber
								ref={inputRef}
								className="w-100 AddProductForm_inputQuantity"
								controls={false}
								precision={
									product.unit_of_measurement ===
									unitOfMeasurementTypes.WEIGHING
										? WEIGHING_DECIMAL_DIGITS
										: 0
								}
								value={values['quantity']}
								onChange={(value) => {
									setFieldValue('quantity', value);
								}}
							/>
							<ErrorMessage
								name="quantity"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<Divider />

					<Space className="w-100" style={{ justifyContent: 'center' }}>
						<CartButton
							shortcutKey="ESC"
							size="lg"
							text="Cancel"
							type="button"
							onClick={onClose}
						/>
						<CartButton
							shortcutKey="ENTER"
							size="lg"
							text="Submit"
							type="submit"
							variant="primary"
						/>
					</Space>
				</Form>
			)}
		</Formik>
	);
};
