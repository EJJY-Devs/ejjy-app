import { Descriptions, Divider, Modal, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { EMPTY_CELL, getFullName } from 'ejjy-global';
import React from 'react';
import { formatDateTimeExtended, formatInPeso } from 'utils';

const { Text } = Typography;

interface VoidedTransaction {
	id: number;
	invoice?: { or_number: string };
	branch_machine?: { branch?: { name: string } };
	void_datetime?: string;
	teller?: any;
	void_authorizer?: any;
	products?: any[];
	total_amount?: string | number;
	overall_discount?: string | number;
	void_adjustment_slip?: { id: number; reference_number: string } | null;
}

interface Props {
	transaction: VoidedTransaction;
	onClose: () => void;
}

const productColumns: ColumnsType = [
	{ title: 'Product', dataIndex: 'name', width: '45%' },
	{ title: 'Qty', dataIndex: 'qty', align: 'right' },
	{ title: 'Price / pc', dataIndex: 'price', align: 'right' },
	{ title: 'Total', dataIndex: 'total', align: 'right' },
];

export const ViewVoidedTransactionModal = ({ transaction, onClose }: Props) => {
	const {
		invoice,
		branch_machine,
		void_datetime,
		teller,
		void_authorizer,
		products = [],
		total_amount,
		overall_discount,
		void_adjustment_slip,
	} = transaction;

	const voidDt = void_datetime ?? invoice?.datetime_created;

	const productRows = products.map((p, idx) => {
		const qty = Number(p.quantity ?? p.current_quantity ?? 0);
		const price = Number(p.price_per_piece ?? p.original_price ?? 0);
		const total = qty * price;

		return {
			key: p.id ?? idx,
			name: p.branch_product?.product?.name ?? p.product_name ?? EMPTY_CELL,
			qty,
			price: formatInPeso(price),
			total: formatInPeso(total),
		};
	});

	const subtotal = productRows.reduce((acc, row) => {
		const raw = products[productRows.indexOf(row)];
		const qty = Number(raw.quantity ?? raw.current_quantity ?? 0);
		const price = Number(raw.price_per_piece ?? raw.original_price ?? 0);
		return acc + qty * price;
	}, 0);

	return (
		<Modal
			footer={null}
			title={`Voided Transaction — OR# ${invoice?.or_number ?? EMPTY_CELL}`}
			width={680}
			centered
			open
			onCancel={onClose}
		>
			{/* Header details */}
			<Descriptions column={1} size="small" bordered>
				<Descriptions.Item label="OR #">
					{invoice?.or_number ?? EMPTY_CELL}
				</Descriptions.Item>

				{branch_machine?.branch?.name && (
					<Descriptions.Item label="Branch">
						{branch_machine.branch.name}
					</Descriptions.Item>
				)}

				<Descriptions.Item label="Date & Time Voided">
					{voidDt ? formatDateTimeExtended(voidDt) : EMPTY_CELL}
				</Descriptions.Item>

				<Descriptions.Item label="Cashier">
					{teller ? getFullName(teller) : EMPTY_CELL}
				</Descriptions.Item>

				<Descriptions.Item label="Void Authorizer">
					{void_authorizer ? getFullName(void_authorizer) : EMPTY_CELL}
				</Descriptions.Item>
			</Descriptions>

			<Divider />

			{/* Products */}
			<Table
				columns={productColumns}
				dataSource={productRows}
				pagination={false}
				size="small"
				bordered
			/>

			<Divider />

			{/* Summary */}
			<Descriptions
				column={1}
				contentStyle={{ textAlign: 'right', display: 'block' }}
				size="small"
			>
				<Descriptions.Item label="Subtotal">
					{formatInPeso(subtotal)}
				</Descriptions.Item>

				<Descriptions.Item label="Overall Discount">
					{formatInPeso(overall_discount ?? 0)}
				</Descriptions.Item>

				<Descriptions.Item label={<Text strong>Grand Total</Text>}>
					<Text strong>{formatInPeso(total_amount ?? 0)}</Text>
				</Descriptions.Item>
			</Descriptions>

			<Divider />

			{/* Adjustment Slip */}
			<Descriptions column={1} size="small">
				<Descriptions.Item label="Adjustment Slip">
					{void_adjustment_slip ? (
						<Text>
							Adjustment Slip{' '}
							<Text strong>{void_adjustment_slip.reference_number}</Text>
						</Text>
					) : (
						<Text type="secondary">No adjustment slip created yet</Text>
					)}
				</Descriptions.Item>
			</Descriptions>
		</Modal>
	);
};
