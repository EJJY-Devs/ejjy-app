import { Button, Col, Input, message, Modal, Row, Select, Spin } from 'antd';
import { RequestErrors } from 'components';
import {
	FieldError,
	FormattedInputNumber,
	FormInputLabel,
	Label,
} from 'components/elements';
import { filterOption, getFullName, Transaction } from 'ejjy-global';
import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { ErrorMessage, Form, Formik } from 'formik';
import { orderOfPaymentPurposes, SEARCH_DEBOUNCE_TIME } from 'global';
import {
	useAccounts,
	useCheckInvoiceValidity,
	useOrderOfPaymentsCreate,
} from 'hooks';
import _, { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import {
	convertIntoArray,
	formatInPeso,
	getLocalBranchId,
	getLocalApiUrl,
} from 'utils';
import { Payor } from 'utils/type';
import * as Yup from 'yup';

type ModalProps = {
	payor: Payor;
	transaction?: Transaction;
	onSuccess: () => void;
	onClose: () => void;
};

export const CreateOrderOfPaymentModal = ({
	payor,
	transaction,
	onSuccess,
	onClose,
}: ModalProps) => {
	// STATES
	const [invoiceValidityError, setInvoiceValidityError] = useState(null);
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	// CUSTOM HOOKS
	const {
		mutateAsync: createOrderOfPayment,
		isLoading: isCreatingOrderOfPayment,
		error: createOrderOfPaymentError,
	} = useOrderOfPaymentsCreate();
	const {
		mutateAsync: checkInvoiceValidity,
		isLoading: isCheckingInvoiceValidity,
		error: checkInvoiceValidityError,
	} = useCheckInvoiceValidity();

	// METHODS
	const handleCreate = async (formData) => {
		if (invoiceValidityError) {
			setInvoiceValidityError(null);
		}

		if (formData.chargeSalesTransactionId) {
			const response = await checkInvoiceValidity({
				orNumber: formData.chargeSalesTransactionId,
			});

			if (response.data === false) {
				setInvoiceValidityError(
					'Inputted invoice number is invalid or does not exist.',
				);
				return;
			}
		}

		// Prompt for authorization to select creator
		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			onSuccess: async (authorizedUser) => {
				await createOrderOfPayment({
					createdById: authorizedUser.id,
					payorId: formData.payorId,
					branchId: getLocalBranchId() ? Number(getLocalBranchId()) : undefined,
					amount: formData.amount,
					purpose: formData.purpose,
					extraDescription:
						formData.purpose === orderOfPaymentPurposes.OTHERS
							? formData.purposeOthers
							: undefined,
					chargeSalesTransactionId:
						formData.chargeSalesTransactionId || undefined,
				});
				setAuthorizeConfig(null);
				onSuccess();
				onClose();
				message.success('Order of Payment was created successfully');
			},
			onCancel: () => setAuthorizeConfig(null),
		});
	};

	return (
		<>
			<Modal
				className="CreateOrderOfPaymentModal"
				footer={null}
				title="[Create] Order of Payment"
				centered
				closable
				open
				onCancel={onClose}
			>
				<RequestErrors
					errors={[
						...convertIntoArray(createOrderOfPaymentError?.errors, 'Create'),
						...convertIntoArray(
							checkInvoiceValidityError?.errors,
							'Invoice Validity',
						),
						invoiceValidityError,
					]}
					withSpaceBottom
				/>

				<CreateOrderOfPaymentForm
					isLoading={isCreatingOrderOfPayment || isCheckingInvoiceValidity}
					payor={payor}
					transaction={transaction}
					onClose={onClose}
					onSubmit={handleCreate}
				/>
			</Modal>

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</>
	);
};

type FormProps = {
	payor: Payor;
	transaction?: Transaction;
	isLoading: boolean;
	onSubmit: (formData) => void;
	onClose: () => void;
};

