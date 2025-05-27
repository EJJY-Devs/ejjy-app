import { Col, Divider, message, Modal, Row } from 'antd';
import { RequestErrors } from 'components';
import { Button, FieldError, FormInputLabel } from 'components/elements';
import { getKeyDownCombination } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { SHOW_HIDE_SHORTCUT, unitOfMeasurementTypes } from 'global';
import { useBranchProductBalanceEdit, useBranchProductEdit } from 'hooks';
import { useUserStore } from 'stores';
import { isInteger } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { confirmPassword, convertIntoArray } from 'utils';
import * as Yup from 'yup';

interface Props {
	branchProduct: any;
	onClose: any;
}

export const EditBranchProductBalanceModal = ({
	branchProduct,
	onClose,
}: Props) => {
	// STATES
	const [isCurrentBalanceVisible, setIsCurrentBalanceVisible] = useState(false);

	// CUSTOM HOOKS
	const {
		mutateAsync: editBranchProductBalance,
		isLoading: isEditingBalance,
		error: editBalanceError,
	} = useBranchProductBalanceEdit();

	const {
		mutateAsync: editBranchProduct,
		isLoading: isEditingProduct,
		error: editProductError,
	} = useBranchProductEdit();

	const user = useUserStore((state) => state.user);

	const isLoading = isEditingBalance || isEditingProduct;
	const errors = editBalanceError?.errors || editProductError?.errors;

	// METHODS
	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isCurrentBalanceVisible]);

	const handleSubmit = async (formData) => {
		try {
			if (isCurrentBalanceVisible && formData.currentBalance !== undefined) {
				// Update current_balance only
				await editBranchProductBalance({
					id: branchProduct.id,
					value: formData.currentBalance,
				});
				message.success('Branch product balance was edited successfully');
			} else {
				// Update other fields
				await editBranchProduct({
					id: branchProduct.id,
					maxBalance: formData.maxBalance,
					isDailyChecked: branchProduct.is_daily_checked,
					isRandomlyChecked: branchProduct.is_randomly_checked,
					isSoldInBranch: branchProduct.is_sold_in_branch,
					actingUserId: user.id,
				});
				message.success('Branch product was edited successfully');
			}
			handleClose();
		} catch (error) {
			// Handle errors if needed here
		}
	};

	const handleKeyDown = (event) => {
		const key = getKeyDownCombination(event);

		if (SHOW_HIDE_SHORTCUT.includes(key)) {
			event.preventDefault();
			if (isCurrentBalanceVisible) {
				setIsCurrentBalanceVisible(false);
			} else {
				confirmPassword({
					onSuccess: () => setIsCurrentBalanceVisible(true),
				});
			}
		}
	};

	const handleClose = () => {
		setIsCurrentBalanceVisible(false);
		onClose();
	};

	return (
		<Modal
			footer={null}
			title={
				<>
					<span>[Edit] Branch Product</span>
					<span className="ModalTitleMainInfo">
						{branchProduct.product.name}
					</span>
				</>
			}
			centered
			closable
			visible
			onCancel={handleClose}
		>
			<RequestErrors errors={convertIntoArray(errors)} withSpaceBottom />

			<EditBranchProductBalanceForm
				branchProduct={branchProduct}
				isCurrentBalanceVisible={isCurrentBalanceVisible}
				isLoading={isLoading}
				onClose={handleClose}
				onSubmit={handleSubmit}
			/>
		</Modal>
	);
};

interface FormProps {
	branchProduct: any;
	onSubmit: any;
	onClose: any;
	isLoading: boolean;
	isCurrentBalanceVisible: boolean;
}

export const EditBranchProductBalanceForm = ({
	branchProduct,
	onSubmit,
	onClose,
	isLoading,
	isCurrentBalanceVisible,
}: FormProps) => {
	const getFormDetails = useCallback(
		() => ({
			DefaultValues: {
				maxBalance: branchProduct.max_balance,
				currentBalance: branchProduct.current_balance,
			},
			Schema: Yup.object().shape({
				maxBalance: Yup.number()
					.required()
					.moreThan(0)
					.test(
						'is-whole-number',
						'Non-weighing items require whole number quantity.',
						(value) =>
							branchProduct.product.unit_of_measurement ===
							unitOfMeasurementTypes.NON_WEIGHING
								? isInteger(Number(value))
								: true,
					)
					.label('Max Balance'),
				currentBalance: isCurrentBalanceVisible
					? Yup.number()
							.required()
							.min(0)
							.test(
								'is-whole-number',
								'Non-weighing items require whole number quantity.',
								(value) =>
									branchProduct?.product?.unit_of_measurement ===
									unitOfMeasurementTypes.NON_WEIGHING
										? isInteger(Number(value))
										: true,
							)
							.label('Current Balance')
					: undefined,
			}),
		}),
		[branchProduct, isCurrentBalanceVisible],
	);

	return (
		<Formik
			initialValues={getFormDetails().DefaultValues}
			validationSchema={getFormDetails().Schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit({
					...formData,
					currentBalance: isCurrentBalanceVisible
						? formData.currentBalance
						: undefined,
				});
			}}
		>
			<Form>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<FormInputLabel id="maxBalance" label="Max Balance" type="number" />
						<ErrorMessage
							name="maxBalance"
							render={(error) => <FieldError error={error} />}
						/>
					</Col>

					{isCurrentBalanceVisible && (
						<>
							<Divider dashed>HIDDEN FIELDS</Divider>

							<Col span={24}>
								<FormInputLabel
									id="currentBalance"
									isWholeNumber={
										branchProduct?.product?.unit_of_measurement ===
										unitOfMeasurementTypes.NON_WEIGHING
									}
									label="Add Current Balance"
									type="number"
								/>
								<ErrorMessage
									name="currentBalance"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						</>
					)}
				</Row>

				<div className="ModalCustomFooter">
					<Button
						disabled={isLoading}
						text="Cancel"
						type="button"
						onClick={onClose}
					/>
					<Button
						loading={isLoading}
						text="Edit"
						type="submit"
						variant="primary"
					/>
				</div>
			</Form>
		</Formik>
	);
};
