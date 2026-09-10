import { Button, Form, Input, InputNumber, Modal } from 'antd';
import { Label } from 'components/elements';
import React, { useEffect } from 'react';
import { formatNumberWithCommas } from 'utils';
import { CashDisbursementEntry } from '../BooksOfAccounts/components/CashDisbursementsTab';

const pesoFormatter = (
	value: any,
	info?: { userTyping: boolean; input: string },
) => {
	if (!value && value !== 0) {
		return '₱ ';
	}

	const display = info?.userTyping ? value : Number(value).toFixed(2);
	return `₱ ${formatNumberWithCommas(display)}`;
};
const pesoParser = (value: any) =>
	Number((value || '').replace(/₱\s?|,/g, '')) as any;

interface Props {
	entry: CashDisbursementEntry | null;
	isSubmitting: boolean;
	open: boolean;
	onClose: () => void;
	onUpdate: (values: {
		ewtPercentage: number;
		otherDeductionsAmount: number;
		otherDeductionsRemarks: string;
	}) => Promise<void>;
}

export const EditCashDisbursementDetailModal = ({
	entry,
	isSubmitting,
	open,
	onClose,
	onUpdate,
}: Props) => {
	const [form] = Form.useForm();

	useEffect(() => {
		if (open && entry) {
			form.setFieldsValue({
				ewtPercentage: entry.ewtPercentage,
				otherDeductionsAmount: entry.otherDeductions,
				otherDeductionsRemarks: entry.otherDeductionsRemarks || '',
			});
		}

		if (!open) {
			form.resetFields();
		}
	}, [entry, form, open]);

	const handleFinish = async (values: any) => {
		await onUpdate({
			ewtPercentage: values.ewtPercentage || 0,
			otherDeductionsAmount: values.otherDeductionsAmount || 0,
			otherDeductionsRemarks: values.otherDeductionsRemarks || '',
		});
	};

	return (
		<Modal
			footer={null}
			open={open}
			title="Edit EWT / Other Deductions"
			destroyOnClose
			onCancel={onClose}
		>
			{entry && (
				<p className="mb-4">
					{entry.payee} — {entry.invoiceNumber || 'No Invoice #'}
				</p>
			)}

			<Form form={form} layout="vertical" onFinish={handleFinish}>
				<Label label="EWT (%)" spacing />
				<Form.Item name="ewtPercentage">
					<InputNumber
						className="w-100"
						controls={false}
						max={100}
						min={0}
						precision={2}
						onFocus={(e) => e.target.select()}
					/>
				</Form.Item>

				<Label label="Other Deductions" spacing />
				<Form.Item name="otherDeductionsAmount">
					<InputNumber
						className="w-100"
						controls={false}
						formatter={pesoFormatter}
						min={0}
						parser={pesoParser}
						precision={2}
						onFocus={(e) => e.target.select()}
					/>
				</Form.Item>

				<Label label="Other Deductions - Remarks" spacing />
				<Form.Item name="otherDeductionsRemarks">
					<Input placeholder="e.g. what this deduction is for" />
				</Form.Item>

				<div className="d-flex justify-end gap-2">
					<Button onClick={onClose}>Cancel</Button>
					<Button
						htmlType="button"
						loading={isSubmitting}
						type="primary"
						onClick={() => form.submit()}
					>
						Save
					</Button>
				</div>
			</Form>
		</Modal>
	);
};
