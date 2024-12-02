"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/preload/monitoring-bridge.ts
const electron_1 = require("electron");
console.log('Monitoring bridge preload starting...');
try {
    electron_1.contextBridge.exposeInMainWorld('monitorAPI', {
        sendMetrics: (data) => {
            try {
                console.log('Sending metrics:', data);
                const safeData = JSON.parse(JSON.stringify(data));
                return electron_1.ipcRenderer.send('page-metrics', safeData);
            }
            catch (error) {
                console.error('Error sending metrics:', error);
            }
        }
    });
    console.log('Monitoring bridge preload completed successfully');
}
catch (error) {
    console.error('Error in monitoring bridge preload:', error);
}
//# sourceMappingURL=monitoring-bridge.js.map