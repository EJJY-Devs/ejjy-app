const {
	app,
	BrowserWindow,
	Menu,
	dialog,
	ipcMain,
	shell,
} = require('electron');
const kill = require('tree-kill');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const path = require('path');
const { spawn, exec } = require('child_process');
const Store = require('electron-store');
const fs = require('fs');

// Persistent store for the zoom level, initialized lazily in initZoomStore()
// (see below) once Electron has actually fired 'ready' -- app.getPath('userData')
// isn't guaranteed to resolve to the real, stable profile path before then, and
// constructing electron-store any earlier can silently point it at a fallback
// path on a slow cold boot, which looks like "the saved zoom level got reset".
let store;

// Persistent store for other app settings (appType, headOfficeType, startNgrok),
// created in initStore() -- also deferred until createWindow() runs post-'ready'.
let appStore;

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

let zoomLevel = ZOOM_CONFIG.DEFAULT; // real value loaded in initZoomStore()

// Creates the zoom-level store and loads the saved zoom level. Must only be
// called after Electron's 'ready' event (i.e. from createWindow()), so that
// app.getPath('userData') has resolved to the real, stable profile path.
function initZoomStore() {
	store = new Store({ name: 'zoom-settings', defaults: { zoomLevel: ZOOM_CONFIG.DEFAULT } });
	const savedZoom = store.get('zoomLevel', ZOOM_CONFIG.DEFAULT);
	zoomLevel = validateZoomLevel(savedZoom);
	log.info(`[ZOOM] Loaded zoomLevel=${zoomLevel} (raw=${savedZoom}) from ${store.path}`);
}

// Safe zoom update function
function updateZoom(newLevel) {
	const validatedLevel = validateZoomLevel(newLevel);
	zoomLevel = validatedLevel;
	if (mainWindow && !mainWindow.isDestroyed()) {
		mainWindow.webContents.setZoomFactor(zoomLevel);
		store.set('zoomLevel', zoomLevel);
		logStatus(`Zoom level set to: ${(zoomLevel * 100).toFixed(0)}%`);
	}
	// Keep the Options menu's "Zoom: X%" label in sync, whatever triggered
	// the change (menu click or the Ctrl+=/Ctrl+-/Ctrl+0 shortcuts below).
	rebuildAppMenu();
}

// Zoom in/out/reset, shared by the Options menu items and by the View menu's
// Zoom In/Zoom Out/Actual Size items (Ctrl+=/Ctrl+-/Ctrl+0), which
// rebuildAppMenu() rewires to call these instead of their default
// role-based (zoom-level) behavior -- see rebuildAppMenu() below.
function zoomIn() {
	const newZoomLevel = zoomLevel + ZOOM_CONFIG.STEP;
	if (newZoomLevel <= ZOOM_CONFIG.MAX) {
		updateZoom(newZoomLevel);
	}
}

function zoomOut() {
	const newZoomLevel = zoomLevel - ZOOM_CONFIG.STEP;
	if (newZoomLevel >= ZOOM_CONFIG.MIN) {
		updateZoom(newZoomLevel);
	}
}

function zoomReset() {
	updateZoom(ZOOM_CONFIG.DEFAULT);
}

const appTypes = {
	BACK_OFFICE: 'back_office',
	HEAD_OFFICE: 'head_office',
};

const apiPath = isDev
	? path.resolve(__dirname, '../api')
	: path.join(process.resourcesPath, 'api');

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

// Shared per-appType folder name under the OS user-data directory
// (%APPDATA% on Windows) -- a location electron-builder/NSIS never touches
// on install, update, or uninstall, unlike anything under resourcesPath.
function getAppDataDir(appType) {
	if (appType === appTypes.HEAD_OFFICE) {
		return 'EJJY-Inventory-Headoffice-App';
	}
	if (appType === appTypes.BACK_OFFICE) {
		return 'EJJY-Inventory-App';
	}
	return 'EJJY-Cashiering';
}

