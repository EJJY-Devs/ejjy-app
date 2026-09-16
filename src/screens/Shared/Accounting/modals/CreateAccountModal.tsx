import { Button, Form, Input, Modal, Radio, Select } from 'antd';
import React from 'react';
import { MAX_PAGE_SIZE } from 'global';
import { useAccountSubTypes, useAccountTypes, useNormalBalances } from 'hooks';

const ACCOUNT_CATEGORY_OPTIONS = [
	{ label: 'Standard', value: 'standard' },
	{ label: 'Special', value: 'special' },
];

const ACCOUNT_CLASSIFICATION_OPTIONS = [
	{ label: 'Nominal (Temporary — Reset every year)', value: 'nominal' },
	{ label: 'Real (Permanent — Balances carry over)', value: 'real' },
];

export const BOOK_TAG_OPTIONS = [
	{ label: 'None', value: '' },
	{ label: 'Cash Book', value: 'cash_book' },
	{ label: 'Sales Book', value: 'sales_book' },
	{ label: 'Purchase Book', value: 'purchase_book' },
	{ label: 'EWT', value: 'ewt_book' },
];

export const bookTagToFields = (bookTag: string) => ({
	isCashBook: bookTag === 'cash_book',
	isSalesBook: bookTag === 'sales_book',
	isPurchaseBook: bookTag === 'purchase_book',
	isEwtBook: bookTag === 'ewt_book',
});

export const fieldsToBookTag = (account: any) => {
	if (account?.is_sales_book) return 'sales_book';
	if (account?.is_purchase_book) return 'purchase_book';
	if (account?.is_ewt_book) return 'ewt_book';
	if (account?.is_cash_book) return 'cash_book';
	return '';
};

const BOOK_TAG_EFFECTS = [
	{
		tag: 'Cash Book',
		effects: ['Debit → Cash Receipts', 'Credit → Cash Disbursements'],
	},
	{ tag: 'Sales Book', effects: ['Credit → Subsidiary Sales'] },
	{ tag: 'Purchase Book', effects: ['Debit → Subsidiary Purchases'] },
	{ tag: 'EWT', effects: ['Credit → Subsidiary Purchases'] },
];

export const BOOK_TAG_TOOLTIP = {
	title: (
		<table cellSpacing={0}>
			<tbody>
				{BOOK_TAG_EFFECTS.map(({ tag, effects }) =>
					effects.map((effect, index) => (
						<tr key={`${tag}-${effect}`}>
							{index === 0 && (
								<td
									rowSpan={effects.length}
									style={{
										fontWeight: 600,
										paddingRight: 12,
										paddingBottom: 4,
										whiteSpace: 'nowrap',
										verticalAlign: 'top',
									}}
								>
									{tag}
								</td>
							)}
							<td style={{ paddingBottom: 4, whiteSpace: 'nowrap' }}>
								{effect}
							</td>
						</tr>
					)),
				)}
			</tbody>
		</table>
	),

	overlayStyle: { maxWidth: 420 },
};

type Option = { label: string; value: number };

interface Props {
	accountTypeOptions?: Option[];
	isOptionsLoading?: boolean;
	normalBalanceOptions?: Option[];
	isSubmitting: boolean;
	open: boolean;
	subTypeOptions?: Option[];
	onClose: () => void;
	onCreate: (values: any) => Promise<void>;
}

