import { Avatar, Descriptions, Modal, Tag } from 'antd';
import { accountTypes } from 'global';
import React from 'react';
import { formatDate, getAccountTypeName } from 'utils';
import { Button } from '../../elements';

const employers = [accountTypes.CORPORATE, accountTypes.GOVERNMENT];

interface Props {
	account: any;
	onClose: any;
}

export const ViewAccountModal = ({ account, onClose }: Props) => {
	return (
		<Modal
			className="Modal__hasFooter"
			footer={[<Button key="button" text="Close" onClick={onClose} />]}
			title="View Account"
			centered
			closable
			visible
			onCancel={onClose}
		>
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
			</Descriptions>
		</Modal>
	);
};
