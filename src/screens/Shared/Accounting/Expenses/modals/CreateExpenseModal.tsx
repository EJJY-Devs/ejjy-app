import {
	AuthorizationModal,
	Props as AuthorizationModalProps,
} from 'ejjy-global/dist/components/modals/AuthorizationModal';
import { Button, Form, Input, InputNumber, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { getLocalApiUrl, formatNumberWithCommas } from 'utils';

interface Props {
	isSubmitting: boolean;
	open: boolean;
	onClose: () => void;
	onCreate: (values: {
		payee: string;
		particulars: string;
		amount: number;
		receivedBy: string;
		authorizerId: number;
	}) => Promise<void>;
}

export const CreateExpenseModal = ({
	isSubmitting,
	open,
	onClose,
	onCreate,
}: Props) => {
	const [form] = Form.useForm();
	const [
		authorizeConfig,
		setAuthorizeConfig,
	] = useState<AuthorizationModalProps | null>(null);

	useEffect(() => {
		if (!open) {
			form.resetFields();
		}
	}, [open]);

	const handleSubmit = async () => {
		const values = await form.validateFields();

		setAuthorizeConfig({
			baseURL: getLocalApiUrl(),
			title: 'Authorize Expense',
			onSuccess: async (authorizedUser) => {
				setAuthorizeConfig(null);
				await onCreate({
					payee: values.payee,
					particulars: values.particulars || '',
					amount: values.amount,
					receivedBy: values.receivedBy || '',
					authorizerId: authorizedUser.id,
				});
				form.resetFields();
			},
			onCancel: () => setAuthorizeConfig(null),
		});
	};

	return (
		<>
			<Modal
				footer={null}
				maskClosable={false}
				open={open}
				title="Disbursement Voucher"
				width={480}
				centered
				closable
				destroyOnClose
				onCancel={onClose}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						label="Payee"
						name="payee"
						rules={[{ required: true, message: 'Payee is required' }]}
					>
						<Input placeholder="Enter payee name" autoFocus />
					</Form.Item>

					<Form.Item label="Particulars" name="particulars">
						<Input placeholder="Enter particulars" />
					</Form.Item>

					<Form.Item
						label="Amount"
						name="amount"
						rules={[{ required: true, message: 'Amount is required' }]}
					>
						<InputNumber
							className="w-100"
							controls={false}
							formatter={(value) =>
								value ? `₱ ${formatNumberWithCommas(value)}` : '₱ '
							}
							min={0.01}
							parser={(value) =>
								Number((value || '').replace(/₱\s?|,/g, '')) as any
							}
							placeholder="0.00"
							precision={2}
						/>
					</Form.Item>

					<Form.Item label="Received By" name="receivedBy">
						<Input placeholder="Enter receiver name" />
					</Form.Item>

					<div className="ModalCustomFooter">
						<Button htmlType="button" onClick={onClose}>
							Cancel
						</Button>
						<Button
							htmlType="button"
							loading={isSubmitting}
							type="primary"
							onClick={handleSubmit}
						>
							Submit
						</Button>
					</div>
				</Form>
			</Modal>

			{authorizeConfig && <AuthorizationModal {...authorizeConfig} />}
		</>
	);
};
