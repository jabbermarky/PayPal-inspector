// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script starting...');

interface SafeMetricsData {
  type: string;
  url: string;
  timestamp: string;
  method?: string;
  status?: number;
  duration?: number;
  requestHeaders?: Record<string, string>;
  requestData?: string;
  resourceType?: string;
}

function sanitizeMetricsData(data: any): SafeMetricsData {
  // Base properties that all metrics share
  const safeData: SafeMetricsData = {
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
      safeData.requestHeaders = Object.fromEntries(
        Object.entries(data.requestHeaders).map(([k, v]) => [String(k), String(v)])
      );
    }

    if (data.requestData) {
      safeData.requestData = String(data.requestData).substring(0, 1000);
    }
  } else if (data.type === 'resource') {
    safeData.resourceType = String(data.resourceType);
  }

  return safeData;
}

try {
  // Expose electronAPI for the main window
  contextBridge.exposeInMainWorld('electronAPI', {
    createWebContents: (url: string) => ipcRenderer.invoke('create-web-contents', url),
    endSession: () => ipcRenderer.invoke('end-session'),
    onPageMetrics: (callback: (data: any) => void) => 
      ipcRenderer.on('page-metrics', (_event:any, data:any) => callback(data)),
    onPageNavigated: (callback: (url: string) => void) => 
      ipcRenderer.on('page-navigated', (_event:any, url:any) => callback(url))
  });

  // Expose monitorAPI for the web contents
  contextBridge.exposeInMainWorld('monitorAPI', {
    sendMetrics: (data: any) => {
      try {
        const safeData = sanitizeMetricsData(data);
        ipcRenderer.send('page-metrics', safeData);
      } catch (error) {
        console.error('Error sending metrics:', error);
      }
    }
  });

  console.log('Preload script completed successfully');
} catch (error) {
  console.error('Error in preload script:', error);
}