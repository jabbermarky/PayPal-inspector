"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const sdk_identification_1 = require("./sdk-identification");
class SessionManager {
    constructor() {
        this.currentSession = null;
        console.log('SessionManager constructor');
        this.sdkIdentifier = new sdk_identification_1.SDKIdentificationService();
    }
    startSession(name, description, startUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Starting new session:', { name, description, startUrl });
                this.currentSession = {
                    id: Date.now(),
                    name,
                    description,
                    startUrl,
                    startTime: new Date().toISOString(),
                    pages: []
                };
                const result = yield window.electronAPI.createWebContents(startUrl);
                if (result.error) {
                    console.error('Failed to create web contents:', result.error);
                    this.currentSession = null;
                    throw new Error(`Failed to load page: ${result.error}`);
                }
                // Remove this line - let the did-finish-load event trigger addNewPage
                // this.addNewPage(startUrl);
                console.log('Session started successfully');
            }
            catch (error) {
                console.error('Error in startSession:', error);
                this.currentSession = null;
                throw error;
            }
        });
    }
    addNewPage(url) {
        var _a, _b;
        try {
            console.log('addNewPage:', url);
            if ((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.pages.some(page => page.url === url)) {
                return;
            }
            const page = {
                url,
                visitTime: new Date().toISOString(),
                metrics: {
                    xhrRequests: [],
                    resources: {
                        scripts: [],
                        images: []
                    },
                    sdks: {
                        sdks: [],
                        tracking: []
                    }
                }
            };
            (_b = this.currentSession) === null || _b === void 0 ? void 0 : _b.pages.push(page);
        }
        catch (error) {
            console.error('Error adding new page:', error);
        }
    }
    updateMetrics(data) {
        try {
            console.log('updateMetrics');
            if (!this.currentSession)
                return;
            const currentPage = this.currentSession.pages[this.currentSession.pages.length - 1];
            if (!currentPage)
                return;
            if (data.type === 'xhr') {
                currentPage.metrics.xhrRequests.push(data);
            }
            else if (data.type === 'resource') {
                // Identify if this resource is a known SDK/API
                const sdkMatches = this.sdkIdentifier.identifySDK(data.url);
                console.log(`identifySDK returned ${JSON.stringify(sdkMatches, null, 2)}`);
                // Process each matched integration
                sdkMatches.forEach((sdkMatch) => {
                    const sdkEntry = {
                        name: sdkMatch.name,
                        version: sdkMatch.version,
                        type: data.resourceType,
                        timestamp: data.timestamp,
                        url: data.url
                    };
                    // Categorize as either SDK or tracking
                    if (sdkMatch.isTracking) {
                        //if (!currentPage.metrics.sdks.tracking.some((s) => s.url === data.url && s.name === data.name)) {
                        currentPage.metrics.sdks.tracking.push(sdkEntry);
                        //} else {
                        //  console.log(`not adding SDK ${sdkMatch.name}`);
                        //}
                    }
                    else {
                        //if (!currentPage.metrics.sdks.sdks.some((s) => s.url === data.url)) {
                        currentPage.metrics.sdks.sdks.push(sdkEntry);
                        //}
                    }
                });
                // Store as regular resource if not a known SDK
                if (data.resourceType === 'script') {
                    currentPage.metrics.resources.scripts.push(data);
                }
                else if (data.resourceType === 'img') {
                    currentPage.metrics.resources.images.push(data);
                }
            }
        }
        catch (error) {
            console.error('Error updating metrics:', error);
        }
    }
    endSession() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Ending session');
                if (!this.currentSession)
                    return;
                yield window.electronAPI.endSession();
                this.currentSession = null;
            }
            catch (error) {
                console.error('Error ending session:', error);
                throw error;
            }
        });
    }
    getCurrentSession() {
        return this.currentSession;
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=session-manager.js.map