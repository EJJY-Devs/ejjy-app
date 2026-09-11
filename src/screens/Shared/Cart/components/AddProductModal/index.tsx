import { Col, Divider, InputNumber, message, Modal, Row, Space } from 'antd';
import { FieldError, Label } from 'components/elements';
import { ErrorMessage, Form, Formik } from 'formik';
import { unitOfMeasurementTypes } from 'global';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import * as Yup from 'yup';
import InputNumberQuantity from 'components/elements/InputNumberQuantity';
import { useBoundStore } from '../../stores/useBoundStore';
import CartButton from '../CartButton';
import './style.scss';

interface Props {
	product: any;
	type?: string;
	onSuccess: any;
	onClose: any;
}
export const AddProductModal = ({
	product,
	type,
	onClose,
	onSuccess,
}: Props) => {
	// CUSTOM HOOKS
	const { products, addProduct, editProduct } = useBoundStore((state: any) => ({
		products: state.products,
		addProduct: state.addProduct,
		editProduct: state.editProduct,
	}));

	const isPurchase = type === 'Purchase';

	// METHODS
	const handleSubmit = (formData) => {
		const existingProduct = products.find(
			(p) => p?.product?.key === product?.product?.key,
		);

		// Check if product allows multiple instances
		const allowsMultiple = product?.product?.is_multiple_instance;

		const costOverride = isPurchase
			? { cost_per_piece: formData.costPerPiece }
			: {};

		if (existingProduct && !allowsMultiple) {
			// If not allowed multiple, just increase quantity
			editProduct({
				key: product.product.key,
				product: {
					...existingProduct,
					quantity: existingProduct.quantity + formData.quantity,
					...costOverride,
				},
			});
		} else if (existingProduct && allowsMultiple) {
			// Add duplicate immediately after original
			addProduct(
				{ ...product, quantity: formData.quantity, ...costOverride },
				true,
				product.product.key,
			);
		} else {
			// Default add logic
			addProduct({ ...product, quantity: formData.quantity, ...costOverride });
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
				type={type}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

export const AddProductForm = ({ product, type, onClose, onSubmit }) => {
	// REFS
	const inputRef = useRef(null);

	const isPurchase = type === 'Purchase';

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
				costPerPiece: '',
				type: unitOfMeasurementTypes.NON_WEIGHING,
			},
			Schema: Yup.object().shape({
				quantity: Yup.number()
					.required()
					.when([], {
						is: () =>
							product.product.unit_of_measurement ===
							unitOfMeasurementTypes.WEIGHING,
						then: (schema) => schema, // No .moreThan(0) for WEIGHING
						otherwise: (schema) => schema.moreThan(0),
					})
					.test(
						'is-whole-number',
						'Non-weighing items require whole number quantity.',
						(value) =>
							product.product.unit_of_measurement ===
							unitOfMeasurementTypes.WEIGHING
								? true
								: _.isInteger(Number(value)),
					)
					.label('Quantity'),
				...(isPurchase
					? {
							costPerPiece: Yup.number().required().min(0).label('Unit Cost'),
					  }
					: {}),
			}),
		}),
		[product, isPurchase],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit({
					quantity: Number(formData.quantity),
					costPerPiece: Number(formData.costPerPiece) || 0,
				});
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={isPurchase ? 12 : 24}>
							<Label label="Quantity" spacing />
							<InputNumberQuantity
								ref={inputRef}
								className="w-100 AddProductForm_inputQuantity"
								controls={false}
								isWeighing={[
									values.type,
									product.product.unit_of_measurement,
								].includes(unitOfMeasurementTypes.WEIGHING)}
								value={values['quantity']}
								onChange={(value: string) => {
									setFieldValue('quantity', value);
								}}
							/>
							<ErrorMessage
								name="quantity"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						{isPurchase && (
							<Col span={12}>
								<Label label="Unit Cost" spacing />
								<InputNumber
									className="w-100 AddProductForm_inputCost"
									controls={false}
									formatter={(value, info) =>
										info?.userTyping || value === undefined || value === null
											? `₱${value}`
											: `₱${Number(value).toFixed(2)}`
									}
									min={0}
									parser={(value) =>
										Number((value || '').replace(/₱/g, '')) as any
									}
									precision={2}
									value={values['costPerPiece'] as any}
									onChange={(value) => {
										setFieldValue('costPerPiece', value);
									}}
								/>
								<ErrorMessage
									name="costPerPiece"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						)}
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
