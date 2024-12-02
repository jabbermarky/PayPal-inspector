import { Session, XHRRequest, ResourceEntry } from '../../shared/types/session';
export declare class SessionManager {
    private currentSession;
    private sdkIdentifier;
    constructor();
    startSession(name: string, description: string, startUrl: string): Promise<void>;
    addNewPage(url: string): void;
    updateMetrics(data: XHRRequest | ResourceEntry): void;
    endSession(): Promise<void>;
    getCurrentSession(): Session | null;
}
//# sourceMappingURL=session-manager.d.ts.map