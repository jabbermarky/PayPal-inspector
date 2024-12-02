"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/main/index.ts
const electron_1 = require("electron");
const browser_manager_1 = require("./services/browser-manager");
const browser_events_1 = require("./ipc/browser-events");
const monitoring_1 = require("./ipc/monitoring");
let mainWindow = null;
let browserManager = null;
function createWindow() {
    // Add debug logging
    console.log('Creating window...');
    console.log('MAIN_WINDOW_WEBPACK_ENTRY:', MAIN_WINDOW_WEBPACK_ENTRY);
    console.log('MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY:', MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY);
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
        }
    });
    if (MAIN_WINDOW_WEBPACK_ENTRY) {
        console.log('Loading main window URL...');
        mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    }
    // Initialize services
    if (mainWindow) {
        browserManager = new browser_manager_1.BrowserManager(mainWindow);
        (0, browser_events_1.setupBrowserEvents)(browserManager);
        (0, monitoring_1.setupMonitoringEvents)(mainWindow);
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
        browserManager = null;
    });
}
// Handle app lifecycle
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// Add global error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});
electron_1.app.setAboutPanelOptions({
    applicationName: 'PayPal Inspector',
    applicationVersion: '0.1.0',
    copyright: 'Copyright (c) 2024',
    version: 'Proof of Concept',
    credits: 'From an idea by Mark Lummus. Electron version suggested by Paul Sprague. Claude did most of the thinking, and Mark did all of the typing and debugging.',
    authors: ['Mark Lummus, Claude Sonnet, Claude Haiku'],
});
//# sourceMappingURL=index.js.map