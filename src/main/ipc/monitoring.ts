// src/main/ipc/monitoring.ts
import { ipcMain, BrowserWindow } from 'electron';
import { XHRRequest, ResourceEntry } from '../../shared/types/session';

export function setupMonitoringEvents(mainWindow: BrowserWindow): void {
  ipcMain.on('page-metrics', (_, data: XHRRequest | ResourceEntry) => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('page-metrics', data);
      }
    } catch (error) {
      console.error('Error handling page metrics:', error);
    }
  });
}
