import { FileTextOutlined } from '@ant-design/icons';
import { Button, Col, Row, Statistic } from 'antd';
import { getFullName } from 'ejjy-global';
import { accountTypes, appTypes } from 'global';
import React from 'react';
import { formatInPeso, getAppType } from 'utils';
import './style.scss';

type Props = {
	account: any;
	totalBalance: string;
	disabled: boolean;
	onClick: () => void;
	onViewStatement: () => void;
};

export const getSupplierLabel = (account: any) => {
	const name = getFullName(account);
	return account?.business_name ? `${name} (${account.business_name})` : name;
};

const getBusinessNameLabel = (account: any) =>
	account?.type === accountTypes.GOVERNMENT ? 'Agency Name' : 'Business Name';

export const SupplierTotalBalance = ({
	account,
	totalBalance,
	disabled,
	onClick,
	onViewStatement,
}: Props) => (
	<div className="SupplierTotalBalance mb-4">
		<Row gutter={[16, 16]}>
			<Col md={12}>
				<Statistic title="Supplier" value={getFullName(account)} />
				{account?.business_name && (
					<Statistic
						className="mt-3"
						title={getBusinessNameLabel(account)}
						value={account.business_name}
					/>
				)}
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
						Create Disbursement Voucher
					</Button>
				)}
			</Col>
		</Row>
	</div>
);
