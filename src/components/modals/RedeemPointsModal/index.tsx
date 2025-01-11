import { Col, Divider, message, Modal, Row } from 'antd';
import { RequestErrors } from 'components/RequestErrors';
import { useUserAuthenticate } from 'ejjy-global';
import { ErrorMessage, Form, Formik } from 'formik';
import { useAccountRedeemPoints } from 'hooks';
import React, { useCallback } from 'react';
import { convertIntoArray, getLocalApiUrl, getId } from 'utils';
import * as Yup from 'yup';
import { Button, FieldError, FormInputLabel } from '../../elements';

interface Props {
	account: any;
	onSuccess: any;
	onClose: any;
}

export const RedeemPointsModal = ({ account, onSuccess, onClose }: Props) => {
	// CUSTOM HOOKS
	const {
		mutateAsync: redeemPoints,
		isLoading: isRedeemingPoints,
		error: redeemPointsError,
	} = useAccountRedeemPoints();
	const {
		mutateAsync: authenticateUser,
		isLoading: isAuthenticatingUser,
		error: authenticateUserError,
	} = useUserAuthenticate(null, getLocalApiUrl());

	// METHODS
	const getFormDetails = useCallback(
		() => ({
			defaultValues: {
				username: '',
				password: '',
				points: '',
				remarks: '',
			},
			schema: Yup.object().shape({
				username: Yup.string().required().label('Username').trim(),
				password: Yup.string().required().label('Password').trim(),
				points: Yup.number()
					.min(0)
					.max(Number(account.total_points_balance))
					.required()
					.label('Points'),
				remarks: Yup.string().required().label('Remarks').trim(),
			}),
		}),
		[account],
	);

	const handleSubmit = async (formData) => {
		const { data } = await authenticateUser({
			login: formData.username,
			password: formData.password,
		});

		await redeemPoints({
			id: account.id,
			redeemAuthorizerId: getId(data.id),
			redeemedPoints: formData.points,
			redeemRemarks: formData.remarks,
		});

		message.success('Points redeemed successfully.');

		onSuccess();
		onClose();
	};

	return (
		<Modal
			footer={null}
			title="Redeem Points"
			width={600}
			centered
			closable
			visible
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(authenticateUserError?.errors),
					...convertIntoArray(redeemPointsError?.errors),
				]}
				withSpaceBottom
			/>

			<Formik
				initialValues={getFormDetails().defaultValues}
				validationSchema={getFormDetails().schema}
				onSubmit={(formData) => {
					handleSubmit(formData);
				}}
			>
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<FormInputLabel id="username" label="Authorizer's Username" />
							<ErrorMessage
								name="username"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
						<Col span={24}>
							<FormInputLabel
								id="password"
								label="Authorizer's Password"
								type="password"
							/>
							<ErrorMessage
								name="password"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Divider dashed />

						<Col span={24}>
							<FormInputLabel
								disabled={account.total_points_balance === 0}
								id="points"
								label={`Deduction (Balance: ${account.total_points_balance})`}
								type="number"
							/>
							<ErrorMessage
								name="points"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<FormInputLabel id="remarks" label="Remarks" />
							<ErrorMessage
								name="remarks"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button
							disabled={isRedeemingPoints || isAuthenticatingUser}
							text="Cancel"
							type="button"
							onClick={onClose}
						/>
						<Button
							loading={isRedeemingPoints || isAuthenticatingUser}
							text="Redeem"
							type="submit"
							variant="primary"
						/>
					</div>
				</Form>
			</Formik>
		</Modal>
	);
};
