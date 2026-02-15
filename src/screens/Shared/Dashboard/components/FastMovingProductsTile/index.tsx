import { TrophyOutlined } from '@ant-design/icons';
import {
	blue,
	cyan,
	geekblue,
	gold,
	green,
	lime,
	magenta,
	orange,
	purple,
	red,
} from '@ant-design/colors';
import { Button, Card, Modal, Spin, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RequestErrors } from 'components';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import {
	ResponsiveContainer,
	XAxis,
	YAxis,
	LineChart,
	CartesianGrid,
	Line,
	Tooltip,
} from 'recharts';
import { MAX_PAGE_SIZE } from 'global';
import { BranchProductsService, TransactionProductsService } from 'services';
import { convertIntoArray, getLocalApiUrl } from 'utils';
import './style.scss';

type FastMovingRow = {
	key: string | number;
	barcode: string;
	rank: number;
	name: string;
	quantity: number;
	status: React.ReactNode;
};

type ChartPoint = {
	date: string;
	[name: string]: string | number;
};

const getTruncatedName = (name: string, maxLength = 22) => {
	if (!name) return '';
	if (name.length <= maxLength) return name;
	return `${name.slice(0, maxLength)}…`;
};

interface Props {
	branchId?: string | number;
}

export const FastMovingProductsTile = ({ branchId }: Props) => {
	const [visible, setVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<any>(null);
	const [rows, setRows] = useState<FastMovingRow[]>([]);
	const [chartData, setChartData] = useState<ChartPoint[]>([]);
	const [chartKeys, setChartKeys] = useState<string[]>([]);

	const getLast7Days = () => {
		const endDate = dayjs();
		const startDate = endDate.clone().subtract(6, 'day');
		const dates: string[] = [];
		for (let i = 0; i < 7; i += 1) {
			dates.push(startDate.clone().add(i, 'day').format('YYYY-MM-DD'));
		}

		return {
			startDate,
			endDate,
			dates,
			label: `${startDate.format('M/D/YY')}-${endDate.format('M/D/YY')}`,
		};
	};

	const dateRangeLabel = useMemo(() => getLast7Days().label, []);

	const columns: ColumnsType<FastMovingRow> = useMemo(
		() => [
			{
				title: 'Barcode',
				dataIndex: 'barcode',
				width: 160,
			},
			{
				title: 'Name',
				dataIndex: 'name',
			},
			{
				title: 'Quantity Sold',
				dataIndex: 'quantity',
				width: 160,
			},
			{
				title: 'Status',
				dataIndex: 'status',
				align: 'center',
				width: 160,
			},
		],
		[],
	);

	const lineColors = useMemo(
		() => [
			blue[4],
			orange[4],
			green[4],
			red[4],
			purple[4],
			cyan[4],
			geekblue[4],
			magenta[4],
			gold[4],
			lime[4],
		],
		[],
	);

	useEffect(() => {
		const fetchTopSoldProducts = async () => {
			setIsLoading(true);
			setErrors(null);
			setRows([]);
			setChartData([]);
			setChartKeys([]);

			try {
				const { dates } = getLast7Days();

				const dailyResults = await Promise.all(
					dates.map(async (date) => {
						const response = await TransactionProductsService.getDailySummary(
							{
								branch_id: branchId,
								date,
								ordering: '-quantity',
							},
							getLocalApiUrl(),
						);

						return { date, data: response?.data || [] };
					}),
				);

				const totals: Record<
					string | number,
					{
						productKey: string | number;
						name: string;
						barcode: string;
						quantity: number;
					}
				> = {};
				const perDateQty: Record<string, Record<string | number, number>> = {};

				dailyResults.forEach(({ date, data }) => {
					perDateQty[date] = {};
					data.forEach((item: any) => {
						const productKey =
							item.product_id ?? item.code ?? item.print_details;
						if (!productKey) return;

						const name = item.print_details || item.code || 'Unknown';
						const barcode = String(item.code || '');
						const quantity = Number(item.quantity) || 0;

						perDateQty[date][productKey] =
							(perDateQty[date][productKey] || 0) + quantity;

						if (!totals[productKey]) {
							totals[productKey] = {
								productKey,
								name,
								barcode,
								quantity: 0,
							};
						}

						totals[productKey].quantity += quantity;
					});
				});

				const topProducts = Object.values(totals)
					.sort((a, b) => b.quantity - a.quantity)
					.slice(0, 10);

				const productKeys = topProducts.map((p) => p.productKey);
				const productNames = topProducts.map((p) => p.name);

				const balanceByProductKey: Record<string | number, number> = {};
				if (branchId && productKeys.length) {
					try {
						const response = await BranchProductsService.list(
							{
								branch_id: Number(branchId),
								page_size: MAX_PAGE_SIZE,
								product_ids: productKeys.join(','),
							},
							getLocalApiUrl(),
						);

						(response?.data?.results || []).forEach((branchProduct: any) => {
							const productId =
								branchProduct?.product?.id ??
								branchProduct?.product_id ??
								branchProduct?.id;
							const productCode = branchProduct?.product?.code;
							const balance = Number(branchProduct.current_balance) || 0;

							if (productId != null) {
								balanceByProductKey[productId] = balance;
							}
							if (productCode != null) {
								balanceByProductKey[String(productCode)] = balance;
							}
						});
					} catch (e) {
						// Ignore status lookup errors; table still renders.
					}
				}

				const tableRows: FastMovingRow[] = topProducts.map((p, index) => {
					const balance = balanceByProductKey[p.productKey];
					let status: React.ReactNode = '-';
					if (balance != null) {
						status =
							balance > 0 ? (
								<Tag color="green">Available</Tag>
							) : (
								<Tag color="red">Out of Stock</Tag>
							);
					}

					return {
						key: p.productKey,
						rank: index + 1,
						barcode: p.barcode,
						name: p.name,
						quantity: p.quantity,
						status,
					};
				});

				const points: ChartPoint[] = dates.map((date) => {
					const point: ChartPoint = {
						date: dayjs(date).format('MMM D'),
					};

					productKeys.forEach((key, idx) => {
						const seriesName = productNames[idx];
						point[seriesName] = perDateQty[date]?.[key] || 0;
					});

					return point;
				});

				setRows(tableRows);
				setChartData(points);
				setChartKeys(productNames);
			} catch (error) {
				setErrors(error);
				setRows([]);
				setChartData([]);
				setChartKeys([]);
			} finally {
				setIsLoading(false);
			}
		};

		if (visible) {
			fetchTopSoldProducts();
		}
	}, [branchId, visible]);

	return (
		<>
			<Card
				bodyStyle={{ padding: 12 }}
				className="FastMovingProductsTile"
				hoverable
				onClick={() => setVisible(true)}
			>
				<div className="FastMovingProductsTile_inner">
					<div className="FastMovingProductsTile_iconWrap bg-light rounded">
						<TrophyOutlined className="FastMovingProductsTile_icon" />
						<Tag className="FastMovingProductsTile_topTag" color="green">
							TOP 10
						</Tag>
					</div>
					<div className="FastMovingProductsTile_text">
						<div className="FastMovingProductsTile_title">
							Fast Moving Products
						</div>
						<div className="FastMovingProductsTile_subtitle">
							As of {dateRangeLabel}
						</div>
					</div>
				</div>
			</Card>

			<Modal
				className="Modal__hasFooter Modal__large"
				footer={<Button onClick={() => setVisible(false)}>Close</Button>}
				open={visible}
				title="Top 10 Fast Moving Products"
				destroyOnClose
				onCancel={() => setVisible(false)}
			>
				<Spin spinning={isLoading}>
					<RequestErrors errors={convertIntoArray(errors)} withSpaceBottom />

					<div className="FastMovingProductsModal_chart">
						<ResponsiveContainer height="100%" width="100%">
							<LineChart
								data={chartData}
								margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip
									formatter={(value: any, name: any) => {
										const seriesName = getTruncatedName(String(name || ''), 40);
										return [value, seriesName];
									}}
								/>

								{chartKeys.map((key, index) => {
									const color = lineColors[index % lineColors.length];
									return (
										<Line
											key={key}
											activeDot={{ r: 4 }}
											dataKey={key}
											dot={false}
											stroke={color}
											type="monotone"
										/>
									);
								})}
							</LineChart>
						</ResponsiveContainer>
					</div>

					<div className="pt-4">
						<Table
							columns={columns}
							dataSource={rows}
							pagination={false}
							bordered
						/>
					</div>
				</Spin>
			</Modal>
		</>
	);
};
