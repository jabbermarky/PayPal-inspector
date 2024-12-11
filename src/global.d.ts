// src/global.d.ts
export {};

declare global {
  interface Window {
    monitorAPI: {
      sendMetrics: (data: {
        type: string;
        url: string;
        method?: string;
        status?: number;
        timestamp: string;
        duration?: number;
        requestHeaders?: Record<string, string>;
        requestData?: string;
        responseData?: string;  // Added this property
        resourceType?: string;
      }) => void;
    };
    electronAPI: {
      createWebContents: (url: string) => Promise<{
        success?: boolean;
        error?: string;
        id?: number;
      }>;
      endSession: () => Promise<{ success: boolean }>;
      onPageMetrics: (callback: (data: any) => void) => void;
      onPageNavigated: (callback: (url: string) => void) => void;
      captureScreen: () => Promise<{ success: boolean }>;
    };
  }

  // Webpack injection
  const MAIN_WINDOW_WEBPACK_ENTRY: string;
  const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
}