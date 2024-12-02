// src/preload/monitoring-bridge.ts
import { contextBridge, ipcRenderer } from 'electron';

console.log('Monitoring bridge preload starting...');

try {
  contextBridge.exposeInMainWorld('monitorAPI', {
    sendMetrics: (data: any) => {
      try {
        console.log('Sending metrics:', data);
        const safeData = JSON.parse(JSON.stringify(data));
        return ipcRenderer.send('page-metrics', safeData);
      } catch (error) {
        console.error('Error sending metrics:', error);
      }
    }
  });
  
  console.log('Monitoring bridge preload completed successfully');
} catch (error) {
  console.error('Error in monitoring bridge preload:', error);
}