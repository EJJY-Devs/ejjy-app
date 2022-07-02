const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');
const { resolve } = require('path');
const isDev = require('electron-is-dev');
const window = require('electron').BrowserWindow;
const log = require('electron-log');

const API_PATH = isDev
	? resolve('api')
	: path.join(process.resourcesPath, 'api');

const SQLITE_DB_NAME = 'db.sqlite3';
const SQLITE_CLEAN_DB_NAME = 'db-clean.sqlite3';

function logStatus(text) {
	log.info(text);

	const focusedWindow = window.getFocusedWindow();
	if (focusedWindow) {
		focusedWindow.webContents.send('message', text);
	}
}

module.exports = async function () {
	SQLITE_DB_NAME;

	// Append the timestamp to sqlite db
	const SQLITE_DB_PATH = path.join(API_PATH, SQLITE_DB_NAME);
	if (fs.existsSync(SQLITE_DB_PATH)) {
		const dbName = 'db-' + dayjs().format('DDMMYYYYHHmmss') + '.sqlite3';
		const newSqliteDbName = path.join(API_PATH, dbName);

		fs.renameSync(SQLITE_DB_PATH, newSqliteDbName);
		logStatus(`[RESET]: Renamed ${SQLITE_DB_NAME} into ${dbName}`);
	}

	// Check if clean sqlite db exists and rename to sqlite db name
	const SQLITE_CLEAN_DB_PATH = path.join(API_PATH, SQLITE_CLEAN_DB_NAME);
	if (fs.existsSync(SQLITE_CLEAN_DB_PATH)) {
		const newSqliteDbName = path.join(API_PATH, SQLITE_DB_NAME);

		fs.renameSync(SQLITE_CLEAN_DB_PATH, newSqliteDbName);
		logStatus(
			`[RESET]: Renamed ${SQLITE_CLEAN_DB_PATH} into ${newSqliteDbName}`,
		);
	}
};