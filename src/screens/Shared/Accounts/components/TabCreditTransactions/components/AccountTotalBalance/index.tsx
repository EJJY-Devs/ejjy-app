import { FileTextOutlined } from '@ant-design/icons';
import { Button, Col, Row, Statistic } from 'antd';
import { Account, getFullName } from 'ejjy-global';
import { appTypes } from 'global';
import React from 'react';
import { formatInPeso, getAppType } from 'utils';
import './style.scss';

type Props = {
	account: Account;
	totalBalance: string;
	disabled: boolean;
	onClick: () => void;
	onViewStatement: () => void;
};

export const AccountTotalBalance = ({
	account,
	totalBalance,
	disabled,
	onClick,
	onViewStatement,
}: Props) => (
	<div className="AccountTotalBalance mb-4">
		<Row gutter={[16, 16]}>
			<Col md={12}>
				<Statistic title="Client" value={getFullName(account)} />
			</Col>
			<Col md={12}>
				<Row align="middle" gutter={[16, 16]} justify="space-between">
					<Col>
						<Statistic
							title="Outstanding Balance"
							value={formatInPeso(totalBalance)}
						/>
					</Col>
					<Col>
						<Button
							disabled={disabled}
							icon={<FileTextOutlined />}
							size="large"
							type="primary"
							onClick={onViewStatement}
						>
							View Statement of Account
						</Button>
					</Col>
				</Row>
				{getAppType() === appTypes.BACK_OFFICE && (
					<Button
						className="mt-3"
						disabled={disabled}
						type="primary"
						onClick={onClick}
					>
						Create Order of Payment
					</Button>
				)}
			</Col>
		</Row>
	</div>
);
