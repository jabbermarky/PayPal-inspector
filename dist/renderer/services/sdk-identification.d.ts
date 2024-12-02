interface SDKMatch {
    name: string;
    version?: string;
    isTracking: boolean;
}
export declare class SDKIdentificationService {
    private patterns;
    identifySDK(url: string): SDKMatch[];
}
export {};
//# sourceMappingURL=sdk-identification.d.ts.map