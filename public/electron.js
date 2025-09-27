const {
	app,
	BrowserWindow,
	Menu,
	dialog,
	ipcMain,
	shell,
} = require('electron');
const { autoUpdater } = require('electron-updater');
const kill = require('tree-kill');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const path = require('path');
const { spawn, exec } = require('child_process');
const Store = require('electron-store');
const fs = require('fs');

// Persistent store for UI/app settings (zoomLevel, appType, headOfficeType)
const store = new Store({ defaults: { zoomLevel: 1 } });

const TUNNELING_INTERVAL_MS = 60_000;
const SPLASH_SCREEN_SHOWN_MS = 8_000;

// Zoom configuration with bounds
const ZOOM_CONFIG = {
	DEFAULT: 1,
	MIN: 0.5,
	MAX: 2.0,
	STEP: 0.1,
};

// Validate and sanitize zoom level
function validateZoomLevel(level) {
	const numLevel = parseFloat(level);
	if (
		isNaN(numLevel) ||
		numLevel < ZOOM_CONFIG.MIN ||
		numLevel > ZOOM_CONFIG.MAX
	) {
		return ZOOM_CONFIG.DEFAULT;
	}
	return Math.round(numLevel * 10) / 10; // Round to 1 decimal place
}

let zoomLevel = validateZoomLevel(store.get('zoomLevel', ZOOM_CONFIG.DEFAULT));

// Safe zoom update function
function updateZoom(newLevel) {
	const validatedLevel = validateZoomLevel(newLevel);
	zoomLevel = validatedLevel;
	if (mainWindow && !mainWindow.isDestroyed()) {
		mainWindow.webContents.setZoomFactor(zoomLevel);
		store.set('zoomLevel', zoomLevel);
		logStatus(`Zoom level set to: ${(zoomLevel * 100).toFixed(0)}%`);
	}
}

const appTypes = {
	BACK_OFFICE: 'back_office',
	HEAD_OFFICE: 'head_office',
};

const apiPath = isDev
	? path.resolve(__dirname, '../api')
	: path.join(process.resourcesPath, 'api');

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

function logStatus(text) {
	log.info(text);
	if (mainWindow) {
		mainWindow.webContents.send('message', text);
	}
}

// Helper to get backend config path (unique file name)
function getBackendConfigPath(appType) {
	let configDir;
	if (appType === appTypes.HEAD_OFFICE) {
		configDir = 'EJJY-Inventory-Headoffice-App';
	} else if (appType === appTypes.BACK_OFFICE) {
		configDir = 'EJJY-Inventory-App';
	} else {
		configDir = 'EJJY-Cashiering';
	}
	return path.join(app.getPath('appData'), configDir, 'backend-config.json');
}

