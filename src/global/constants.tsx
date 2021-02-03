export const IS_APP_LIVE = process.env.REACT_APP_IS_LIVE == 'true';

export const APP_KEY = process.env.REACT_APP_KEY;

export const APP_TITLE = process.env.REACT_APP_TITLE;

export const MAX_PAGE_SIZE = 500;

export const MAX_RETRY = 1;

export const AUTH_CHECKING_INTERVAL_MS = 10000;

export const RETRY_INTERVAL_MS = 300;

export const NOT_FOUND_INDEX = -1;

export const EMPTY_CELL = '—';

export const ONLINE_ROUTES = ['/requisition-slips', '/order-slips', '/preparation-slips'];

console.info('IS LIVE: ', process.env.REACT_APP_IS_LIVE);
