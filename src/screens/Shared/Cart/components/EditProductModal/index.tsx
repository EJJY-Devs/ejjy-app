/* eslint-disable react/no-this-in-sfc */
import { Col, Divider, InputNumber, message, Modal, Row, Space } from 'antd';
import { FieldError, Label } from 'components/elements';
import { ErrorMessage, Form, Formik } from 'formik';
import { unitOfMeasurementTypes } from 'global';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import CartButton from 'screens/Shared/Cart/components/CartButton';
import { WEIGHING_DECIMAL_DIGITS } from 'screens/Shared/Cart/data';
import { useBoundStore } from 'screens/Shared/Cart/stores/useBoundStore';
import * as Yup from 'yup';
import './style.scss';

interface Props {
	product: any;
	onClose: any;
}

export const EditProductModal = ({ product, onClose }: Props) => {
	// CUSTOM HOOKS
	const editProduct = useBoundStore((state: any) => state.editProduct);

	// METHODS
	const handleSubmit = (formData) => {
		editProduct({
			key: product.product.key,
			product: {
				...product,
				quantity: formData.quantity,
			},
		});

		message.success(`${product.product.name} was edited successfully.`);
		onClose();
	};

	return (
		<Modal
			className="EditProductModal Modal__hasFooter"
			footer={null}
			title={`[Edit] ${product.product.name}`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<EditProductForm
				product={product}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

export const EditProductForm = ({ product, onClose, onSubmit }) => {
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
								className="w-100 EditProductForm_inputQuantity"
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
