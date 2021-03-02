/* eslint-disable react-hooks/exhaustive-deps */
import { Col, message, Row, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { Box, Button, ControlledInput, Label } from '../../../../components/elements';
import { useLocalBranchSettings } from '../../hooks/useLocalBranchSettings';
import { request } from '../../../../global/types';
import { isEmpty } from 'lodash';
import { useAuth } from '../../../../hooks/useAuth';

export const BackupServerUrlForm = () => {
	// STATES
	const [backupServerUrl, setBackupServerUrl] = useState('');

	// CUSTOM HOOKS
	const { user } = useAuth();
	const {
		localBranchSettings,
		getLocalBranchSettings,
		editLocalBranchSettings,
		status,
	} = useLocalBranchSettings();

	// EFFECTS
	useEffect(() => {
		getLocalBranchSettings(user?.branch?.id);
	}, []);

	useEffect(() => {
		setBackupServerUrl(localBranchSettings?.backup_server_url || '');
	}, [localBranchSettings]);

	const onSaveSettings = () => {
		if (isEmpty(backupServerUrl)) {
			message.error('Please make sure to fill all the fields.');
			return;
		}

		editLocalBranchSettings({
			...localBranchSettings,
			backup_server_url: backupServerUrl,
			branchId: user?.branch?.id,
		});
	};

	return (
		<Box className="BackupServerUrl">
			<Spin size="large" spinning={status === request.REQUESTING}>
				<Row gutter={[15, 0]}>
					<Col xs={24} sm={20} md={20}>
						<Label label="Backup Server URL" spacing />
						<ControlledInput
							value={backupServerUrl}
							onChange={(value) => setBackupServerUrl(value)}
							max={75}
						/>
					</Col>
					<Col xs={24} sm={4} md={4} className="button-column">
						<Button text="Save Settings" variant="primary" onClick={onSaveSettings} />
					</Col>
				</Row>
			</Spin>
		</Box>
	);
};
