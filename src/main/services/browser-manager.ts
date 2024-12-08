// src/main/services/browser-manager.ts
import { app, BrowserWindow, WebContentsView, WebContents, Menu, MenuItem } from "electron";
import type { Event } from 'electron';
import { join, resolve } from 'path';
import { WebContentsResult } from '../../shared/types/ipc'; // ../../shared/types/ipc

export class BrowserManager {
  private mainWindow: BrowserWindow;
  private contentView: WebContentsView | null = null;
  private monitoringScript: string;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.monitoringScript = this.loadMonitoringScript();

    // Set up the menu
    this.setupMenu();

    // Add resize handler
    this.mainWindow.on('resize', () => {
      this.updateContentViewBounds();
    });
  }

  private setupMenu(): void {
    // const template: Electron.MenuItemConstructorOptions[] = [
    //   {
    //     label: 'View',
    //     submenu: [
    //       {
    //         label: 'Toggle App DevTools',
    //         //accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Alt+Ctrl+I',
    //         click: () => {
    //           if (this.mainWindow?.webContents) {
    //             this.mainWindow.webContents.toggleDevTools();
    //           }
    //         }
    //       },
    //       {
    //         label: 'Toggle Content DevTools',
    //         //accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Alt+Ctrl+I',
    //         click: () => {
    //           if (this.contentView?.webContents) {
    //             this.contentView.webContents.toggleDevTools();
    //           }
    //         }
    //       }
    //     ]
    //   }
    // ];

    const isMac = process.platform === 'darwin'

    const template: Electron.MenuItemConstructorOptions[] = [
      { role: 'appMenu' },
      { role: 'fileMenu' },
      { role: 'editMenu' },
      // { role: 'viewMenu' }
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          {
            label: 'Toggle Content DevTools',
            id: 'content-devtools',
            enabled: false,
            click: () => {
              if (this.contentView?.webContents) {
                this.contentView.webContents.toggleDevTools();
              }
            }
          },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      { role: 'windowMenu' },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              const { shell } = require('electron')
              await shell.openExternal('https://electronjs.org')
            }
          }
        ]
      }
    ]

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
  private setContentMenuState(newState: boolean) {
    const menuItem: MenuItem | null | undefined = Menu.getApplicationMenu()?.getMenuItemById('content-devtools');
    if (menuItem) menuItem.enabled = newState;
  }
  private loadMonitoringScript(): string {
    return `
      if (!window.__monitoringActive) {
        window.__monitoringActive = true;
        
        // XHR Monitoring
        const originalXHR = window.XMLHttpRequest.prototype.open;
        const originalSend = window.XMLHttpRequest.prototype.send;
  
        window.XMLHttpRequest.prototype.open = function(method, url) {
          this._method = method;
          this._url = url;
          this._requestHeaders = {};
          
          const originalSetRequestHeader = this.setRequestHeader;
          this.setRequestHeader = function(name, value) {
            this._requestHeaders[name] = value;
            return originalSetRequestHeader.apply(this, arguments);
          };
  
          return originalXHR.apply(this, arguments);
        };
  
        window.XMLHttpRequest.prototype.send = function(data) {
          const startTime = performance.now();
          let requestData = null;
  
          if (this._method === 'POST' && data) {
            try {
              requestData = String(data).substring(0, 1000);
            } catch (e) {}
          }
  
          this.addEventListener('load', () => {
            try {
              let responseData = null;
              try {
                // Only capture response for JSON or text content types
                const contentType = this.getResponseHeader('content-type');
                if (contentType && 
                    (contentType.includes('application/json') || 
                     contentType.includes('text/'))) {
                  responseData = String(this.responseText).substring(0, 1000);
                }
              } catch (e) {}
  
              const metrics = {
                type: 'xhr',
                url: String(this._url),
                method: String(this._method),
                status: Number(this.status),
                timestamp: new Date().toISOString(),
                duration: Math.round(performance.now() - startTime),
                requestHeaders: this._requestHeaders,
                requestData: requestData,
                responseData: responseData
              };
  
              if (window.monitorAPI) {
                window.monitorAPI.sendMetrics(metrics);
              }
            } catch (error) {
              console.error('Error in XHR monitoring:', error);
            }
          }, { once: true });
  
          return originalSend.apply(this, arguments);
        };

        // Resource Monitoring
        try {
          function checkAndSendResource(entry) {
            if (entry.initiatorType === 'script' || entry.initiatorType === 'img') {
              window.monitorAPI?.sendMetrics({
                type: 'resource',
                resourceType: entry.initiatorType,
                url: entry.name,
                timestamp: new Date().toISOString()
              });
            }
          }

          // Monitor existing resources
          performance.getEntriesByType('resource').forEach(checkAndSendResource);

          // Monitor new resources
          const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(checkAndSendResource);
          });

          observer.observe({ entryTypes: ['resource'] });

        } catch (error) {
          console.error('Error setting up resource monitoring:', error);
        }

        console.log('Monitoring script installed successfully');
      }
    `;
  }

  private cleanupContentView(): void {
    if (this.contentView) {
      this.setContentMenuState(false); // disable menu when contentView is not loaded
      this.mainWindow.contentView.removeChildView(this.contentView);
      this.contentView = null;
    }
  }


  async createWebContents(url: string): Promise<WebContentsResult> {
    try {
      console.log('createWebContents');

      this.cleanupContentView();

      const preloadPath = app.isPackaged
        ? resolve(__dirname, '../renderer/main_window/preload.js')
        : resolve(__dirname, '../../.webpack/renderer/main_window/preload.js');

      console.log('Using preload path:', preloadPath);

      this.contentView = new WebContentsView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: preloadPath
        }
      });

      this.mainWindow.contentView.addChildView(this.contentView);
      await this.updateContentViewBounds();

      const sanitizedUrl = !url.startsWith('http') ? `https://${url}` : url;
      console.log('loadURL:', sanitizedUrl);

      this.setupWebContentsHandlers(this.contentView.webContents);

      await this.contentView.webContents.loadURL(sanitizedUrl);
      this.setContentMenuState(true); // only enable menu item when contentView is loaded
      return { success: true, id: this.contentView.webContents.id };
    } catch (error) {
      console.error('Error creating web contents:', error);
      this.cleanupContentView();
      return { error: (error as Error).message };
    }
  }

  private async updateContentViewBounds(): Promise<void> {
    if (!this.contentView) return;

    const controlsHeight = await this.mainWindow.webContents.executeJavaScript(
      'document.getElementById("browser-controls").offsetHeight'  // Changed from "session-controls"
    );

    const bounds = this.mainWindow.getBounds();
    this.contentView.setBounds({
      x: 0,
      y: controlsHeight + 20,
      width: bounds.width - 300,
      height: bounds.height - (controlsHeight + 20)
    });
  }

  private setupWebContentsHandlers(webContents: WebContents): void {
    console.log('setupWebContentsHandlers');
    webContents.setWindowOpenHandler(({ url }) => {
      webContents.loadURL(url);
      return { action: 'deny' as const };
    });

    webContents.on('did-navigate', (_event: Event, url: string) => {
      console.log('did-navigate');
      this.mainWindow.webContents.send('page-navigated', url);
    });

    webContents.on('did-navigate-in-page', (_event: Event, url: string) => {
      console.log('did-navigate-in-page');
      this.mainWindow.webContents.send('page-navigated', url);
    });

    webContents.on('did-start-loading', () => {
      console.log('did-start-loading');
    });

    webContents.on('did-finish-load', async () => {
      console.log('did-finish-load');
      await webContents.executeJavaScript(this.monitoringScript)
        .catch(err => console.error('Error injecting monitoring script:', err));
      console.log('Monitoring script injected');
      const currentURL = webContents.getURL();
      console.log('Sending page navigation event for:', currentURL);
      this.mainWindow.webContents.send('page-navigated', currentURL);
    });

    webContents.on('dom-ready', () => {
      console.log('DOM is ready');
    });
  }

  async endSession(): Promise<{ success: boolean }> {
    try {
      this.cleanupContentView();
      return { success: true };
    } catch (error) {
      console.error('Error ending session:', error);
      return { success: false };
    }
  }


}