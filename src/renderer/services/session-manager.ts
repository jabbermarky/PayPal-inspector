// src/renderer/services/session-manager.ts
import { Session, Page, XHRRequest, ResourceEntry, SDKEntry } from '../../shared/types/session';
import { SDKIdentificationService } from './sdk-identification';

export class SessionManager {
  private currentSession: Session | null = null;
  private sdkIdentifier: SDKIdentificationService;

  constructor() {
    console.log('SessionManager constructor');
    this.sdkIdentifier = new SDKIdentificationService();
  }

  async startSession(name: string, description: string, startUrl: string): Promise<void> {
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

      const result = await window.electronAPI.createWebContents(startUrl);

      if (result.error) {
        console.error('Failed to create web contents:', result.error);
        this.currentSession = null;
        throw new Error(`Failed to load page: ${result.error}`);
      }

      // Remove this line - let the did-finish-load event trigger addNewPage
      // this.addNewPage(startUrl);
      console.log('Session started successfully');
    } catch (error) {
      console.error('Error in startSession:', error);
      this.currentSession = null;
      throw error;
    }
  }

  addNewPage(url: string): void {
    try {
      console.log('addNewPage:', url);
      if (this.currentSession?.pages.some(page => page.url === url)) {
        return;
      }

      const page: Page = {
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

      this.currentSession?.pages.push(page);
    } catch (error) {
      console.error('Error adding new page:', error);
    }
  }

  updateMetrics(data: XHRRequest | ResourceEntry): void {
    try {
      console.log('updateMetrics');
      if (!this.currentSession) return;
      const currentPage = this.currentSession.pages[this.currentSession.pages.length - 1];
      if (!currentPage) return;

      if (data.type === 'xhr') {
        currentPage.metrics.xhrRequests.push(data);
      } else if (data.type === 'resource') {
        // Identify if this resource is a known SDK/API
        const sdkMatches = this.sdkIdentifier.identifySDK(data.url);
        console.log(`identifySDK returned ${JSON.stringify(sdkMatches, null, 2)}`);

        // Process each matched integration
        sdkMatches.forEach((sdkMatch) => {
          const sdkEntry: SDKEntry = {
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
          } else {
            //if (!currentPage.metrics.sdks.sdks.some((s) => s.url === data.url)) {
              currentPage.metrics.sdks.sdks.push(sdkEntry);
            //}
          }
        });

        // Store as regular resource if not a known SDK
        if (data.resourceType === 'script') {
          currentPage.metrics.resources.scripts.push(data);
        } else if (data.resourceType === 'img') {
          currentPage.metrics.resources.images.push(data);
        }
      }
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  async endSession(): Promise<void> {
    try {
      console.log('Ending session');
      if (!this.currentSession) return;

      await window.electronAPI.endSession();
      this.currentSession = null;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }
}