// Helper to get backend config path (unique file name)
function getBackendConfigPath(appType) {
	return path.join(
		app.getPath('appData'),
		getAppDataDir(appType),
		'backend-config.json',
	);
}

// Where the backend writes e-journal exports (invoices, X-read/Z-read
// reports, etc.) in production -- see EJJY_MEDIA_ROOT below and MEDIA_ROOT
// in api/backend/settings.py. Deliberately outside resourcesPath/apiPath so
// this data survives every future app update.
function getMediaRootPath(appType) {
	return path.join(app.getPath('appData'), getAppDataDir(appType), 'media');
}

function copyDirRecursiveSync(sourceDir, destDir) {
	fs.mkdirSync(destDir, { recursive: true });
	for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
		const sourcePath = path.join(sourceDir, entry.name);
		const destPath = path.join(destDir, entry.name);
		if (entry.isDirectory()) {
			copyDirRecursiveSync(sourcePath, destPath);
		} else {
			fs.copyFileSync(sourcePath, destPath);
		}
	}
}

// One-time migration for installs that already have exports sitting in the
// old, update-unsafe location (resources/api/media, from before this fix
// existed). Runs at most once: if the new location already has anything in
// it -- including a prior, possibly partial, migration -- it's left alone
// rather than re-copied over.
function migrateLegacyMediaIfNeeded(appType) {
	const legacyMediaPath = path.join(apiPath, 'media');
	const newMediaPath = getMediaRootPath(appType);

	try {
		const hasLegacyMedia =
			fs.existsSync(legacyMediaPath) &&
			fs.readdirSync(legacyMediaPath).length > 0;
		const hasNewMedia =
			fs.existsSync(newMediaPath) && fs.readdirSync(newMediaPath).length > 0;

		if (hasLegacyMedia && !hasNewMedia) {
			logStatus(
				`Migrating e-journal exports from ${legacyMediaPath} to ${newMediaPath}...`,
			);
			copyDirRecursiveSync(legacyMediaPath, newMediaPath);
			logStatus('E-journal export migration complete.');
		}
	} catch (e) {
		// Never let a migration hiccup block startup -- worst case the old
		// folder (still untouched, since this only ever copies, never
		// deletes) can be migrated by hand later.
		logStatus(`E-journal export migration skipped: ${e.message}`);
	}
}

function getDefaultBackendConfig(appType) {
	const localDbName =
		appType === appTypes.BACK_OFFICE
			? 'backoffice'
			: appType === appTypes.HEAD_OFFICE
			? 'headoffice'
			: 'cashiering';

	return {
		SECRET_KEY: '@26!xtf&^xr@p$$x%7zwj9j-k)(k7-!0z_@_-sc!t13js1pwum',
		DEBUG: false,
		STATUS: 'online',
		IS_ONLINE_WEB_SERVER: false,
		ONLINE_API_URL: 'http://localhost:8002/v1',
		DB_NAME: '',
		DB_USER: '',
		DB_PASSWORD: '',
		DB_HOST: '127.0.0.1',
		DB_PORT: 3306,
		LOCAL_DB_NAME: localDbName,
	};
}

function readBackendConfig(configPath) {
	try {
		return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	} catch (e) {
		return null;
	}
}

