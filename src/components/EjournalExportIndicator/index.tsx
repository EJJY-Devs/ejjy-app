import { Progress } from 'antd';
import React from 'react';
import { useEjournalExportStore } from 'stores';

// Mounted once at the app root so an e-journal export started from
// ReportTimeRangeModal stays visible -- and its progress keeps updating --
// no matter which modals get closed afterwards. See useEjournalExportStore
// for where the state it reads comes from.
export const EjournalExportIndicator = () => {
	const { ejournalExport } = useEjournalExportStore();

	if (!ejournalExport.isExporting) {
		return null;
	}

	return (
		<div
			style={{
				position: 'fixed',
				bottom: '1em',
				right: '1em',
				zIndex: 999,
				width: 280,
				padding: '10px 16px',
				background: '#fff',
				borderRadius: 6,
				boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
			}}
		>
			<div style={{ marginBottom: 4, fontWeight: 600 }}>
				Generating e-journals
				{ejournalExport.branchMachineName
					? ` for ${ejournalExport.branchMachineName}`
					: ''}
				...
			</div>
			<Progress
				percent={Math.round(ejournalExport.progress)}
				size="small"
				status="active"
			/>
		</div>
	);
};
