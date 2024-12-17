// src/main/index.ts
import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { BrowserManager } from './services/browser-manager';
import { setupBrowserEvents } from './ipc/browser-events';
import { setupMonitoringEvents } from './ipc/monitoring';

let mainWindow: BrowserWindow | null = null;
let browserManager: BrowserManager | null = null;

async function createWindow(): Promise<void> {
  // Add debug logging
  console.log('Creating window...');
  console.log('MAIN_WINDOW_WEBPACK_ENTRY:', MAIN_WINDOW_WEBPACK_ENTRY);
  console.log('MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY:', MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    enableLargerThanScreen: true,
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
    browserManager = new BrowserManager(mainWindow);
    setupBrowserEvents(browserManager);
    setupMonitoringEvents(mainWindow);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    browserManager = null;
  });

}

// Handle app lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
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

app.setAboutPanelOptions({
  applicationName: 'PayPal Inspector',
  applicationVersion: '0.1.0',
  copyright: 'Copyright (c) 2024',
  version: 'Proof of Concept',
  credits: 'From an idea by Mark Lummus. Electron version suggested by Paul Sprague. Claude did most of the thinking, and Mark did all of the typing and debugging.',
  authors: ['Mark Lummus, Claude Sonnet, Claude Haiku'],

});