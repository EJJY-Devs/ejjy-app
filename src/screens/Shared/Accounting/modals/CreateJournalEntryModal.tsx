import { Button, Form, Input, InputNumber, Modal, Select } from 'antd';
import { DEFAULT_PAGE } from 'global';
import useChartOfAccounts from 'hooks/useChartOfAccounts';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
	isSubmitting?: boolean;
	open: boolean;
	onClose: () => void;
	onSubmit: (values: {
		debitAccount: string;
		creditAccount: string;
		amount: number;
		remarks?: string;
	}) => Promise<void> | void;
}

export const CreateJournalEntryModal = ({
	isSubmitting,
	open,
	onClose,
	onSubmit,
}: Props) => {
	const [form] = Form.useForm();
	const amountRef = useRef<any>(null);
	const remarksRef = useRef<any>(null);
	const searchSelectRef = useRef<any>(null);
	const debitAccountValue = Form.useWatch('debitAccount', form);
	const creditAccountValue = Form.useWatch('creditAccount', form);
	const [activeField, setActiveField] = useState<
		'debitAccount' | 'creditAccount' | null
	>('debitAccount');
	const [isAmountLocked, setIsAmountLocked] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [selectedSearchValue, setSelectedSearchValue] = useState<string | null>(
		null,
	);
	const { data, isFetching } = useChartOfAccounts({
		params: {
			page: DEFAULT_PAGE,
			pageSize: 500,
		},
	});
	const { chartOfAccounts } = data || { chartOfAccounts: [] };
	const isAccountSelectionComplete = Boolean(
		debitAccountValue && creditAccountValue,
	);

	const resetModalState = () => {
		form.resetFields();
		setActiveField('debitAccount');
		setIsAmountLocked(false);
		setSearchText('');
		setSelectedSearchValue(null);
	};

	const handleClose = () => {
		resetModalState();
		onClose();
	};

	useEffect(() => {
		if (!open) {
			resetModalState();
			return;
		}

		resetModalState();

		setTimeout(() => {
			searchSelectRef.current?.focus?.();
		}, 0);
	}, [open]);

	const accountOptions = useMemo(() => {
		const blockedValues = [
			debitAccountValue,
			creditAccountValue,
		].filter((value): value is string => Boolean(value));
		const normalizedSearchText = searchText.trim().toLowerCase();

		return chartOfAccounts
			.map((account: any) => {
				const label = `${account.account_code} - ${account.account_name}`;
				return {
					label,
					value: label,
				};
			})
			.filter((option: any) => !blockedValues.includes(option.value))
			.filter(
				(option: any) =>
					!normalizedSearchText ||
					option.label.toLowerCase().includes(normalizedSearchText),
			);
	}, [chartOfAccounts, creditAccountValue, debitAccountValue, searchText]);

	const handleAccountSelect = (value: string) => {
		form.setFieldsValue({
			[activeField]: value,
		});

		if (activeField === 'debitAccount') {
			setActiveField('creditAccount');
		} else {
			setActiveField(null);
			setTimeout(() => {
				searchSelectRef.current?.blur?.();
				amountRef.current?.focus?.();
			}, 0);
		}
		setSelectedSearchValue(null);
		setSearchText('');
	};

	const lockAmountAndFocusRemarks = () => {
		const amountValue = form.getFieldValue('amount');
		if (!isAmountLocked && typeof amountValue === 'number' && amountValue > 0) {
			setIsAmountLocked(true);
			setTimeout(() => {
				remarksRef.current?.focus?.();
			}, 0);
		}
	};

	return (
		<Modal
			className="CreateJournalEntryModal"
			footer={null}
			maskClosable={false}
			open={open}
			title="Create Journal Entry"
			width={760}
			centered
			closable
			destroyOnClose
			keyboard
			onCancel={handleClose}
		>
			<Form
				className="CreateJournalEntryModal_form"
				form={form}
				layout="vertical"
				onFinish={async (values) => {
					await onSubmit(values);
					resetModalState();
				}}
			>
				<Form.Item className="CreateJournalEntryModal_searchItem">
					<Select
						ref={searchSelectRef}
						disabled={isAccountSelectionComplete}
						filterOption={false}
						loading={isFetching}
						notFoundContent={isFetching ? 'Loading...' : 'No accounts found'}
						options={accountOptions}
						placeholder={
							activeField === 'debitAccount'
								? 'Search account for debit'
								: 'Search account for credit'
						}
						searchValue={searchText}
						value={selectedSearchValue}
						allowClear
						autoFocus
						showSearch
						onChange={() => setSelectedSearchValue(null)}
						onClear={() => {
							setSelectedSearchValue(null);
							setSearchText('');
						}}
						onSearch={(value) => setSearchText(value)}
						onSelect={(value) => handleAccountSelect(value)}
					/>
				</Form.Item>

				<div className="CreateJournalEntryModal_gridLabels">
					<span>DEBIT</span>
					<span>CREDIT</span>
					<span>AMOUNT</span>
				</div>

				<div className="CreateJournalEntryModal_gridInputs">
					<Form.Item
						name="debitAccount"
						rules={[{ required: true, message: 'Debit account is required' }]}
					>
						<Input
							className={
								!isAccountSelectionComplete && activeField === 'debitAccount'
									? 'CreateJournalEntryModal_activeInput'
									: ''
							}
							placeholder="Select from search"
							disabled
							readOnly
						/>
					</Form.Item>

					<Form.Item
						name="creditAccount"
						rules={[{ required: true, message: 'Credit account is required' }]}
					>
						<Input
							className={
								!isAccountSelectionComplete && activeField === 'creditAccount'
									? 'CreateJournalEntryModal_activeInput'
									: ''
							}
							placeholder="Select from search"
							disabled
							readOnly
						/>
					</Form.Item>

					<Form.Item
						name="amount"
						rules={[{ required: true, message: 'Amount is required' }]}
					>
						<InputNumber
							ref={amountRef}
							className="w-100"
							disabled={!isAccountSelectionComplete || isAmountLocked}
							formatter={(value) => `₱ ${value || ''}`}
							min={0}
							parser={(value) =>
								Number((value || '').replace(/₱\s?|,/g, '')) as any
							}
							precision={2}
							onBlur={lockAmountAndFocusRemarks}
							onPressEnter={lockAmountAndFocusRemarks}
						/>
					</Form.Item>
				</div>

				<div className="CreateJournalEntryModal_remarksLabel">Remarks</div>
				<Form.Item name="remarks">
					<Input ref={remarksRef} />
				</Form.Item>

				<div className="ModalCustomFooter">
					<Button
						htmlType="button"
						onClick={() => {
							resetModalState();
							setTimeout(() => {
								searchSelectRef.current?.focus?.();
							}, 0);
						}}
					>
						Clear
					</Button>
					<Button htmlType="submit" loading={isSubmitting} type="primary">
						Submit
					</Button>
				</div>
			</Form>
		</Modal>
	);
};
