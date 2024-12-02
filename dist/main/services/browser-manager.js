"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserManager = void 0;
// src/main/services/browser-manager.ts
const electron_1 = require("electron");
const path_1 = require("path");
class BrowserManager {
    constructor(mainWindow) {
        this.contentView = null;
        this.mainWindow = mainWindow;
        this.monitoringScript = this.loadMonitoringScript();
        // Set up the menu
        this.setupMenu();
        // Add resize handler
        this.mainWindow.on('resize', () => {
            this.updateContentViewBounds();
        });
    }
    setupMenu() {
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
        const isMac = process.platform === 'darwin';
        const template = [
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
                            var _a;
                            if ((_a = this.contentView) === null || _a === void 0 ? void 0 : _a.webContents) {
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
                        click: () => __awaiter(this, void 0, void 0, function* () {
                            const { shell } = require('electron');
                            yield shell.openExternal('https://electronjs.org');
                        })
                    }
                ]
            }
        ];
        const menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
    }
    setContentMenuState(newState) {
        var _a;
        const menuItem = (_a = electron_1.Menu.getApplicationMenu()) === null || _a === void 0 ? void 0 : _a.getMenuItemById('content-devtools');
        if (menuItem)
            menuItem.enabled = newState;
    }
    loadMonitoringScript() {
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
    cleanupContentView() {
        if (this.contentView) {
            this.setContentMenuState(false); // disable menu when contentView is not loaded
            this.mainWindow.contentView.removeChildView(this.contentView);
            this.contentView = null;
        }
    }
    createWebContents(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('createWebContents');
                this.cleanupContentView();
                const preloadPath = electron_1.app.isPackaged
                    ? (0, path_1.resolve)(__dirname, '../renderer/main_window/preload.js')
                    : (0, path_1.resolve)(__dirname, '../../.webpack/renderer/main_window/preload.js');
                console.log('Using preload path:', preloadPath);
                this.contentView = new electron_1.WebContentsView({
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true,
                        preload: preloadPath
                    }
                });
                this.mainWindow.contentView.addChildView(this.contentView);
                yield this.updateContentViewBounds();
                const sanitizedUrl = !url.startsWith('http') ? `https://${url}` : url;
                console.log('loadURL:', sanitizedUrl);
                this.setupWebContentsHandlers(this.contentView.webContents);
                yield this.contentView.webContents.loadURL(sanitizedUrl);
                this.setContentMenuState(true); // only enable menu item when contentView is loaded
                return { success: true, id: this.contentView.webContents.id };
            }
            catch (error) {
                console.error('Error creating web contents:', error);
                this.cleanupContentView();
                return { error: error.message };
            }
        });
    }
    updateContentViewBounds() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.contentView)
                return;
            const controlsHeight = yield this.mainWindow.webContents.executeJavaScript('document.getElementById("browser-controls").offsetHeight' // Changed from "session-controls"
            );
            const bounds = this.mainWindow.getBounds();
            this.contentView.setBounds({
                x: 0,
                y: controlsHeight + 20,
                width: bounds.width - 300,
                height: bounds.height - (controlsHeight + 20)
            });
        });
    }
    setupWebContentsHandlers(webContents) {
        console.log('setupWebContentsHandlers');
        webContents.setWindowOpenHandler(({ url }) => {
            webContents.loadURL(url);
            return { action: 'deny' };
        });
        webContents.on('did-navigate', (_event, url) => {
            console.log('did-navigate');
            this.mainWindow.webContents.send('page-navigated', url);
        });
        webContents.on('did-navigate-in-page', (_event, url) => {
            console.log('did-navigate-in-page');
            this.mainWindow.webContents.send('page-navigated', url);
        });
        webContents.on('did-start-loading', () => {
            console.log('did-start-loading');
        });
        webContents.on('did-finish-load', () => __awaiter(this, void 0, void 0, function* () {
            console.log('did-finish-load');
            yield webContents.executeJavaScript(this.monitoringScript)
                .catch(err => console.error('Error injecting monitoring script:', err));
            console.log('Monitoring script injected');
            const currentURL = webContents.getURL();
            console.log('Sending page navigation event for:', currentURL);
            this.mainWindow.webContents.send('page-navigated', currentURL);
        }));
        webContents.on('dom-ready', () => {
            console.log('DOM is ready');
        });
    }
    endSession() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.cleanupContentView();
                return { success: true };
            }
            catch (error) {
                console.error('Error ending session:', error);
                return { success: false };
            }
        });
    }
}
exports.BrowserManager = BrowserManager;
//# sourceMappingURL=browser-manager.js.map