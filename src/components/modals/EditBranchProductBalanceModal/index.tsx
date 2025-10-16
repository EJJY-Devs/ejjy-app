import { Button, Col, Divider, Form, Input, message, Modal, Row } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { RequestErrors } from 'components';
import { EMPTY_CELL } from 'global';
import { useBranchProductBalanceEdit } from 'hooks';
import React, { useEffect, useState } from 'react';
import { convertIntoArray } from 'utils';

interface Props {
	branchProductBalance: any;
	onClose: () => void;
}

export const EditBranchProductBalanceModal = ({
	branchProductBalance,
	onClose,
}: Props) => {
	const [form] = Form.useForm();
	const [isPlus, setIsPlus] = useState(true);

	// CUSTOM HOOKS
	const {
		mutateAsync: editBranchProductBalance,
		isLoading,
		error: editBalanceError,
	} = useBranchProductBalanceEdit();

	// Initialize form with empty values for editable fields
	useEffect(() => {
		if (branchProductBalance) {
			form.setFieldsValue({
				value: '',
				remarks: '',
			});
		}
	}, [branchProductBalance, form]);

	const handleSubmit = async (values) => {
		try {
			const finalValue = isPlus ? values.value : -Math.abs(values.value);
			await editBranchProductBalance({
				id: branchProductBalance.id,
				value: finalValue,
				remarks: values.remarks,
			});
			message.success('Branch product balance was updated successfully');
			onClose();
		} catch (error) {
			// Error is handled by the hook
		}
	};

	return (
		<Modal
			footer={null}
			title="Edit Branch Product Balance"
			width={600}
			open
			onCancel={onClose}
		>
			<RequestErrors
				errors={convertIntoArray(editBalanceError?.errors)}
				withSpaceBottom
			/>

			<div style={{ marginBottom: '16px' }}>
				<div style={{ marginBottom: '8px', fontWeight: '500' }}>Barcode</div>
				<div style={{ fontSize: '25px', color: '#ff0000ff' }}>
					{branchProductBalance?.branch_product?.product?.barcode || EMPTY_CELL}
				</div>
			</div>

			<Divider />

			<div style={{ marginBottom: '16px' }}>
				<div style={{ marginBottom: '8px', fontWeight: '500' }}>
					Description
				</div>
				<div style={{ fontSize: '25px', color: '#ff0000ff' }}>
					{branchProductBalance?.branch_product?.product?.name || EMPTY_CELL}
				</div>
			</div>
			<Divider />

			<div style={{ marginBottom: '16px' }}>
				<div style={{ marginBottom: '8px', fontWeight: '500' }}>
					Current Balance
				</div>
				<div style={{ fontSize: '25px', color: '#ff0000ff' }}>
					{Number(branchProductBalance?.value || 0).toFixed(3)}
				</div>
			</div>

			<Divider />

			<div style={{ marginBottom: '16px' }}>
				<div style={{ marginBottom: '8px', fontWeight: '500' }}>Action</div>
				<Button
					icon={isPlus ? <PlusOutlined /> : <MinusOutlined />}
					size="large"
					style={{
						color: isPlus ? '#52c41a' : '#ff4d4f',
						borderColor: isPlus ? '#52c41a' : '#ff4d4f',
					}}
					type="default"
					onClick={() => setIsPlus(!isPlus)}
				>
					{isPlus ? 'Add' : 'Subtract'}
				</Button>
			</div>

			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				<Form.Item label="Value" name="value">
					<Input step="0.001" type="number" />
				</Form.Item>

				<Form.Item label="Remarks" name="remarks">
					<Input.TextArea rows={3} />
				</Form.Item>

				<Row>
					<Col span={24} style={{ textAlign: 'right' }}>
						<Button
							loading={isLoading}
							style={{ marginRight: 8 }}
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button htmlType="submit" loading={isLoading} type="primary">
							Submit
						</Button>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};