function createWindow() {
	// Splash screen
	splashWindow = new BrowserWindow({
		width: 800,
		height: 600,
		transparent: true,
		frame: false,
		alwaysOnTop: true,
	});
	splashWindow.loadURL(`file://${__dirname}/splash.html`);

	// Main Screen
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			zoomFactor: 1.0,
		},
	});

	const allowedLinks = ['blob:', 'https://gamy-mayonnaise-e86.notion.site'];
	mainWindow.webContents.setWindowOpenHandler(({ url }) => ({
		action: allowedLinks.some((link) => url.startsWith(link))
			? 'allow'
			: 'deny',
	}));

	setTimeout(() => {
		mainWindow.loadURL(
			isDev
				? 'http://localhost:3010'
				: `file://${path.join(__dirname, '../build/index.html')}`,
		);
	}, SPLASH_SCREEN_SHOWN_MS);

	mainWindow.once('ready-to-show', () => {
		splashWindow.destroy();
		mainWindow.maximize();
		mainWindow.show();
		// Apply validated zoom level using the safe function
		updateZoom(zoomLevel);
	});

	// Prevent unintended zoom changes from system gestures or shortcuts
	mainWindow.webContents.once('dom-ready', () => {
		// Disable zoom via Ctrl+MouseWheel and other zoom gestures
		mainWindow.webContents.executeJavaScript(`
			document.addEventListener('wheel', function(e) {
				if (e.ctrlKey) {
					e.preventDefault();
				}
			}, { passive: false });
			
			document.addEventListener('keydown', function(e) {
				// Block Ctrl+Plus, Ctrl+Minus, Ctrl+0 from web content (let Electron handle them)
				if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
					e.preventDefault();
				}
			});
		`);
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
	const menuItems = Menu.getApplicationMenu().items;

	// --- Backup Handler ---
	async function handleBackup() {
		mainWindow.setProgressBar(1);

		// Read config to get app type and DB name
		const appType = store.get('appType');
		const configPath = getBackendConfigPath(appType);
		let config = {};
		try {
			config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		} catch (e) {
			logStatus('Failed to read backend-config.json: ' + e.message);
			mainWindow.setProgressBar(-1);
			return;
		}

		const dbName = config.LOCAL_DB_NAME || 'backoffice'; // 'headoffice' or 'backoffice'
		const backupFileName = `${dbName}-${new Date()
			.toISOString()
			.replace(/[-:T]/g, '')
			.slice(0, 15)}.sql`;

		const { filePath } = await dialog.showSaveDialog(mainWindow, {
			title: 'Save MySQL Backup',
			defaultPath: path.join(app.getPath('desktop'), backupFileName),
			filters: [{ name: 'SQL Files', extensions: ['sql'] }],
		});

		if (!filePath) {
			isUploading = false;
			mainWindow.setProgressBar(-1);
			return;
		}

		const mysqldumpPath =
			'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe';
		const dbUser = config.DB_USER || 'root';
		const dbPassword = config.DB_PASSWORD || '';
		const dumpArgs = [`-u${dbUser}`, `-p${dbPassword}`, dbName];

		logStatus(`[START BACKUP]: Running mysqldump to ${filePath}`);

		const dump = require('child_process').spawn(mysqldumpPath, dumpArgs);
		const writeStream = fs.createWriteStream(filePath);
		dump.stdout.pipe(writeStream);

		let errorMsg = '';
		dump.stderr.on('data', (data) => {
			errorMsg += data.toString();
		});

		dump.on('close', (code) => {
			isUploading = false;
			mainWindow.setProgressBar(-1);

			const filteredError = errorMsg.replace(
				/mysqldump: \[Warning\] Using a password on the command line interface can be insecure\.\s*/g,
				'',
			);

			if (code === 0 && !filteredError.trim()) {
				dialog.showMessageBoxSync(mainWindow, {
					type: 'info',
					title: 'Success',
					buttons: ['Close'],
					message: 'Database backup has been completed successfully.',
				});
				logStatus('[START BACKUP]: Upload Success!');
			} else {
				dialog.showMessageBoxSync(mainWindow, {
					type: 'error',
					title: 'Error',
					message:
						'An error occurred while backing up the database.\n' +
						filteredError,
				});
				logStatus(`[START BACKUP]: Upload Err: ${filteredError}`);
			}
		});
	}

	if (!isDev) {
		menuItems.push({
			label: 'Database',
			submenu: [
				{
					label: 'Backup Database',
					click: () => {
						handleBackup();
					},
				},
			],
		});
		menuItems.push({
			label: 'Options',
			submenu: [
				{
					label: 'Zoom In',
					accelerator: 'CmdOrCtrl+Plus',
					click() {
						const newZoomLevel = zoomLevel + ZOOM_CONFIG.STEP;
						if (newZoomLevel <= ZOOM_CONFIG.MAX) {
							updateZoom(newZoomLevel);
						}
					},
				},
				{
					label: 'Zoom Out',
					accelerator: 'CmdOrCtrl+-',
					click() {
						const newZoomLevel = zoomLevel - ZOOM_CONFIG.STEP;
						if (newZoomLevel >= ZOOM_CONFIG.MIN) {
							updateZoom(newZoomLevel);
						}
					},
				},
				{
					label: 'Reset Zoom',
					accelerator: 'CmdOrCtrl+0',
					click() {
						updateZoom(ZOOM_CONFIG.DEFAULT);
					},
				},
			],
		});
	}
	Menu.setApplicationMenu(Menu.buildFromTemplate(menuItems));
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
		headOfficeType: {
			type: 'number',
			default: 0,
		},
	};

	const store = new Store({ schema });

	ipcMain.handle('getStoreValue', (event, key) => {
		return store.get(key);
	});

	ipcMain.handle('setStoreValue', (event, { key, value, relaunch = false }) => {
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
let appType = null;
let headOfficeType = null;
function initServer(store) {
	if (!isDev) {
		logStatus('Server: Starting');

		appType = store.get('appType');
		headOfficeType = store.get('headOfficeType');

		// Set EJJY_APP_TYPE and ENV for Django child processes
		const djangoEnv = {
			...process.env,
			EJJY_APP_TYPE:
				appType === appTypes.HEAD_OFFICE
					? 'headoffice'
					: appType === appTypes.BACK_OFFICE
					? 'backoffice'
					: 'cashiering',
			ENV: 'prod',
		};

		spawn('python', ['manage.py', 'migrate'], {
			cwd: apiPath,
			detached: true,
			stdio: 'ignore',
			windowsHide: true,
			env: djangoEnv,
		});

		let apiPort = '0.0.0.0:8000';
		if (appType === appTypes.HEAD_OFFICE) {
			apiPort = '[::]:8001';
		}

		logStatus('Server: Starting API');

		const apiCommand = `manage.py runserver ${apiPort}`;
		spawnApi = spawn('python', apiCommand.split(' '), {
			cwd: apiPath,
			detached: true,
			stdio: 'ignore',
			windowsHide: true,
			env: djangoEnv,
		});
		logSpawn('API', spawnApi);

		logStatus('Server: Started API');

		if (appType === appTypes.HEAD_OFFICE && headOfficeType === 1) {
			logStatus('Server: Starting Tunneling');

			exec(
				'ngrok config add-authtoken 1n3K1Pcfqdy2WKRk60koXTY1ZrB_7QC7rqRsspNCkayebuRUN',
			);

			const startTunneling = () => {
				exec(
					'ngrok http --domain=headoffice.ngrok.app 8001',
					(error, stdout, stderr) => {
						if (error) return logStatus(`Tunneling error: ${error.message}`);
						if (stderr) return logStatus(`Tunneling stderr: ${stderr}`);
						logStatus(`Tunneling stdout: ${stdout}`);
					},
				);
			};

			startTunneling();
			setInterval(startTunneling, TUNNELING_INTERVAL_MS);
			logStatus('Server: Started Tunneling');
		}

		setTimeout(() => {
			spawn('python', ['manage.py', 'create_branch_product_balance'], {
				cwd: apiPath,
				detached: true,
				stdio: 'ignore',
				windowsHide: true,
				env: djangoEnv,
			});
		}, SPLASH_SCREEN_SHOWN_MS + 500);

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
	app.on('second-instance', () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});
	app.on('ready', createWindow);
}

//-------------------------------------------------------------------
// Check for updates (Windows only)
//-------------------------------------------------------------------
if (process.platform === 'win32') {
	autoUpdater.on('checking-for-update', () =>
		logStatus('Checking for update...'),
	);
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
				if (response === 0) autoUpdater.downloadUpdate();
			});
	});
	autoUpdater.on('update-not-available', () =>
		logStatus('Update not available'),
	);
	autoUpdater.on('error', (err) => logStatus('Error in auto-updater: ' + err));
	autoUpdater.on('download-progress', (progress) => {
		mainWindow.setProgressBar(Number(progress.percent) / 100);
		logStatus(
			`Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}% (${progress.transferred}/${progress.total})`,
		);
	});
	autoUpdater.on('update-downloaded', () => {
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
				if (response === 0) autoUpdater.quitAndInstall();
			});
	});
	app.on('ready', () => autoUpdater.checkForUpdates());
}

//-------------------------------------------------------------------
// Open folder storing the exported TXT files
//-------------------------------------------------------------------
ipcMain.on('openFolder', (event, folderPath) => {
	const mediaPath = isDev
		? path.resolve(__dirname, '../api/' + folderPath)
		: path.join(process.resourcesPath, 'api/' + folderPath);
	shell.openPath(mediaPath);
});

//-------------------------------------------------------------------
// Helper functions
//-------------------------------------------------------------------
function relaunchApp() {
	app.relaunch();
	app.exit();
}

function killSpawns() {
	if (spawnApi) kill(spawnApi.pid);
	if (spawnLocalhostRun) kill(spawnLocalhostRun.pid);
}

function logSpawn(key, spawn) {
	if (spawn) {
		if (spawn.stdout) {
			spawn.stdout.on('data', (data) => logStatus(`[Spawn] ${key}: ${data}`));
		}
		if (spawn.stderr) {
			spawn.stderr.on('data', (data) =>
				logStatus(`[Spawn] ${key} err: ${data}`),
			);
		}
	}
}
