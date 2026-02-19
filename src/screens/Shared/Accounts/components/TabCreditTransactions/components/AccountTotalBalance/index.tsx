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
};

export const AccountTotalBalance = ({
	account,
	totalBalance,
	disabled,
	onClick,
}: Props) => (
	<div className="AccountTotalBalance mb-4">
		<Row gutter={[16, 16]}>
			<Col md={12}>
				<Statistic title="Client" value={getFullName(account)} />
			</Col>
			<Col md={12}>
				<Statistic
					title="Outstanding Balance"
					value={formatInPeso(totalBalance)}
				/>
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
