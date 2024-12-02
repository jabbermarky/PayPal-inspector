import { BrowserWindow } from "electron";
import { WebContentsResult } from '../../shared/types/ipc';
export declare class BrowserManager {
    private mainWindow;
    private contentView;
    private monitoringScript;
    constructor(mainWindow: BrowserWindow);
    private setupMenu;
    private setContentMenuState;
    private loadMonitoringScript;
    private cleanupContentView;
    createWebContents(url: string): Promise<WebContentsResult>;
    private updateContentViewBounds;
    private setupWebContentsHandlers;
    endSession(): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=browser-manager.d.ts.map