export const CreateOrderOfPaymentForm = ({
	payor,
	transaction,
	isLoading,
	onSubmit,
	onClose,
}: FormProps) => {
	// STATES
	const [accountSearch, setAccountSearch] = useState('');
	const [maxAmount, setMaxAmount] = useState(0);

	// CUSTOM HOOKS
	const {
		isFetching: isFetchingAccount,
		data: { accounts },
	} = useAccounts({
		params: { search: accountSearch },
		options: { enabled: !payor },
	});

	// METHODS
	useEffect(() => {
		const amount = Number(transaction?.total_amount || payor?.total_balance);

		if (amount) {
			setMaxAmount(amount);
		}
	}, [payor, transaction]);

	const getFormDetails = useCallback(
		() => ({
			defaultValues: {
				payorId: payor.account.online_id,
				amount: transaction?.total_amount || '',
				purpose: transaction ? orderOfPaymentPurposes.FULL_PAYMENT : null,
				purposeOthers: '',
				chargeSalesTransactionId: transaction?.invoice?.or_number,
			},
			schema: Yup.object().shape(
				{
					payorId: Yup.number().required().label('Payor'),
					amount: Yup.number().required().min(1).max(maxAmount).label('Amount'),
					purpose: Yup.string().required().nullable().label('Purpose').trim(),
					purposeOthers: Yup.string().when('purpose', {
						is: orderOfPaymentPurposes.OTHERS,
						then: Yup.string().required().label('Purpose Description').trim(),
					}),
					chargeSalesTransactionId: Yup.string().trim().nullable(),
				},
				[],
			),
		}),
		[maxAmount, transaction],
	);

	const handleSearchDebounced = useCallback(
		debounce((search) => {
			setAccountSearch(search);
		}, SEARCH_DEBOUNCE_TIME),
		[],
	);

	return (
		<Formik
			initialValues={getFormDetails().defaultValues}
			validationSchema={getFormDetails().schema}
			enableReinitialize
			onSubmit={(formData) => {
				onSubmit({
					...formData,
					chargeSalesTransactionId: _.trim(formData.chargeSalesTransactionId),
				});
			}}
		>
			{({ values, setFieldValue }) => (
				<Form>
					<Row gutter={[16, 16]}>
						<Col span={24}>
							<Label label="Payor" spacing />
							{payor ? (
								<Input value={getFullName(payor.account)} disabled />
							) : (
								<Select
									className="w-100"
									defaultActiveFirstOption={false}
									disabled={payor !== null}
									filterOption={false}
									notFoundContent={isFetchingAccount ? <Spin /> : null}
									value={values.payorId}
									showSearch
									onChange={(value) => {
										setFieldValue('payorId', value);
									}}
									onSearch={handleSearchDebounced}
								>
									{accounts.map((account) => (
										<Select.Option key={account.id} value={account.id}>
											{getFullName(account)}
										</Select.Option>
									))}
								</Select>
							)}

							<ErrorMessage
								name="payorId"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label
								label={`Amount (Total: ${formatInPeso(maxAmount)})`}
								spacing
							/>
							<FormattedInputNumber
								className="w-100"
								controls={false}
								value={values['amount']}
								onChange={(value) => {
									setFieldValue('amount', value);
								}}
							/>
							<ErrorMessage
								name="amount"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						<Col span={24}>
							<Label id="purpose" label="Purpose" spacing />
							<Select
								className="w-100"
								filterOption={filterOption}
								optionFilterProp="children"
								value={values.purpose}
								showSearch
								onChange={(value) => {
									setFieldValue('purpose', value);
									setFieldValue('purposeOthers', '');
								}}
							>
								<Select.Option
									key={orderOfPaymentPurposes.FULL_PAYMENT}
									value={orderOfPaymentPurposes.FULL_PAYMENT}
								>
									Full Payment
								</Select.Option>
								<Select.Option
									key={orderOfPaymentPurposes.PARTIAL_PAYMENT}
									value={orderOfPaymentPurposes.PARTIAL_PAYMENT}
								>
									Partial Payment
								</Select.Option>
								<Select.Option
									key={orderOfPaymentPurposes.OTHERS}
									value={orderOfPaymentPurposes.OTHERS}
								>
									Others
								</Select.Option>
							</Select>

							<ErrorMessage
								name="purpose"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>

						{values.purpose === orderOfPaymentPurposes.OTHERS && (
							<Col span={24}>
								<FormInputLabel id="purposeOthers" label="Purpose Descripton" />
								<ErrorMessage
									name="purposeOthers"
									render={(error) => <FieldError error={error} />}
								/>
							</Col>
						)}

						<Col span={24}>
							<Label
								id="chargeSalesTransactionId"
								label="Charge Sales Invoice # (Optional)"
								spacing
							/>
							<Input
								value={values['chargeSalesTransactionId']}
								onChange={(e) => {
									setFieldValue('chargeSalesTransactionId', e.target.value);
								}}
							/>
							<ErrorMessage
								name="chargeSalesTransactionId"
								render={(error) => <FieldError error={error} />}
							/>
						</Col>
					</Row>

					<div className="ModalCustomFooter">
						<Button disabled={isLoading} htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							Create
						</Button>
					</div>
				</Form>
			)}
		</Formik>
	);
};
