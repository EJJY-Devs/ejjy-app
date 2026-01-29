import { QrcodeOutlined } from '@ant-design/icons';
import { Avatar, Button, Descriptions, Tag, Divider, Card } from 'antd';
import { getFullName, printEmployeeCode } from 'ejjy-global';
import { accountTypes } from 'global';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import _ from 'lodash';
import QRCode from 'qrcode';
import React, { useState } from 'react';
import { formatDate, getAccountTypeName, getUserTypeName } from 'utils';

interface Props {
	account: any;
}

export const AccountDetails = ({ account }: Props) => {
	// STATES
	const [html, setHtml] = useState('');
	const [isPrinting, setIsPrinting] = useState(false);

	// VARIABLES
	const employers = [accountTypes.CORPORATE, accountTypes.GOVERNMENT];

	// METHODS
	const getBarcode = async (id) => {
		const barcodeCanvas = document.createElement('canvas');
		JsBarcode(barcodeCanvas, id, { format: 'CODE39' });
		return barcodeCanvas.toDataURL('image/png');
	};

	const getQrCode = async (id) => QRCode.toDataURL(id);

	const handlePrintEmployeeCode = async (employee) => {
		setIsPrinting(true);

		const id = _.toString(employee.account_code);
		const barcode = await getBarcode(id);
		const qrCode = await getQrCode(id);

		const dataHtml = printEmployeeCode(getFullName(employee), barcode, qrCode);

		// eslint-disable-next-line new-cap
		const pdf = new jsPDF({
			unit: 'mm',
			format: 'letter',
		});

		setHtml(dataHtml);

		pdf.html(dataHtml, {
			margin: 1,
			callback: (instance) => {
				window.open(instance.output('bloburl').toString());
				setIsPrinting(false);
				setHtml('');
			},
		});
	};

	return (
		<>
			<Descriptions column={2} bordered>
				<Descriptions.Item label="First Name">
					{account.first_name}
				</Descriptions.Item>

				<Descriptions.Item label="Last Name">
					{account.last_name}
				</Descriptions.Item>

				<Descriptions.Item label="Middle Name">
					{account.middle_name}
				</Descriptions.Item>

				<Descriptions.Item label="Code">
					{account.account_code}
				</Descriptions.Item>

				<Descriptions.Item label="Gender">
					{account.gender === 'm' ? 'Male' : 'Female'}
				</Descriptions.Item>

				<Descriptions.Item label="Type">
					{getAccountTypeName(account.type)}
				</Descriptions.Item>

				<Descriptions.Item label="Date of Registration">
					{formatDate(account.datetime_created)}
				</Descriptions.Item>

				<Descriptions.Item label="Birthday">
					{formatDate(account.birthday)}
				</Descriptions.Item>

				{account.type === accountTypes.EMPLOYEE && (
					<>
						<Descriptions.Item label="Nationality">
							{account.nationality}
						</Descriptions.Item>
						<Descriptions.Item label="Religion">
							{account.religion}
						</Descriptions.Item>
						<Descriptions.Item label="Father's Name">
							{account.father_name}
						</Descriptions.Item>
						<Descriptions.Item label="Mother's Maiden Name">
							{account.mother_maiden_name}
						</Descriptions.Item>
						<Descriptions.Item label="Email Address">
							{account.email_address}
						</Descriptions.Item>
						<Descriptions.Item label="Biodata Image">
							<Avatar src={account.biodata_image} />
						</Descriptions.Item>
					</>
				)}

				<Descriptions.Item label="TIN">{account.tin}</Descriptions.Item>

				{employers.includes(account.type) && (
					<>
						<Descriptions.Item
							label={
								account.type === accountTypes.CORPORATE
									? 'Business Name'
									: 'Agency Name'
							}
						>
							{account.business_name}
						</Descriptions.Item>
						<Descriptions.Item
							label={
								account.type === accountTypes.CORPORATE
									? 'Address (Business)'
									: 'Address (Agency)'
							}
						>
							{account.business_address}
						</Descriptions.Item>
					</>
				)}

				<Descriptions.Item label="Contact Number">
					{account.contact_number}
				</Descriptions.Item>
				<Descriptions.Item label="Address (Home)" span={2}>
					{account.home_address}
				</Descriptions.Item>

				<Descriptions.Item label="Loyalty Membership">
					{account.is_point_system_eligible ? (
						<Tag color="green">Yes</Tag>
					) : (
						<Tag color="red">No</Tag>
					)}
				</Descriptions.Item>

				{account.type === accountTypes.EMPLOYEE && (
					<Descriptions.Item label="Actions">
						<Button
							icon={<QrcodeOutlined />}
							loading={isPrinting}
							type="primary"
							onClick={() => handlePrintEmployeeCode(account)}
						>
							Print Employee Code
						</Button>
					</Descriptions.Item>
				)}
			</Descriptions>

			{account.type === accountTypes.EMPLOYEE && (
				<>
					<Divider orientation="left">User Account Details</Divider>
					{account.user ? (
						<Card>
							<Descriptions column={2} bordered>
								<Descriptions.Item label="Username">
									{account.user.username}
								</Descriptions.Item>

								<Descriptions.Item label="Email">
									{account.user.email}
								</Descriptions.Item>

								<Descriptions.Item label="User Type">
									{getUserTypeName(account.user.user_type)}
								</Descriptions.Item>

								<Descriptions.Item label="PIN">
									{account.user.pin ? '••••••' : 'Not Set'}
								</Descriptions.Item>

								<Descriptions.Item label="Last Login">
									{account.user.last_login
										? formatDate(account.user.last_login)
										: 'Never'}
								</Descriptions.Item>

								<Descriptions.Item label="Account Status">
									<Tag color="green">Active</Tag>
								</Descriptions.Item>
							</Descriptions>
						</Card>
					) : (
						<Card>
							<div style={{ textAlign: 'center', padding: '20px' }}>
								<Tag color="orange">No User Account</Tag>
								<p style={{ marginTop: '10px', color: '#8c8c8c' }}>
									This employee does not have a user account for system login.
									Create one from the Employees tab.
								</p>
							</div>
						</Card>
					)}
				</>
			)}

			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: html }}
				style={{ display: 'none' }}
			/>
		</>
	);
};
