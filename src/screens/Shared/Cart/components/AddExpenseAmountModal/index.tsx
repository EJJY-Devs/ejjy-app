import { Col, Divider, InputNumber, message, Modal, Row, Space } from 'antd';
import { FieldError, Label } from 'components/elements';
import { ErrorMessage, Form, Formik } from 'formik';
import React, { useEffect, useRef } from 'react';
import * as Yup from 'yup';
import { useBoundStore } from '../../stores/useBoundStore';
import CartButton from '../CartButton';
import './style.scss';

interface Props {
	product: any;
	onSuccess: any;
	onClose: any;
}

// Expense Voucher's equivalent of AddProductModal: instead of picking a
// Quantity, the user enters the line item's Amount here before it's added to
// the cart. The Amount cell in ProductTable stays editable afterwards, so a
// wrong entry can still be corrected without reopening this modal.
export const AddExpenseAmountModal = ({
	product,
	onClose,
	onSuccess,
}: Props) => {
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

		// Check if product allows multiple instances
		const allowsMultiple = product?.product?.is_multiple_instance;

		if (existingProduct && !allowsMultiple) {
			// If not allowed multiple, add onto the existing line's amount
			editProduct({
				key: product.product.key,
				product: {
					...existingProduct,
					amount: (Number(existingProduct.amount) || 0) + formData.amount,
				},
			});
		} else if (existingProduct && allowsMultiple) {
			// Add duplicate immediately after original
			addProduct(
				{ ...product, quantity: 1, amount: formData.amount },
				true,
				product.product.key,
			);
		} else {
			// Default add logic
			addProduct({ ...product, quantity: 1, amount: formData.amount });
		}

		message.success(`${product.product.name} was added successfully.`);
		onClose();
		onSuccess();
	};

	return (
		<Modal
			className="Modal__hasFooter"
			footer={null}
			title={`Add Amount - ${product?.product?.name}`}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<AddExpenseAmountForm
				product={product}
				onClose={onClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

export const AddExpenseAmountForm = ({ product, onClose, onSubmit }) => {
	// REFS
	const inputRef = useRef(null);

	// METHODS
	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 500);
	}, [inputRef.current]);

	return (
		<Formik
			initialValues={{ amount: '' }}
			validationSchema={Yup.object().shape({
				amount: Yup.number().required().moreThan(0).label('Amount'),
			})}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit({ amount: Number(formData.amount) });
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label={`Amount - ${product?.product?.name}`} spacing />
							<InputNumber
								ref={inputRef}
								className="w-100 AddExpenseAmountForm_inputAmount"
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
								value={values['amount']}
								onChange={(value) => {
									setFieldValue('amount', value);
								}}
								onFocus={(e: any) => e.target.select()}
							/>
							<ErrorMessage
								name="amount"
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
