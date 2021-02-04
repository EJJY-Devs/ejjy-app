const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
	});
	const startURL = `file://${path.join(__dirname, '../build/index.html')}`;
	mainWindow.loadURL(startURL);

	mainWindow.once('ready-to-show', () => {
		mainWindow.maximize();
		mainWindow.show();
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}
app.on('ready', createWindow);
