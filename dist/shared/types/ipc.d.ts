export interface WebContentsResult {
    success?: boolean;
    error?: string;
    id?: number;
}
export interface MetricsData {
    type: 'xhr' | 'resource';
    url: string;
    method?: string;
    status?: number;
    timestamp: string;
    duration?: number;
    requestHeaders?: Record<string, string>;
    requestData?: string;
    resourceType?: string;
}
//# sourceMappingURL=ipc.d.ts.map