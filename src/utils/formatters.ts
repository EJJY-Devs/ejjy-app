import dayjs from 'dayjs';
import { EMPTY_CELL, unitOfMeasurementTypes } from 'global';
import _ from 'lodash';

export const formatDateTime = (datetime, withTimezone = true) => {
	const dt = withTimezone ? dayjs.tz(datetime, 'GMT') : dayjs(datetime);
	return dt.format('MM/DD/YYYY--h:mmA');
};

export const formatDateTimeExtended = _.memoize((datetime) =>
	dayjs.tz(datetime).format('MMMM D, YYYY h:mmA'),
);

export const formatDateTimeShortMonth = _.memoize((datetime) =>
	dayjs.tz(datetime).format('MMM D, YYYY h:mmA'),
);

export const formatDateTime24Hour = _.memoize((datetime) =>
	dayjs.tz(datetime).format('MM/DD/YYYY HH:mm'),
);

export const formatDate = _.memoize((date) =>
	dayjs.tz(date).format('MM/DD/YYYY'),
);

export const formatTime = _.memoize((time) => dayjs.tz(time).format('h:mmA'));

export const formatTimeOnly = (time) => dayjs(time, 'HH:mm:ss').format('h:mmA');

export const formatTimeRange = (date1, date2) => {
	const MODIFIED_EMPTY_CELL = '';
	let timeRange = MODIFIED_EMPTY_CELL;

	if (dayjs.tz(date1).isSame(dayjs.tz(date2), 'day')) {
		timeRange = `${formatDate(date1)} ${formatTime(date1)} – ${
			date2 ? formatTime(date2) : MODIFIED_EMPTY_CELL
		}`;
	} else {
		timeRange = `${
			date1 ? formatDateTimeShortMonth(date1) : MODIFIED_EMPTY_CELL
		} – ${date2 ? formatDateTimeShortMonth(date2) : MODIFIED_EMPTY_CELL}`;
	}

	return timeRange;
};

export const formatNumberWithCommas = (x) =>
	x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');

export const standardRound = (number) => _.round(number, 3).toFixed(2);

export const formatInPeso = (value, pesoSign = '₱') => {
	const x = Number(value);

	return _.isNaN(x)
		? EMPTY_CELL
		: `${x < 0 ? '-' : ''}${pesoSign}${formatNumberWithCommas(
				standardRound(Math.abs(x)),
		  )}`;
};

export const formatQuantity = ({
	unitOfMeasurement,
	quantity,
	isCeiled = false,
}): string => {
	let balance = Number(quantity);

	if (isCeiled) {
		balance = Math.ceil(Number(balance));
	}

	return unitOfMeasurement === unitOfMeasurementTypes.WEIGHING
		? balance.toFixed(3)
		: balance.toFixed(0);
};

export const formatRemoveCommas = (x) => x?.toString()?.replace(/,/g, '') || '';

export const convertToBulk = (pieces, piecesInBulk) =>
	Math.floor(pieces / piecesInBulk);

export const convertToPieces = (bulk, piecesInBulk) => bulk * piecesInBulk;

export const convertIntoArray = (errors, prefixMessage = null) => {
	const prefix = prefixMessage ? `${prefixMessage}: ` : '';
	let array = [];

	if (_.isString(errors)) {
		array = [prefix + errors];
	} else if (_.isArray(errors)) {
		array = errors.map((error) => prefix + error);
	}

	return array;
};