function writeBackendConfig(configPath, config) {
	const configDir = path.dirname(configPath);
	if (!fs.existsSync(configDir)) {
		fs.mkdirSync(configDir, { recursive: true });
	}

	fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function ensureBackendConfig(appType) {
	const safeAppType = appType || appTypes.BACK_OFFICE;
	const configPath = getBackendConfigPath(safeAppType);
	const defaults = getDefaultBackendConfig(safeAppType);
	const existingConfig = readBackendConfig(configPath);

	if (!existingConfig) {
		writeBackendConfig(configPath, defaults);
		logStatus(`Created backend-config.json: ${configPath}`);
		return defaults;
	}

	const mergedConfig = { ...defaults, ...existingConfig };
	delete mergedConfig.BRANCH_SERVER_URL;
	if (JSON.stringify(mergedConfig) !== JSON.stringify(existingConfig)) {
		writeBackendConfig(configPath, mergedConfig);
	}

	return mergedConfig;
}

function updateBackendConfig(appType, updates = {}) {
	const safeAppType = appType || appTypes.BACK_OFFICE;
	const configPath = getBackendConfigPath(safeAppType);
	const currentConfig = ensureBackendConfig(safeAppType);
	const mergedConfig = {
		...currentConfig,
		ONLINE_API_URL:
			typeof updates.ONLINE_API_URL === 'string'
				? updates.ONLINE_API_URL
				: currentConfig.ONLINE_API_URL,
	};
	delete mergedConfig.BRANCH_SERVER_URL;

	writeBackendConfig(configPath, mergedConfig);
	return mergedConfig;
}

function isBackendConfigSetupRequired(appType) {
	const config = ensureBackendConfig(appType);
	return !config.ONLINE_API_URL;
}

// --- Backup Handler ---
async function handleBackup() {
	mainWindow.setProgressBar(1);

	// Read config to get app type and DB name
	const appType = appStore.get('appType');
	const config = ensureBackendConfig(appType);

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

// The OS-default menu items, captured once (in createWindow, before we ever
// append our own Options/Database submenus) so rebuildAppMenu() can rebuild
// from a clean base each time instead of re-appending onto its own output.
let baseMenuItems;

// (Re)builds the full application menu from baseMenuItems plus our Options
// (zoom) and, outside dev, Database submenus. Called once at startup and
// again from updateZoom() so the "Zoom: X%" label always reflects the
// current zoomLevel, however it was changed.
function rebuildAppMenu() {
	if (!baseMenuItems) return;

	// Electron's default "View" menu ships its own Zoom In / Zoom Out /
	// Actual Size items (role: 'zoomIn'/'zoomOut'/'resetZoom', bound to
	// Ctrl+=/Ctrl+-/Ctrl+0 by default). Those roles change Chromium's zoom
	// *level* directly, completely bypassing our zoomLevel tracking/
	// persistence/clamping -- which is exactly what caused zoom to look like
	// it "reset" after switching tabs: the user zooms via View's native role,
	// our zoomLevel variable never learns about it, then the next
	// did-navigate*/did-finish-load handler reapplies our own (stale)
	// zoomLevel over top of it. Rewire those three items to go through our
	// own zoomIn/zoomOut/zoomReset instead, keeping their original labels,
	// accelerators, and position so the View menu still owns the keyboard
	// shortcuts (avoids also binding them on the Options items below, which
	// would double-apply on every keypress).
	const menuItems = baseMenuItems.map((item) => {
		if (item.label !== 'View' || !item.submenu) return item;

		const submenu = item.submenu.items.map((subItem) => {
			const role = subItem.role && subItem.role.toLowerCase();
			if (role === 'zoomin' || role === 'zoomout' || role === 'resetzoom') {
				return {
					label: subItem.label,
					accelerator: subItem.accelerator,
					click:
						role === 'zoomin' ? zoomIn : role === 'zoomout' ? zoomOut : zoomReset,
				};
			}
			return subItem;
		});

		return { label: item.label, submenu };
	});

	menuItems.push({
		label: 'Options',
		submenu: [
			{
				label: `Zoom: ${Math.round(zoomLevel * 100)}%`,
				enabled: false,
			},
			{ type: 'separator' },
			{
				label: 'Zoom In',
				click: zoomIn,
			},
			{
				label: 'Zoom Out',
				click: zoomOut,
			},
			{
				label: 'Reset Zoom',
				click: zoomReset,
			},
		],
	});

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
	}

	Menu.setApplicationMenu(Menu.buildFromTemplate(menuItems));
}

function createWindow() {
	// Must run first: constructs the zoom-level store now that 'ready' has
	// fired, and sets the real (persisted) zoomLevel used just below.
	initZoomStore();

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
			zoomFactor: zoomLevel,
		},
	});

	// Lock Chromium's pinch-to-zoom so zoom only changes through our menu actions.
	// NOTE: Do NOT call setLayoutZoomLevelLimits(0, 0) here — it locks the layout
	// zoom level to 0 (factor 1.0), which causes setZoomFactor() values to be
	// reverted on every in-page navigation (e.g. React Router tab switches).
	try {
		if (typeof mainWindow.webContents.setVisualZoomLevelLimits === 'function') {
			mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
		}
	} catch (e) {
		// Best-effort only; different Electron versions expose different APIs.
		logStatus(`Zoom lock not applied: ${e?.message || e}`);
	}

	const allowedLinks = ['blob:', 'https://gamy-mayonnaise-e86.notion.site'];
	mainWindow.webContents.setWindowOpenHandler(({ url }) => ({
		action: allowedLinks.some((link) => url.startsWith(link))
			? 'allow'
			: 'deny',
	}));

	// Let the user pick where each PDF/TXT export (triggered via <a download> +
	// blob URLs) gets saved, via the native "Save As" dialog, instead of
	// silently dropping it in the Downloads folder.
	mainWindow.webContents.session.on('will-download', (event, item) => {
		const suggestedName = item.getFilename();
		const ext = path.extname(suggestedName).replace('.', '');

		const filePath = dialog.showSaveDialogSync(mainWindow, {
			title: 'Save File',
			defaultPath: path.join(app.getPath('downloads'), suggestedName),
			filters: ext
				? [{ name: `${ext.toUpperCase()} Files`, extensions: [ext] }]
				: undefined,
		});

		if (!filePath) {
			item.cancel();
			logStatus(`Download cancelled: ${suggestedName}`);
			mainWindow.webContents.send('download-status', {
				status: 'cancelled',
				fileName: suggestedName,
			});
			return;
		}

		item.setSavePath(filePath);

		item.once('done', (doneEvent, state) => {
			if (state === 'completed') {
				logStatus(`Download saved: ${filePath}`);
				mainWindow.webContents.send('download-status', {
					status: 'completed',
					fileName: path.basename(filePath),
				});
			} else {
				logStatus(`Download ${state}: ${suggestedName}`);
				mainWindow.webContents.send('download-status', {
					status: 'failed',
					fileName: suggestedName,
				});
			}
		});
	});

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

	// Re-apply zoom after any navigation event so that in-page navigations
	// (e.g. React Router's history.replace on tab switches) don't reset zoom.
	mainWindow.webContents.on('did-navigate', () => {
		mainWindow.webContents.setZoomFactor(zoomLevel);
	});
	mainWindow.webContents.on('did-navigate-in-page', () => {
		mainWindow.webContents.setZoomFactor(zoomLevel);
	});
	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.webContents.setZoomFactor(zoomLevel);
	});

	// Block accidental zoom via OS/trackpad pinch gestures and Ctrl+wheel --
	// their fractional, uncontrolled deltas would drift from our
	// ZOOM_CONFIG.STEP-based levels. Deliberate zoom still works via the View
	// menu's Zoom In/Out/Actual Size items (Ctrl+=/Ctrl+-/Ctrl+0), which
	// rebuildAppMenu() rewires to our own zoomIn/zoomOut/zoomReset below, and
	// via the Options menu.
	mainWindow.webContents.on('before-input-event', (event, input) => {
		const isCtrlWheelZoom = input.control && input.type === 'mouseWheel';
		const isGestureZoom =
			typeof input.type === 'string' &&
			(input.type.toLowerCase().includes('pinch') ||
				input.type.toLowerCase().includes('zoom'));

		if (isCtrlWheelZoom || isGestureZoom) {
			event.preventDefault();
		}
	});

	mainWindow.on('closed', () => {
		splashWindow = null;
		mainWindow = null;
	});

	// Initialize Store
	initStore();
	ensureBackendConfig(appStore.get('appType'));

	// Migrate and Run API
	startServer();

	// Set Menu
	baseMenuItems = Menu.getApplicationMenu().items;
	rebuildAppMenu();
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
		startNgrok: {
			type: 'boolean',
			default: false,
		},
	};

	appStore = new Store({ schema });
	const store = appStore;

	ipcMain.handle('getStoreValue', (event, key) => {
		return store.get(key);
	});

	ipcMain.handle('setStoreValue', (event, { key, value, relaunch = false }) => {
		store.set(key, value);
		if (relaunch) {
			relaunchApp();
		}
	});

	ipcMain.handle('getBackendConfig', (event, requestedAppType) => {
		const selectedAppType = requestedAppType || store.get('appType');
		return ensureBackendConfig(selectedAppType);
	});

	ipcMain.handle(
		'setBackendConfig',
		(event, { appType: requestedAppType, config = {} }) => {
			const selectedAppType = requestedAppType || store.get('appType');
			return updateBackendConfig(selectedAppType, config);
		},
	);

	ipcMain.handle('isBackendConfigSetupRequired', (event, requestedAppType) => {
		const selectedAppType = requestedAppType || store.get('appType');
		return isBackendConfigSetupRequired(selectedAppType);
	});

	return store;
}
//-------------------------------------------------------------------
// Server
//-------------------------------------------------------------------
// Delay before reconnecting after ngrok exits, so ngrok's cloud-side
// session from the previous run has time to fully release before we try
// to reclaim the reserved domain.
const NGROK_RESPAWN_DELAY_MS = 5_000;
// ngrok is NOT bundled with the app. The user must install ngrok themselves
// and ensure it is available on the system PATH; we just invoke `ngrok`.
const ngrokBinPath = 'ngrok';

