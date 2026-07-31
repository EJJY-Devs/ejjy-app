import { CalendarOutlined, PrinterOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	DatePicker,
	Modal,
	Radio,
	Row,
	Table,
	Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { getFullName } from 'ejjy-global';
import { MAIN_BRANCH_ID } from 'global';
import { useBranchRetrieve, usePdf } from 'hooks';
import moment, { Moment } from 'moment';
import React, { useMemo, useState } from 'react';
import { formatDate, formatInPeso } from 'utils';
import { PdfButtons } from './PdfButtons';

const { Text, Title } = Typography;

export interface StatementHistoryItem {
	rawDatetime: string;
	referenceNumber: string;
	description: string;
	amount: number;
	direction: 1 | -1;
}

export const getDefaultStatementPeriod = (): [Moment, Moment] => {
	const currentMonth = moment();
	return [
		currentMonth.clone().startOf('month'),
		currentMonth.clone().endOf('month'),
	];
};

// Walks the full (account-lifetime) history chronologically so the
// "Forwarded Balance" reflects everything that happened before the
// selected period, then only surfaces rows that fall within it.
export const buildStatement = (
	history: StatementHistoryItem[],
	periodStart: Moment,
	pesoSign = '₱',
) => {
	const sorted = [...history].sort(
		(a, b) =>
			new Date(a.rawDatetime).getTime() - new Date(b.rawDatetime).getTime(),
	);

	let runningBalance = 0;
	let previousBalance = 0;
	let newCharges = 0;
	let payments = 0;
	const rows = [];

	sorted.forEach((item) => {
		runningBalance += item.amount * item.direction;

		if (moment(item.rawDatetime).isBefore(periodStart, 'day')) {
			previousBalance = runningBalance;
			return;
		}

		if (item.direction === 1) {
			newCharges += item.amount;
		} else {
			payments += item.amount;
		}

		rows.push({
			key: `${item.description}-${item.rawDatetime}-${item.referenceNumber}`,
			datetime: formatDate(item.rawDatetime),
			referenceNumber: item.referenceNumber,
			description: item.description,
			amount: formatInPeso(item.amount, pesoSign),
			balance: formatInPeso(runningBalance, pesoSign),
		});
	});

	return {
		previousBalance,
		newCharges,
		payments,
		totalBalanceDue: runningBalance,
		rows: [
			{
				key: 'forwarded-balance',
				datetime: formatDate(periodStart),
				referenceNumber: '',
				description: 'Forwarded Balance',
				amount: '',
				balance: formatInPeso(previousBalance, pesoSign),
			},
			...rows,
		],
	};
};

const COLUMNS: ColumnsType = [
	{ title: 'Datetime', dataIndex: 'datetime' },
	{ title: 'Reference #', dataIndex: 'referenceNumber' },
	{ title: 'Description', dataIndex: 'description' },
	{ title: 'Amount', dataIndex: 'amount', align: 'right' },
	{ title: 'Balance', dataIndex: 'balance', align: 'right' },
];

const printStatementOfAccount = ({
	branch,
	account,
	statement,
	statementNumber,
	period,
	dateIssued,
	currentOutstandingBalance,
	isSupplier,
}: {
	branch: any;
	account: any;
	statement: any;
	statementNumber: string;
	period: [Moment, Moment];
	dateIssued: Moment;
	currentOutstandingBalance: string | number;
	isSupplier?: boolean;
}) => {
	const headerName = isSupplier
		? account?.business_name || getFullName(account)
		: branch?.store_name;
	let headerSubtext = branch?.store_address;
	if (isSupplier) {
		headerSubtext = account?.business_name ? getFullName(account) : '';
	}
	const clientName = isSupplier ? branch?.store_name : getFullName(account);
	const clientAddress = isSupplier
		? branch?.store_address
		: account?.business_address || account?.home_address;

	const rowsHtml = statement.rows
		.map(
			(row) => `
			<tr>
				<td style="border: 1px solid #000; padding: 4px 6px;">${row.datetime}</td>
				<td style="border: 1px solid #000; padding: 4px 6px;">${
					row.referenceNumber || '—'
				}</td>
				<td style="border: 1px solid #000; padding: 4px 6px;">${row.description}</td>
				<td style="border: 1px solid #000; padding: 4px 6px; text-align: right;">${
					row.amount || '—'
				}</td>
				<td style="border: 1px solid #000; padding: 4px 6px; text-align: right;">${
					row.balance
				}</td>
			</tr>
		`,
		)
		.join('');

	return `
	<div style="font-family: Arial, sans-serif; font-size: 11px;">
		<table style="width: 100%; border-collapse: collapse;">
			<tr>
				<td style="vertical-align: top;">
					${
						headerName
							? `<div style="font-weight: bold; font-size: 16px; text-transform: uppercase;">${headerName}</div>`
							: ''
					}
					${
						headerSubtext
							? `<div style="font-size: 11px; margin-top: 2px;">${headerSubtext}</div>`
							: ''
					}
				</td>
				<td style="vertical-align: top; text-align: right;">
					<div style="font-weight: bold; text-transform: uppercase; font-size: 16px; line-height: 1.2;">
						Statement<br />of Account
					</div>
				</td>
			</tr>
		</table>
		<hr style="border: none; border-top: 1px solid #000; margin: 8px 0 12px;" />

		<table style="width: 100%; border-collapse: collapse;">
			<tr>
				<td style="vertical-align: top; width: 50%;">
					<div><b>Client Name:</b> ${clientName || '—'}</div>
					${
						!isSupplier && account?.business_name
							? `<div><b>Agency/Business Name:</b> ${account.business_name}</div>`
							: ''
					}
					<div><b>Address:</b> ${clientAddress || '—'}</div>
					<div><b>Client Code:</b> ${account?.account_code}</div>
					<div><b>Statement Period:</b> ${period[0].format(
						'MMMM D, YYYY',
					)} - ${period[1].format('MMMM D, YYYY')}</div>
					<div><b>Date Issued:</b> ${dateIssued.format('MMMM D, YYYY')}</div>
				</td>
				<td style="vertical-align: top; width: 50%;">
					<div style="font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Account Summary</div>
					<table style="width: 100%; border-collapse: collapse;">
						<tr><td>Previous Balance:</td><td style="text-align: right;">${formatInPeso(
							statement.previousBalance,
							'P',
						)}</td></tr>
						<tr><td>New Charges:</td><td style="text-align: right;">${formatInPeso(
							statement.newCharges,
							'P',
						)}</td></tr>
						<tr><td>Payments:</td><td style="text-align: right;">${formatInPeso(
							statement.payments,
							'P',
						)}</td></tr>
						<tr><td>Total Balance Due:</td><td style="text-align: right;">${formatInPeso(
							statement.totalBalanceDue,
							'P',
						)}</td></tr>
					</table>
				</td>
			</tr>
		</table>

		<table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 16px;">
			<thead>
				<tr>
					<th style="border: 1px solid #000; padding: 4px 6px;">Datetime</th>
					<th style="border: 1px solid #000; padding: 4px 6px;">Reference #</th>
					<th style="border: 1px solid #000; padding: 4px 6px;">Description</th>
					<th style="border: 1px solid #000; padding: 4px 6px;">Amount</th>
					<th style="border: 1px solid #000; padding: 4px 6px;">Balance</th>
				</tr>
			</thead>
			<tbody>
				${rowsHtml}
			</tbody>
		</table>

		<div style="margin-top: 12px;">Payment Due Date: _________________________</div>
		<div>Statement Number: ${statementNumber}</div>
		<div>${branch?.store_name || ''}</div>
		<div style="margin-top: 4px; font-weight: bold;">Current Outstanding Balance: ${formatInPeso(
			currentOutstandingBalance,
			'P',
		)}</div>
	</div>
	`;
};

interface StatementPeriodModalProps {
	title: string;
	defaultPeriod: [Moment, Moment];
	onConfirm: (period: [Moment, Moment]) => void;
	onClose: () => void;
}

export const StatementPeriodModal = ({
	title,
	defaultPeriod,
	onConfirm,
	onClose,
}: StatementPeriodModalProps) => {
	const [periodType, setPeriodType] = useState<'month' | 'range'>('month');
	const [period, setPeriod] = useState<[Moment, Moment]>(defaultPeriod);

	return (
		<Modal
			className="Modal__hasFooter"
			footer={[
				<Button key="cancel" onClick={onClose}>
					Cancel
				</Button>,
				<Button
					key="view"
					icon={<CalendarOutlined />}
					type="primary"
					onClick={() => onConfirm(period)}
				>
					View Statement
				</Button>,
			]}
			title={title}
			centered
			closable
			open
			onCancel={onClose}
		>
			<Text strong>Statement Period</Text>
			<br />
			<Radio.Group
				className="mt-1"
				value={periodType}
				onChange={(e) => setPeriodType(e.target.value)}
			>
				<Radio value="month">Month</Radio>
				<Radio value="range">Date Range</Radio>
			</Radio.Group>
			<br />

			{periodType === 'month' ? (
				<DatePicker
					allowClear={false}
					className="w-100 mt-1"
					format="MMMM YYYY"
					picker="month"
					value={period[0]}
					onChange={(date) => {
						if (date) {
							setPeriod([
								date.clone().startOf('month'),
								date.clone().endOf('month'),
							]);
						}
					}}
				/>
			) : (
				<DatePicker.RangePicker
					allowClear={false}
					className="w-100 mt-1"
					format="MMMM D, YYYY"
					value={period}
					onChange={(dates) => {
						if (dates?.[0] && dates?.[1]) {
							setPeriod([
								dates[0].clone().startOf('day'),
								dates[1].clone().endOf('day'),
							]);
						}
					}}
				/>
			)}
		</Modal>
	);
};

interface Props {
	title: string;
	filenamePrefix: string;
	account: any;
	currentOutstandingBalance: string | number;
	history: StatementHistoryItem[];
	isLoading: boolean;
	period: [Moment, Moment];
	isSupplier?: boolean;
	onChangePeriod: () => void;
	onClose: () => void;
}

export const StatementOfAccountModal = ({
	title,
	filenamePrefix,
	account,
	currentOutstandingBalance,
	history,
	isLoading,
	period,
	isSupplier,
	onChangePeriod,
	onClose,
}: Props) => {
	// CUSTOM HOOKS
	const { data: branch } = useBranchRetrieve({ id: MAIN_BRANCH_ID });

	const headerName = isSupplier
		? account?.business_name || getFullName(account)
		: branch?.store_name;
	let headerSubtext = branch?.store_address;
	if (isSupplier) {
		headerSubtext = account?.business_name ? getFullName(account) : '';
	}
	const clientName = isSupplier ? branch?.store_name : getFullName(account);
	const clientAddress = isSupplier
		? branch?.store_address
		: account?.business_address || account?.home_address;

	const statement = useMemo(() => buildStatement(history, period[0]), [
		history,
		period,
	]);
	// jsPDF's default fonts don't embed the ₱ glyph, so the printed/PDF
	// output uses a plain "P" instead to avoid it rendering as "±".
	const printStatement = useMemo(
		() => buildStatement(history, period[0], 'P'),
		[history, period],
	);

	const statementNumber = `SOA-${isSupplier ? 'S' : 'C'}-${
		account?.account_code
	}`;
	const dateIssued = moment();

	const printData = {
		branch,
		account,
		statement: printStatement,
		statementNumber,
		period,
		dateIssued,
		currentOutstandingBalance,
		isSupplier,
	};

	const { htmlPdf, isLoadingPdf, previewPdf, downloadPdf } = usePdf({
		title: `${filenamePrefix}_${account?.account_code}.pdf`,
		print: () => printStatementOfAccount(printData),
	});

	const handlePrint = () => {
		printStatementOfAccount(printData);
	};

	return (
		<Modal
			className="Modal__hasFooter"
			footer={[
				<Button key="change-period" onClick={onChangePeriod}>
					Change Period
				</Button>,
				<Button
					key="print"
					disabled={isLoadingPdf || isLoading}
					icon={<PrinterOutlined />}
					type="primary"
					onClick={handlePrint}
				>
					Print
				</Button>,
				<PdfButtons
					key="pdf"
					downloadPdf={downloadPdf}
					isDisabled={isLoadingPdf || isLoading}
					isLoading={isLoadingPdf}
					previewPdf={previewPdf}
				/>,
			]}
			title={title}
			width={700}
			centered
			closable
			open
			onCancel={onClose}
		>
			<Row justify="space-between">
				<Col>
					{headerName && (
						<Title
							level={4}
							style={{ marginBottom: 0, textTransform: 'uppercase' }}
						>
							{headerName}
						</Title>
					)}
					{headerSubtext && (
						<Text style={{ fontSize: 12 }}>{headerSubtext}</Text>
					)}
				</Col>
				<Col className="text-right">
					<Title
						level={4}
						style={{ marginBottom: 0, textTransform: 'uppercase' }}
					>
						Statement
						<br />
						of Account
					</Title>
				</Col>
			</Row>

			<div style={{ borderTop: '1px solid #000', margin: '12px 0 16px' }} />

			<Row gutter={[24, 16]}>
				<Col span={12}>
					<div>
						<Text strong>Client Name: </Text>
						{clientName || '—'}
					</div>
					{!isSupplier && account?.business_name && (
						<div>
							<Text strong>Agency/Business Name: </Text>
							{account.business_name}
						</div>
					)}
					<div>
						<Text strong>Address: </Text>
						{clientAddress || '—'}
					</div>
					<div>
						<Text strong>Client Code: </Text>
						{account?.account_code}
					</div>
					<div>
						<Text strong>Statement Period: </Text>
						{period[0].format('MMMM D, YYYY')} -{' '}
						{period[1].format('MMMM D, YYYY')}
					</div>
					<div>
						<Text strong>Date Issued: </Text>
						{dateIssued.format('MMMM D, YYYY')}
					</div>
				</Col>

				<Col span={12}>
					<Text style={{ textTransform: 'uppercase' }} strong>
						Account Summary
					</Text>
					<Row justify="space-between">
						<Text>Previous Balance</Text>
						<Text>{formatInPeso(statement.previousBalance)}</Text>
					</Row>
					<Row justify="space-between">
						<Text>New Charges</Text>
						<Text>{formatInPeso(statement.newCharges)}</Text>
					</Row>
					<Row justify="space-between">
						<Text>Payments</Text>
						<Text>{formatInPeso(statement.payments)}</Text>
					</Row>
					<Row justify="space-between">
						<Text>Total Balance Due</Text>
						<Text>{formatInPeso(statement.totalBalanceDue)}</Text>
					</Row>
				</Col>
			</Row>

			<Table
				className="mt-6"
				columns={COLUMNS}
				dataSource={statement.rows}
				loading={isLoading}
				pagination={false}
				size="small"
			/>

			<Row className="mt-4" gutter={[16, 16]}>
				<Col span={12}>
					<Text>Payment Due Date: _________________________</Text>
					<br />
					<Text>Statement Number: {statementNumber}</Text>
					<br />
					<Text>{branch?.store_name}</Text>
				</Col>
				<Col className="text-right" span={12}>
					<Text strong>
						Current Outstanding Balance:{' '}
						{formatInPeso(currentOutstandingBalance)}
					</Text>
				</Col>
			</Row>

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: htmlPdf }}
				style={{ display: 'none' }}
			/>
		</Modal>
	);
};
