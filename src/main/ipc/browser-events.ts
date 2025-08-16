// src/main/ipc/browser-events.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { BrowserManager } from '../services/browser-manager';
import { WebContentsResult } from '../../shared/types/ipc';
import { configStore } from '../services/store';

export function setupBrowserEvents(browserManager: BrowserManager): void {
  ipcMain.handle(
    'create-web-contents',
    async (_: IpcMainInvokeEvent, url: string): Promise<WebContentsResult> => {
      return browserManager.createWebContents(url);
    }
  );

  ipcMain.handle(
    'end-session',
    async (): Promise<{ success: boolean }> => {
      return browserManager.endSession();
    }
  );

  ipcMain.handle(
    'capture-screen',
    async (): Promise<{ success: boolean }> => {
      return browserManager.captureScreen();
    }
  );

  // API Key IPC Handlers
  ipcMain.handle('has-required-keys', () => {
    return configStore.hasRequiredKeys();
  });

  ipcMain.handle('get-api-keys', () => {
    return configStore.getAll();
  });

  ipcMain.handle('save-api-keys', (event, keys) => {
    Object.entries(keys).forEach(([key, value]) => {
      if (value) {
        configStore.set(key, value as string);
      }
    });
    return true;
  });

  ipcMain.handle('get-api-key', (event, keyName: string) => {
    return configStore.get(keyName as any);
  });

}
