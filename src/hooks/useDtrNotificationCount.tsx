import { attendanceCategories } from 'ejjy-global';
import { MAX_PAGE_SIZE, serviceTypes } from 'global';
import { useAttendanceLogs, useProblematicAttendanceLogs } from 'hooks';

const useDtrNotificationCount = () => {
	const params = {
		attendanceCategory: attendanceCategories.ATTENDANCE,
		pageSize: MAX_PAGE_SIZE,
	};

	const { isSuccess: isAttendanceLogsSuccess } = useAttendanceLogs({
		params: {
			...params,
			serviceType: serviceTypes.OFFLINE,
		},
		options: { notifyOnChangeProps: ['isSuccess'] },
	});
	const {
		data: { total: problematicAttendanceLogsCount },
	} = useProblematicAttendanceLogs({
		params,
		options: {
			enabled: isAttendanceLogsSuccess,
			notifyOnChangeProps: ['data'],
		},
	});

	return problematicAttendanceLogsCount;
};

export default useDtrNotificationCount;
