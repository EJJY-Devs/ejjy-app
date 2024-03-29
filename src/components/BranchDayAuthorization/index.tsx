import { Button, message, Spin, Tooltip } from 'antd';
import cn from 'classnames';
import dayjs from 'dayjs';
import { EMPTY_CELL } from 'global';
import {
	useBranchDayAuthorizationCreate,
	useBranchDayAuthorizationEnd,
	useBranchDayAuthorizationsRetrieve,
	useSiteSettings,
} from 'hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { useUserStore } from 'stores';
import swal from 'sweetalert';
import { convertIntoArray, formatDateTimeExtended, getId } from 'utils';
import { RequestErrors } from '..';
import { Box } from '../elements';
import './style.scss';

interface Props {
	bordered?: boolean;
	branch: any;
	className?: string;
	onSuccess?: any;
}

export const BranchDayAuthorization = ({
	bordered,
	branch,
	className,
	onSuccess,
}: Props) => {
	// STATES
	const [branchDay, setBranchDay] = useState(null);

	// CUSTOM HOOKS
	const user = useUserStore((state) => state.user);
	const {
		data: siteSettings,
		isFetching: isFetchingSiteSettings,
	} = useSiteSettings();
	const {
		data: fetchedBranchDay,
		isFetching: isFetchingBranchDayAuthorization,
	} = useBranchDayAuthorizationsRetrieve({
		params: {
			branchId: branch.id,
			onlineBranchId: getId(branch),
		},
	});
	const {
		mutateAsync: createBranchDayAuthorization,
		isLoading: isCreatingBranchDayAuthorization,
		error: createBranchDayAuthorizationError,
	} = useBranchDayAuthorizationCreate();
	const {
		mutateAsync: endBranchDayAuthorization,
		isLoading: isEndingBranchDayAuthorization,
		error: endBranchDayAuthorizationError,
	} = useBranchDayAuthorizationEnd();

	// METHODS
	useEffect(() => {
		if (fetchedBranchDay) {
			setBranchDay(fetchedBranchDay);
		}
	}, [fetchedBranchDay]);

	const isPastCloseDayDeadline = useCallback(() => {
		if (siteSettings) {
			const today = dayjs();
			const closeDayDeadline = dayjs(
				siteSettings.close_day_deadline,
				'hh:mm:ss',
			);

			return closeDayDeadline.diff(today, 'milliseconds') <= 0;
		}

		return null;
	}, [siteSettings]);

	const getTitle = useCallback(() => {
		if (branchDay?.datetime_ended) {
			return 'Day has been closed.';
		}

		if (branchDay) {
			return 'Day has been opened.';
		}

		return EMPTY_CELL;
	}, [branchDay]);

	const getDate = useCallback(() => {
		if (branchDay?.datetime_ended) {
			return formatDateTimeExtended(branchDay?.datetime_ended);
		}

		if (branchDay) {
			return formatDateTimeExtended(branchDay?.datetime_created);
		}

		return null;
	}, [branchDay]);

	const handleClick = () => {
		swal({
			title: 'Confirmation',
			text: `Are you sure you want to ${branchDay ? 'close' : 'open'} the day?`,
			icon: 'warning',
			buttons: {
				cancel: {
					text: 'Cancel',
					value: null,
					visible: true,
					closeModal: true,
				},
				confirm: {
					text: 'OK',
					value: true,
					visible: true,
					closeModal: true,
				},
			},
		}).then(async (value) => {
			if (value) {
				let response = null;
				if (branchDay) {
					response = await endBranchDayAuthorization({
						branchIds: `${getId(branch)}`,
						endedById: getId(user),
					});

					message.success('Day was closed successfully.');
				} else {
					response = await createBranchDayAuthorization({
						branchIds: `${getId(branch)}`,
						startedById: getId(user),
					});

					message.success('Day was opened successfully.');
				}

				if (response) {
					const branchDayAuth = response.data[0];
					onSuccess?.(getId(branch), !branchDay);

					setBranchDay(() => ({
						...branchDayAuth,
						online_id: branchDayAuth.id,
					}));
				}
			}
		});
	};

	return (
		<>
			<RequestErrors
				errors={[
					...convertIntoArray(createBranchDayAuthorizationError?.errors),
					...convertIntoArray(endBranchDayAuthorizationError?.errors),
				]}
				withSpaceBottom
			/>
			<Box
				className={cn('CashieringCard', className, {
					CashieringCard__bordered: bordered,
				})}
			>
				<Spin
					spinning={
						isFetchingSiteSettings ||
						isFetchingBranchDayAuthorization ||
						isCreatingBranchDayAuthorization ||
						isEndingBranchDayAuthorization
					}
				>
					<div className="CashieringCard_container">
						<div>
							<p className="CashieringCard_title">{getTitle()}</p>
							<span className="CashieringCard_date">{getDate()}</span>
						</div>

						{!branchDay?.datetime_ended && (
							<Tooltip
								title={
									isPastCloseDayDeadline()
										? 'Already past the close day deadline.'
										: null
								}
							>
								<Button
									disabled={isPastCloseDayDeadline()}
									type="primary"
									onClick={handleClick}
								>
									{branchDay ? 'Close Day' : 'Open Day'}
								</Button>
							</Tooltip>
						)}
					</div>
				</Spin>
			</Box>
		</>
	);
};

BranchDayAuthorization.defaultProps = {
	className: undefined,
	bordered: false,
};
