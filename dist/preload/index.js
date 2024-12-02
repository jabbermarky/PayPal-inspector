"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/preload/index.ts
const electron_1 = require("electron");
console.log('Preload script starting...');
function sanitizeMetricsData(data) {
    // Base properties that all metrics share
    const safeData = {
        type: String(data.type),
        url: String(data.url),
        timestamp: String(data.timestamp)
    };
    // Add type-specific properties
    if (data.type === 'xhr') {
        safeData.method = String(data.method);
        safeData.status = Number(data.status);
        safeData.duration = Number(data.duration);
        if (data.requestHeaders) {
            safeData.requestHeaders = Object.fromEntries(Object.entries(data.requestHeaders).map(([k, v]) => [String(k), String(v)]));
        }
        if (data.requestData) {
            safeData.requestData = String(data.requestData).substring(0, 1000);
        }
    }
    else if (data.type === 'resource') {
        safeData.resourceType = String(data.resourceType);
    }
    return safeData;
}
try {
    // Expose electronAPI for the main window
    electron_1.contextBridge.exposeInMainWorld('electronAPI', {
        createWebContents: (url) => electron_1.ipcRenderer.invoke('create-web-contents', url),
        endSession: () => electron_1.ipcRenderer.invoke('end-session'),
        onPageMetrics: (callback) => electron_1.ipcRenderer.on('page-metrics', (_event, data) => callback(data)),
        onPageNavigated: (callback) => electron_1.ipcRenderer.on('page-navigated', (_event, url) => callback(url))
    });
    // Expose monitorAPI for the web contents
    electron_1.contextBridge.exposeInMainWorld('monitorAPI', {
        sendMetrics: (data) => {
            try {
                const safeData = sanitizeMetricsData(data);
                electron_1.ipcRenderer.send('page-metrics', safeData);
            }
            catch (error) {
                console.error('Error sending metrics:', error);
            }
        }
    });
    console.log('Preload script completed successfully');
}
catch (error) {
    console.error('Error in preload script:', error);
}
//# sourceMappingURL=index.js.map