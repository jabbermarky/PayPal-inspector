// src/main/ipc/browser-events.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { BrowserManager } from '../services/browser-manager';
import { WebContentsResult } from '../../shared/types/ipc';

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
}
