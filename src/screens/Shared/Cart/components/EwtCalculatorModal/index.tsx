import { Col, Divider, InputNumber, Modal, Row, Space } from 'antd';
import { Label } from 'components/elements';
import React, { useEffect, useRef, useState } from 'react';
import { formatInPeso } from 'utils';
import CartButton from '../CartButton';
import './style.scss';

const percentFormatter = (
	value: any,
	info?: { userTyping: boolean; input: string },
) => {
	if (value === undefined || value === null || value === '') return '';
	const display = info?.userTyping ? value : Number(value).toFixed(2);
	return `${display}%`;
};
const percentParser = (value: any) =>
	Number((value || '').replace(/%/g, '')) as any;

interface Props {
	open: boolean;
	vatExclusiveBase: number;
	initialEwtPercentage: number;
	onClose: () => void;
	onSave: (ewtPercentage: number) => void;
}

export const EwtCalculatorModal = ({
	open,
	vatExclusiveBase,
	initialEwtPercentage,
	onClose,
	onSave,
}: Props) => {
	const [ewtPercentage, setEwtPercentage] = useState<number | null>(null);
	const inputRef = useRef(null);
	const ewtAmount = (vatExclusiveBase * (ewtPercentage || 0)) / 100;

	useEffect(() => {
		if (open) {
			setEwtPercentage(initialEwtPercentage || null);
			setTimeout(() => {
				inputRef.current?.focus();
			}, 500);
		}
	}, [open, initialEwtPercentage]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(ewtPercentage || 0);
	};

	return (
		<Modal
			className="Modal__hasFooter"
			footer={null}
			open={open}
			title="EWT Calculator"
			centered
			closable
			onCancel={onClose}
		>
			<form onSubmit={handleSubmit}>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Label label="EWT (%)" spacing />
						<InputNumber
							ref={inputRef}
							className="w-100 EwtCalculatorModal_inputPercentage"
							controls={false}
							formatter={percentFormatter}
							max={100}
							min={0}
							parser={percentParser}
							precision={2}
							value={ewtPercentage}
							onChange={(value) => setEwtPercentage(value)}
							onFocus={(e) => e.target.select()}
						/>
					</Col>
				</Row>

				<div className="EwtCalculatorModal_amountSection">
					<Label label="EWT Amount" spacing />
					<p className="EwtCalculatorModal_amount">
						{formatInPeso(ewtAmount, '₱ ')}
					</p>
				</div>

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
						text="Save"
						type="submit"
						variant="primary"
					/>
				</Space>
			</form>
		</Modal>
	);
};
