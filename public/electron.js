const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const kill = require('tree-kill');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

const appTypes = {
	BACK_OFFICE: 'back_office',
	HEAD_OFFICE: 'head_office',
};

//-------------------------------------------------------------------
// Auto Updater
//-------------------------------------------------------------------
autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//-------------------------------------------------------------------
// Initialization
//-------------------------------------------------------------------
let mainWindow;
let splashWindow;
function createWindow() {
	let resetDB = null;
	if (isDev) {
		resetDB = require('./resetDB.js');
	} else {
		resetDB = require('../build/resetDB.js');
	}

	// Splash screen
	splashWindow = new BrowserWindow({
		width: 800,
		height: 600,
		transparent: true,
		frame: false,
		alwaysOnTop: true,
	});
	splashWindow.loadURL(`file://${__dirname}/splash.html`);

	// Main screen
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	mainWindow.webContents.on('new-window', (event, url) => {
		if (!url.startsWith('blob:')) {
			event.preventDefault();
			mainWindow.loadURL();
		}
	});

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		return { action: url.startsWith('blob:') ? 'allow' : 'deny' };
	});

	setTimeout(() => {
		mainWindow.loadURL(
			isDev
				? 'http://localhost:3010'
				: `file://${path.join(__dirname, '../build/index.html')}`,
		);
	}, 8000);

	mainWindow.once('ready-to-show', () => {
		splashWindow.destroy();
		mainWindow.maximize();
		mainWindow.show();
	});

	mainWindow.on('closed', () => {
		splashWindow = null;
		mainWindow = null;
	});

	// Initialize Store
	const store = initStore();

	// Migrate and Run API
	initServer(store);

	// Set Menu
	const menu = Menu.getApplicationMenu().items;
	menu.push({
		label: 'Database',
		submenu: [
			{
				label: 'Reset Clean',
				click: () => {
					mainWindow.setProgressBar(1);
					killSpawns();

					setTimeout(() => {
						const result = resetDB.resetClean();
						mainWindow.setProgressBar(-1);

						if (result) {
							const choice = dialog.showMessageBoxSync(mainWindow, {
								type: 'info',
								title: 'Success',
								buttons: ['Close'],
								message:
									'Database was reset successfully. Click button below to restart the app.',
								cancelId: -1,
							});

							if (choice === 0) {
								relaunchApp();
							}
						}
					}, 1000);
				},
			},
			{
				label: 'Reset Standalone',
				click: () => {
					mainWindow.setProgressBar(1);
					killSpawns();

					setTimeout(() => {
						const result = resetDB.resetStandalone();
						mainWindow.setProgressBar(-1);

						if (result) {
							const choice = dialog.showMessageBoxSync(mainWindow, {
								type: 'info',
								title: 'Success',
								buttons: ['Close'],
								message:
									'Database was reset successfully. Click button below to restart the app.',
								cancelId: -1,
							});

							if (choice === 0) {
								relaunchApp();
							}
						}
					}, 1000);
				},
			},
		],
	});
	Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

//-------------------------------------------------------------------
// Store
//-------------------------------------------------------------------

function initStore() {
	Store.initRenderer();

	const schema = {
		appType: {
			type: 'string',
			default: appTypes.BACK_OFFICE,
		},
	};

	const store = new Store({ schema });

	ipcMain.handle('getStoreValue', (event, key) => {
		console.log('key', key);
		return store.get(key);
	});

	ipcMain.handle('setStoreValue', (event, { key, value, relaunch = false }) => {
		console.log('key', key);
		console.log('value', value);

		store.set(key, value);

		if (relaunch) {
			relaunchApp();
		}
	});

	return store;
}

