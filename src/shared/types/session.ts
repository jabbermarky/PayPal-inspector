// src/shared/types/session.ts
export interface XHRRequest {
  type: 'xhr';
  url: string;
  method: string;
  status: number;
  timestamp: string;
  duration: number;
  requestHeaders?: Record<string, string>;
  requestData?: string;
  responseData?: string;  // Added this property
}

export interface ResourceEntry {
  type: 'resource';
  resourceType: string;
  url: string;
  timestamp: string;
}

export interface SDKEntry {
  name: string;
  version?: string;
  type: string;
  timestamp: string;
  url: string;
}

export interface SDKMetrics {
  sdks: SDKEntry[];
  tracking: SDKEntry[];
}

export interface ResourceMetrics {
  scripts: ResourceEntry[];
  images: ResourceEntry[];
}

export interface PageMetrics {
  xhrRequests: XHRRequest[];
  resources: ResourceMetrics;
  sdks: SDKMetrics;
}

export interface Page {
  url: string;
  visitTime: string;
  metrics: PageMetrics;
}

export interface Session {
  id: number;
  name: string;
  description: string;
  startUrl: string;
  startTime: string;
  pages: Page[];
}