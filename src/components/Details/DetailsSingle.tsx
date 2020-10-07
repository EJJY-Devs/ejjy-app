import { Col, Row } from 'antd';
import React, { ReactNode } from 'react';
import { Label } from '../elements';

interface Props {
	value: string | number | ReactNode;
	label: string;
}

export const DetailsSingle = ({ value, label }: Props) => {
	return (
		<Col span={24}>
			<Row gutter={{ sm: 15, xs: 0 }}>
				<Col sm={8} xs={24}>
					<Label label={label} />
				</Col>
				<Col sm={16} xs={24}>
					<span>{value}</span>
				</Col>
			</Row>
		</Col>
	);
};