//-------------------------------------------------------------------
// Server
//-------------------------------------------------------------------
let spawnApi = null;
let spawnLocalhostRun = null;
function initServer(store) {
	if (!isDev) {
		logStatus('Server: Starting');
		appType = store.get('appType');
		const apiPath = path.join(process.resourcesPath, 'api');

		spawn('python', ['manage.py', 'migrate'], {
			cwd: apiPath,
			stdio: 'ignore',
		});

		let apiPort = '0.0.0.0:8000';
		if (appType === appTypes.HEAD_OFFICE) {
			apiPort = '[::]:8000';
		}

		logStatus('Server: Starting API');
		const apiCommand = `manage.py runserver ${apiPort}`;
		spawnApi = spawn('python', apiCommand.split(' '), {
			cwd: apiPath,
			detached: true,
			stdio: 'ignore',
		});
		logSpawn('API', spawnApi);
		logStatus('Server: Started API');

		if (appType === appTypes.HEAD_OFFICE) {
			logStatus('Server: Starting LocalhostRun');
			const localhostRunCommand =
				'ssh -R office.ej-jy.com:80:localhost:8000 localhost.run -- --no-inject-proxy-protocol-header';
			spawnLocalhostRun = spawn('cmd.exe', localhostRunCommand.split(' '), {
				detached: true,
			});
			logSpawn('LocalhostRun', spawnLocalhostRun);
			logStatus('Server: Starded LocalhostRun');
		}

		logStatus('Server: Started');

		mainWindow.once('closed', function () {
			killSpawns();
		});
	}
}

//-------------------------------------------------------------------
// Set single instance
//-------------------------------------------------------------------
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});

	// Load the rest of the app, etc...
	app.on('ready', createWindow);
}

//-------------------------------------------------------------------
// Check for updates
//
// We must only perform auto update in Windows OS
//-------------------------------------------------------------------
function logStatus(text) {
	log.info(text);
	mainWindow.webContents.send('message', text);
}
if (process.platform === 'win32') {
	autoUpdater.on('checking-for-update', () => {
		logStatus('Checking for update...');
	});

	autoUpdater.on('update-available', (info) => {
		dialog
			.showMessageBox(mainWindow, {
				type: 'info',
				title: 'Software Update',
				message: `EJJY Inventory App ${info.version} is available. Please press the button below to download the update.`,
				buttons: ['Download Update'],
				cancelId: -1,
			})
			.then(({ response }) => {
				if (response === 0) {
					autoUpdater.downloadUpdate();
				}
			});
	});

	autoUpdater.on('update-not-available', (info) => {
		logStatus('Update not available');
	});

	autoUpdater.on('error', (err) => {
		logStatus('Error in auto-updater: ' + err);
	});

	autoUpdater.on('download-progress', (progress) => {
		mainWindow.setProgressBar(Number(progress.percent) / 100);

		let log_message = 'Download speed: ' + progress.bytesPerSecond;
		log_message = log_message + ' - Downloaded ' + progress.percent + '%';
		log_message =
			log_message + ' (' + progress.transferred + '/' + progress.total + ')';
		logStatus(log_message);
	});

	autoUpdater.on('update-downloaded', (info) => {
		logStatus('Update downloaded');

		dialog
			.showMessageBox(mainWindow, {
				type: 'info',
				title: 'Software Update',
				message: 'EJJY Inventory App is successfully updated.',
				buttons: ['Install Update'],
				cancelId: -1,
			})
			.then(({ response }) => {
				if (response === 0) {
					autoUpdater.quitAndInstall();
				}
			});
	});

	app.on('ready', function () {
		autoUpdater.checkForUpdates();
	});
}

//-------------------------------------------------------------------
// Helper functions
//-------------------------------------------------------------------
function relaunchApp() {
	app.relaunch();
	app.exit();
}

function killSpawns() {
	if (spawnApi) {
		kill(spawnApi.pid);
	}

	if (spawnLocalhostRun) {
		kill(spawnLocalhostRun.pid);
	}
}

function logSpawn(key, spawn) {
	if (spawn) {
		if (spawn.stdout) {
			spawn.stdout.on('data', (data) => {
				logStatus(`[Spawn] ${key}: ${data}`);
			});
		}

		if (spawn.stderr) {
			spawn.stderr.on('data', (data) => {
				logStatus(`[Spawn] ${key} err: ${data}`);
			});
		}
	}
}
