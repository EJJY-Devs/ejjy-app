import { jsPDFOptions } from 'jspdf';

// App
export const APP_KEY = process.env.REACT_APP_KEY;
export const IS_APP_LIVE = process.env.REACT_APP_IS_LIVE === 'true';
export const SHOW_HIDE_SHORTCUT = ['meta+s', 'ctrl+s'];

// Local Storage
export const APP_APP_TYPE_KEY = 'EJJY_APP_TYPE';
export const APP_HEAD_OFFICE_TYPE = 'EJJY_HEAD_OFFICE_TYPE';
export const APP_BRANCH_KEY_KEY = 'EJJY_BRANCH_KEY';
export const APP_ONLINE_BRANCH_ID_KEY = 'EJJY_BRANCH_ID';
export const APP_LOCAL_BRANCH_ID_KEY = 'EJJY_LOCAL_BRANCH_ID';
export const APP_LOCAL_API_URL_KEY = 'EJJY_LOCAL_API_URL';
export const APP_ONLINE_API_URL_KEY = 'EJJY_ONLINE_API_URL';
export const APP_GOOGLE_API_URL_KEY = 'EJJY_GOOGLE_API_URL';
export const APP_RECEIPT_PRINTER_NAME = 'EJJY_PRINTER_NAME';
export const APP_RECEIPT_PRINTER_FONT_FAMILY = 'EJJY_PRINTER_FONT_FAMILY';
export const APP_RECEIPT_PRINTER_FONT_SIZE = 'EJJY_PRINTER_FONT_SIZE';

export const APP_TAG_PRINTER_PAPER_WIDTH = 'EJJY_TAG_PRINTER_PAPER_WIDTH';
export const APP_TAG_PRINTER_PAPER_HEIGHT = 'EJJY_TAG_PRINTER_PAPER_HEIGHT';
export const APP_TAG_PRINTER_FONT_FAMILY = 'EJJY_TAG_PRINTER_FONT_FAMILY';
export const APP_TAG_PRINTER_FONT_SIZE = 'EJJY_TAG_PRINTER_FONT_SIZE';

export const APP_PRODUCTS_IDS = 'EJJY_PRODUCT_IDS';
export const APP_BRANCH_PRODUCT_IDS = 'EJJY_BRANCH_PRODUCT_IDS';

// Request
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 500;
export const MAX_RETRY = 1;
export const RETRY_INTERVAL_MS = 300;
export const REPORTS_RETRY_INTERVAL_MS = 30_000;
export const NOTIFICATION_INTERVAL_MS = 10_000;
export const GENERIC_ERROR_MESSAGE =
	'An error occurred while processing your request.';
export const GENERIC_STATUS_500_MESSAGE =
	'An error occurred in the server while processing your request.';
export const GENERIC_BRANCH_ERROR_MESSAGE =
	'An error occurred while requesting on a local branch';

// UI
export const ADMIN_PASSWORD = 'generic123';
export const QUANTITY_WEIGHING_PRECISION = 3;
export const QUANTITY_NON_WEIGHING_PRECISION = 0;
export const VIEW_PRINTING_MODAL_WIDTH = 425;
export const NOT_FOUND_INDEX = -1;
export const EMPTY_CELL = '-';
export const SEARCH_DEBOUNCE_TIME = 500;
export const ROW_HEIGHT = 65;
export const ALL_OPTION_KEY = 'all';
export const ONLINE_ROUTES = [
	'/requisition-slips',
	'/order-slips',
	'/preparation-slips',
];
export const NO_BRANCH_ID = -1;
export const PENDING_CREATE_USERS_BRANCH_ID = -2;
export const PENDING_EDIT_USERS_BRANCH_ID = -3;
export const MAIN_BRANCH_ID = 1;
export const SALES_TRACKER_NOTIFICATION_THRESHOLD = 1_000;
export const DATE_FORMAT = 'MM/DD/YY';
export const DEV_USERNAME = 'dev';
export const RECEIPT_DEFAULT_FONT_FAMILY = 'monospace';
export const RECEIPT_DEFAULT_FONT_SIZE = '12';
export const TAG_DEFAULT_PAPER_WIDTH = '30';
export const TAG_DEFAULT_PAPER_HEIGHT = '20';
export const TAG_DEFAULT_FONT_FAMILY = 'Arial';
export const TAG_DEFAULT_FONT_SIZE = '13';
export const TAG_MM_TO_PX = 3.7795; // 1mm
export const JSPDF_SETTINGS: jsPDFOptions = {
	orientation: 'p',
	unit: 'px',
	format: [400, 700],
	// hotfixes: ['px_scaling'],
};

export const EJOURNAL_FOLDER = 'media';
export const DESKTOP_FOLDER_OPEN_FUNCTION = 'openFolder';

export const AUTOMATIC_GENERATED_REPORT_USER_NAME = 'Auto';

// eslint-disable-next-line no-console
console.info('IS LIVE: ', process.env.REACT_APP_IS_LIVE);
