import { Page, SDKMetrics, XHRRequest } from '../../shared/types/session';
export declare class UIStateManager {
    updateControls(sessionActive: boolean): void;
    parseUrl(urlString: string): {
        domain: string;
        path: string;
        query: string;
    };
    renderSdks(sdks: SDKMetrics): string;
    renderXhrRequests(requests: XHRRequest[]): string;
    private renderHeaders;
    private renderRequestData;
    private renderResponseData;
    formatData(data: string): string;
    renderPage(page: Page): string;
    private renderResources;
}
//# sourceMappingURL=ui-state.d.ts.map