let spawnRun = null;
let ngrokProcess = null;
// True while ngrok is supposed to be running on this instance. Guards the
// respawn-on-exit handler below so an intentional shutdown (killNgrok())
// doesn't get treated as a crash and immediately restarted.
let ngrokShouldRun = false;
function killNgrok() {
	ngrokShouldRun = false;
	if (ngrokProcess && ngrokProcess.pid) {
		kill(ngrokProcess.pid);
		ngrokProcess = null;
	}
}
function startServer() {
	if (!isDev) {
		const selectedAppType = appStore.get('appType');
		const headOfficeType = appStore.get('headOfficeType');
		const shouldStartNgrok = appStore.get('startNgrok');
		const backendConfigPath = getBackendConfigPath(selectedAppType);
		ensureBackendConfig(selectedAppType);
		const mediaRootPath = getMediaRootPath(selectedAppType);
		migrateLegacyMediaIfNeeded(selectedAppType);
		const spawnEnv = {
			...process.env,
			EJJY_APP_TYPE:
				selectedAppType === appTypes.HEAD_OFFICE
					? 'headoffice'
					: selectedAppType === appTypes.BACK_OFFICE
					? 'backoffice'
					: 'cashiering',
			EJJY_CONFIG_PATH: backendConfigPath,
			EJJY_MEDIA_ROOT: mediaRootPath,
		};

		spawn('python', ['manage.py', 'migrate'], {
			cwd: apiPath,
			env: spawnEnv,
			windowsHide: true,
			detached: false,
			stdio: 'ignore',
		});
		const apiPort =
			selectedAppType === appTypes.HEAD_OFFICE
				? '0.0.0.0:8001'
				: selectedAppType === appTypes.BACK_OFFICE
				? '0.0.0.0:8000'
				: '0.0.0.0:8005';
		spawnRun = spawn('python', ['manage.py', 'runserver', apiPort], {
			cwd: apiPath,
			env: spawnEnv,
			windowsHide: true,
			detached: false,
			stdio: 'ignore',
		});
		setTimeout(() => {
			spawn('python', ['manage.py', 'create_branch_product_balance'], {
				cwd: apiPath,
				env: spawnEnv,
				windowsHide: true,
				detached: false,
				stdio: 'ignore',
			});
		}, SPLASH_SCREEN_SHOWN_MS + 500);
		logStatus('API: Started');

		if (selectedAppType === appTypes.HEAD_OFFICE && shouldStartNgrok) {
			logStatus('Ngrok: Starting');

			exec(
				`${ngrokBinPath} config add-authtoken 1n3K1Pcfqdy2WKRk60koXTY1ZrB_7QC7rqRsspNCkayebuRUN`,
				(error) => {
					if (error) {
						logStatus(
							`Ngrok error: ${error.message}. Is ngrok installed and on PATH?`,
						);
					}
				},
			);

			const startNgrok = () => {
				ngrokShouldRun = true;

				ngrokProcess = exec(
					`${ngrokBinPath} http --domain=headoffice.ngrok.app 8001`,
					(error, stdout, stderr) => {
						if (error) {
							logStatus(
								`Ngrok error: ${error.message}. Is ngrok installed and on PATH?`,
							);
							return;
						}
						if (stderr) {
							logStatus(`Ngrok stderr: ${stderr}`);
							return;
						}
						logStatus(`Ngrok stdout: ${stdout}`);
					},
				);

				if (!ngrokProcess) {
					logStatus('Ngrok: Failed to start process');
					return;
				}

				ngrokProcess.stdout.on('data', (data) => {
					logStatus(`Ngrok stdout: ${data}`);
				});
				ngrokProcess.stderr.on('data', (data) => {
					logStatus(`Ngrok stderr: ${data}`);
				});
				ngrokProcess.on('error', (error) => {
					logStatus(`Ngrok error: ${error.message}`);
				});
				// Only reconnect when the process actually dies, never on a
				// fixed timer. Preemptively killing a healthy tunnel just to
				// "refresh" it races ngrok's cloud-side session teardown against
				// the immediate reconnect attempt: if the old session hasn't
				// been released yet, the new one fails to reclaim the reserved
				// domain and the tunnel stays down. A short delay here gives
				// the old session time to fully release before we retry.
				ngrokProcess.on('exit', () => {
					ngrokProcess = null;
					if (ngrokShouldRun) {
						logStatus(
							`Ngrok: Process exited, reconnecting in ${NGROK_RESPAWN_DELAY_MS / 1000}s`,
						);
						setTimeout(startNgrok, NGROK_RESPAWN_DELAY_MS);
					}
				});
			};

			startNgrok();

			logStatus('Ngrok: Started');
		} else if (selectedAppType === appTypes.HEAD_OFFICE) {
			// "Start Ngrok on Launch" is off on this instance. Clear out any
			// ngrok.exe left running from an earlier launch where it was
			// enabled, so it doesn't keep holding/contending for the tunnel
			// session in the background.
			const killStrayNgrokCmd =
				process.platform === 'win32'
					? 'taskkill /IM ngrok.exe /F'
					: "pkill -f 'ngrok http'";
			exec(killStrayNgrokCmd, () => {});
		}

		mainWindow.once('closed', () => {
			if (spawnRun) kill(Number(spawnRun.pid));
			killNgrok();
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
// Open folder storing the exported TXT files
//-------------------------------------------------------------------
ipcMain.on('openFolder', (event, folderPath) => {
	// 'media' is the one folder this channel is ever asked to open (see
	// EJOURNAL_FOLDER), and in production it now lives outside apiPath --
	// see getMediaRootPath's doc comment for why.
	const mediaPath = isDev
		? path.resolve(__dirname, '../api/' + folderPath)
		: folderPath === 'media'
			? getMediaRootPath(appStore.get('appType'))
			: path.join(apiPath, folderPath);
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
	if (spawnRun && spawnRun.pid) kill(Number(spawnRun.pid));
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
