import { Col, Row, Statistic } from 'antd';
import { getFullName } from 'ejjy-global';
import React from 'react';
import './style.scss';

type Props = {
	account: any;
};

export const PayorSummary = ({ account }: Props) => (
	<div className="PayorSummary mb-4">
		<Row gutter={[16, 16]}>
			<Col md={12}>
				<Statistic title="Payor" value={getFullName(account)} />
			</Col>
		</Row>
	</div>
);
