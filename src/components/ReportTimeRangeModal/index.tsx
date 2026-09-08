import { FolderOpenOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	DatePicker,
	Modal,
	Progress,
	Row,
	Select,
	message,
} from 'antd';
import { Label } from 'components/elements';
import { RequestErrors } from 'components/RequestErrors';
import { BranchMachine, filterOption } from 'ejjy-global';
import {
	branchMachineTypes,
	DESKTOP_FOLDER_OPEN_FUNCTION,
	EJOURNAL_FOLDER,
	GENERIC_ERROR_MESSAGE,
	MAX_PAGE_SIZE,
} from 'global';
import dayjs from 'dayjs';
import { useBranchMachines, useBulkExport, useSiteSettings } from 'hooks';
import moment, { Moment } from 'moment';
import React, { useState } from 'react';
import { useEjournalExportStore, useUserStore } from 'stores';
import {
	convertIntoArray,
	getLocalApiUrl,
	getReportsApiUrl,
	setEjournalLastExportedAt,
} from 'utils';

let ipcRenderer;
if (window.require) {
	const electron = window.require('electron');
	ipcRenderer = electron.ipcRenderer;
}

const branchMachineCashieringTypes = [
	branchMachineTypes.CASHIERING,
	branchMachineTypes.SCALE_AND_CASHIERING,
];

interface Props {
	branchId: string | number;
	// Optionally pre-selects a branch machine; the dropdown below still lets
	// it be changed to any other cashiering machine on the branch.
	branchMachine?: BranchMachine;
	onClose: any;
}

export const ReportTimeRangeModal = ({
	branchId,
	branchMachine,
	onClose,
}: Props) => {
	// STATES
	const [
		selectedBranchMachine,
		setSelectedBranchMachine,
	] = useState<BranchMachine | null>(branchMachine || null);
	// Left blank by default: an unset month exports the full, exhaustive
	// history exactly as this modal always has. Picking a month instead
	// scopes the run to just that calendar month, so an initial backfill
	// can be run one fast month at a time rather than as one long shot.
	const [selectedMonth, setSelectedMonth] = useState<Moment | null>(null);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const { ejournalExport, setEjournalExport } = useEjournalExportStore();
	const {
		data: { branchMachines },
		isFetching: isFetchingBranchMachines,
		error: branchMachinesError,
	} = useBranchMachines({
		params: { branchId, pageSize: MAX_PAGE_SIZE },
	});
	const { data: siteSettings, error: siteSettingsError } = useSiteSettings();
	const { mutateAsync: bulkExport, error: bulkExportError } = useBulkExport();

	// METHODS
	const cashieringBranchMachines = branchMachines.filter((machine) =>
		branchMachineCashieringTypes.includes(machine.type),
	);

	const handleOpenEjournalFolder = () => {
		if (!ipcRenderer) {
			return;
		}

		ipcRenderer.send(DESKTOP_FOLDER_OPEN_FUNCTION, EJOURNAL_FOLDER);
	};

	const handleBulkExport = async () => {
		if (!selectedBranchMachine) {
			return;
		}

		setEjournalExport({
			isExporting: true,
			progress: 0,
			branchMachineName: selectedBranchMachine.name,
		});

		// Captured before the export starts (not after it finishes) so the
		// checkpoint never skips anything created while this run was in
		// flight -- the next export (manual or auto) picks up from here.
		const startedAt = dayjs().toISOString();

		try {
			await bulkExport({
				branchMachine: selectedBranchMachine,
				siteSettings,
				user,
				// .clone() before startOf/endOf -- both mutate moment objects
				// in place, and selectedMonth is React state.
				since: selectedMonth?.clone().startOf('month').toISOString(),
				until: selectedMonth?.clone().endOf('month').toISOString(),
				onProgress: (progress) => setEjournalExport({ progress }),
				// backoffice's local API is shared by every machine on the
				// branch (unlike a cashiering terminal's own local API), so
				// every export must be nested under its own machine folder.
				groupByBranchMachine: true,
				readBaseURL: getReportsApiUrl(),
				writeBaseURL: getLocalApiUrl(),
			});

			// Only advance the "fully caught up" checkpoint when this run
			// covered through the present -- a full-history run (no month
			// picked) or one scoped to the current month. Backfilling an
			// older month on its own must not fool a later automatic run
			// into skipping whatever months still sit in between.
			if (!selectedMonth || selectedMonth.isSame(moment(), 'month')) {
				setEjournalLastExportedAt(selectedBranchMachine.id, startedAt);
			}

			handleOpenEjournalFolder();

			message.success('E-journals have been generated successfully.');
		} catch (error) {
			message.error(GENERIC_ERROR_MESSAGE);
		} finally {
			// Reset via the store (not just local state) so the persistent
			// indicator clears too, whether this modal is still open or not.
			setEjournalExport({ isExporting: false });
		}
	};

	return (
		<Modal
			className="Modal__hasFooter"
			footer={
				<Row gutter={[8, 8]}>
					<Col span={12}>
						<Button
							disabled={!ipcRenderer}
							icon={<FolderOpenOutlined />}
							block
							onClick={handleOpenEjournalFolder}
						>
							Open Folder
						</Button>
					</Col>
					<Col span={12}>
						<Button
							disabled={!selectedBranchMachine}
							loading={ejournalExport.isExporting}
							type="primary"
							block
							onClick={handleBulkExport}
						>
							Submit
						</Button>
					</Col>
				</Row>
			}
			title="Generate E-journals"
			width={400}
			centered
			closable
			open
			onCancel={onClose}
		>
			<RequestErrors
				errors={[
					...convertIntoArray(bulkExportError),
					...convertIntoArray(siteSettingsError),
					...convertIntoArray(branchMachinesError),
				]}
				withSpaceBottom
			/>

			<Label label="Branch Machine" spacing />
			<Select
				className="w-100 mb-4"
				disabled={ejournalExport.isExporting}
				filterOption={filterOption}
				loading={isFetchingBranchMachines}
				optionFilterProp="children"
				placeholder="Select branch machine"
				value={selectedBranchMachine?.id}
				showSearch
				onChange={(value) => {
					setSelectedBranchMachine(
						cashieringBranchMachines.find((machine) => machine.id === value) ||
							null,
					);
				}}
			>
				{cashieringBranchMachines.map((machine) => (
					<Select.Option key={machine.id} value={machine.id}>
						{machine.name}
					</Select.Option>
				))}
			</Select>

			<Label label="Month (optional)" spacing />
			<DatePicker
				className="w-100 mb-4"
				disabled={ejournalExport.isExporting}
				disabledDate={(date) => date.isAfter(moment(), 'month')}
				picker="month"
				placeholder="Leave blank for full history"
				value={selectedMonth}
				allowClear
				onChange={setSelectedMonth}
			/>

			{ejournalExport.isExporting && (
				<Progress
					className="mt-4"
					percent={Math.round(ejournalExport.progress)}
					status="active"
				/>
			)}
		</Modal>
	);
};
