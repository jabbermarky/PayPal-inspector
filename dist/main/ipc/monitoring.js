"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMonitoringEvents = void 0;
// src/main/ipc/monitoring.ts
const electron_1 = require("electron");
function setupMonitoringEvents(mainWindow) {
    electron_1.ipcMain.on('page-metrics', (_, data) => {
        try {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('page-metrics', data);
            }
        }
        catch (error) {
            console.error('Error handling page metrics:', error);
        }
    });
}
exports.setupMonitoringEvents = setupMonitoringEvents;
//# sourceMappingURL=monitoring.js.map