export const CreateAccountModal = ({
	accountTypeOptions: accountTypeOptionsProp,
	isOptionsLoading: isOptionsLoadingProp,
	normalBalanceOptions: normalBalanceOptionsProp,
	isSubmitting,
	open,
	subTypeOptions: subTypeOptionsProp,
	onClose,
	onCreate,
}: Props) => {
	const [form] = Form.useForm();

	const {
		data: { accountTypes } = { accountTypes: [] },
		isFetching: isFetchingAccountTypes,
	} = useAccountTypes({ params: { pageSize: MAX_PAGE_SIZE } });
	const {
		data: { accountSubTypes } = { accountSubTypes: [] },
		isFetching: isFetchingAccountSubTypes,
	} = useAccountSubTypes({ params: { pageSize: MAX_PAGE_SIZE } });
	const {
		data: { normalBalances } = { normalBalances: [] },
		isFetching: isFetchingNormalBalances,
	} = useNormalBalances({ params: { pageSize: MAX_PAGE_SIZE } });

	const handleFinish = async ({ bookTag, ...values }: any) => {
		try {
			await onCreate({ ...values, ...bookTagToFields(bookTag) });
			form.resetFields();
		} catch (error) {
			// Keep user input on error so they can correct and retry.
		}
	};

	const fetchedAccountTypeOptions: Option[] = (accountTypes || []).map(
		(accountType: any) => ({
			label: accountType.name,
			value: accountType.id,
		}),
	);
	const fetchedSubTypeOptions: Option[] = (accountSubTypes || []).map(
		(accountSubType: any) => ({
			label: accountSubType.name,
			value: accountSubType.id,
		}),
	);
	const fetchedNormalBalanceOptions: Option[] = (normalBalances || []).map(
		(normalBalance: any) => ({
			label: normalBalance.name,
			value: normalBalance.id,
		}),
	);

	const accountTypeOptions =
		accountTypeOptionsProp ?? fetchedAccountTypeOptions;
	const subTypeOptions = subTypeOptionsProp ?? fetchedSubTypeOptions;
	const normalBalanceOptions =
		normalBalanceOptionsProp ?? fetchedNormalBalanceOptions;

	const isOptionsLoading =
		Boolean(isOptionsLoadingProp) ||
		isFetchingAccountTypes ||
		isFetchingAccountSubTypes ||
		isFetchingNormalBalances;

	return (
		<Modal
			footer={null}
			open={open}
			title="Create Account"
			destroyOnClose
			onCancel={onClose}
		>
			<Form
				className="CreateAccountModal_form"
				form={form}
				layout="vertical"
				onFinish={handleFinish}
			>
				<Form.Item
					label="Account Code"
					name="accountCode"
					normalize={(value) => value?.replace(/\D/g, '') || ''}
					rules={[
						{
							required: true,
							message: 'Account code must contain only numbers',
						},
					]}
				>
					<Input inputMode="numeric" pattern="[0-9]*" />
				</Form.Item>

				<Form.Item
					label="Account Name"
					name="accountName"
					rules={[{ required: true, message: 'Account name is required' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item
					initialValue="standard"
					label="Account Category"
					name="accountCategory"
					rules={[{ required: true, message: 'Account category is required' }]}
				>
					<Select options={ACCOUNT_CATEGORY_OPTIONS} />
				</Form.Item>

				<Form.Item
					initialValue="nominal"
					label="Account Classification"
					name="accountClassification"
					rules={[
						{ required: true, message: 'Account classification is required' },
					]}
				>
					<Select options={ACCOUNT_CLASSIFICATION_OPTIONS} />
				</Form.Item>

				<Form.Item
					label="Account Type"
					name="accountType"
					rules={[{ required: true, message: 'Account type is required' }]}
				>
					<Select
						loading={isOptionsLoading}
						optionFilterProp="label"
						options={accountTypeOptions}
						showSearch
					/>
				</Form.Item>

				<Form.Item
					label="Sub-Type"
					name="subType"
					rules={[{ required: true, message: 'Sub-type is required' }]}
				>
					<Select
						loading={isOptionsLoading}
						optionFilterProp="label"
						options={subTypeOptions}
						showSearch
					/>
				</Form.Item>

				<Form.Item
					label="Normal Balance"
					name="normalBalance"
					rules={[{ required: true, message: 'Normal balance is required' }]}
				>
					<Select
						loading={isOptionsLoading}
						optionFilterProp="label"
						options={normalBalanceOptions}
						showSearch
					/>
				</Form.Item>

				<Form.Item
					initialValue=""
					label="Book Tag"
					name="bookTag"
					tooltip={BOOK_TAG_TOOLTIP}
				>
					<Radio.Group
						buttonStyle="solid"
						options={BOOK_TAG_OPTIONS}
						optionType="button"
					/>
				</Form.Item>

				<div className="CreateAccountModal_actions d-flex justify-end gap-2">
					<Button onClick={onClose}>Cancel</Button>
					<Button
						loading={isSubmitting}
						type="primary"
						onClick={() => form.submit()}
					>
						Create
					</Button>
				</div>
			</Form>
		</Modal>
	);
};
