import { Col, Row, Typography } from 'antd';
import { Box } from 'components/elements';
import React from 'react';

const ProductBalances = () => {
	return (
		<Box>
			<br />
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Typography.Text>
						Product Balances content will be implemented here.
					</Typography.Text>
				</Col>
			</Row>
		</Box>
	);
};

export default ProductBalances;
