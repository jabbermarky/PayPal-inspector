// src/renderer/services/ui-state.ts
import { Page, SDKMetrics, XHRRequest } from '../../shared/types/session';

export class UIStateManager {
  updateControls(sessionActive: boolean): void {
    const elements = {
      'session-name': sessionActive,
      'session-description': sessionActive,
      'start-url': sessionActive,
      'start-session': sessionActive,
      'end-session': !sessionActive
    };

    Object.entries(elements).forEach(([id, disabled]) => {
      const element = document.getElementById(id);
      if (element) {
        (element as HTMLInputElement).disabled = disabled;
      }
    });
  }

  parseUrl(urlString: string): { domain: string; path: string; query: string } {
    try {
      const url = new URL(urlString);
      return {
        domain: url.hostname,
        path: url.pathname === '/' ? '' : url.pathname,
        query: url.search
      };
    } catch {
      return { domain: urlString, path: '', query: '' };
    }
  }

  renderSdks(sdks: SDKMetrics): string {
    return `
      <div class="sdk-groups">
        ${sdks.sdks.length > 0 ? `
          <div class="sdk-group">
            <div class="sdk-group-title">PayPal SDKs</div>
            ${sdks.sdks.map(sdk => `
              <div class="sdk-entry">
                <div class="sdk-name">${sdk.name}</div>
                ${sdk.version ? `<div class="sdk-version">v${sdk.version}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${sdks.tracking.length > 0 ? `
          <div class="sdk-group">
            <div class="sdk-group-title">Analytics/Tracking</div>
            ${sdks.tracking.map(sdk => `
              <div class="sdk-entry">
                <div class="sdk-name">${sdk.name}</div>
                ${sdk.version ? `<div class="sdk-version">v${sdk.version}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderXhrRequests(requests: XHRRequest[]): string {
    return requests.map(xhr => {
      const xhrUrlParts = this.parseUrl(xhr.url);
      return `
        <details>
          <summary class="xhr-summary ${xhr.method === 'POST' ? 'post' : ''}">
            <div class="xhr-method ${xhr.method === 'POST' ? 'post' : ''}">${xhr.method}</div>
            <div class="xhr-url">
              <div class="domain">${xhrUrlParts.domain}</div>
              ${xhrUrlParts.path ? `<div class="path">${xhrUrlParts.path}</div>` : ''}
              ${xhrUrlParts.query ? `<div class="query">${xhrUrlParts.query}</div>` : ''}
            </div>
          </summary>
          <div class="xhr-content">
            <div>Status: ${xhr.status}</div>
            <div>Time: ${new Date(xhr.timestamp).toLocaleTimeString()}</div>
            <div>Duration: ${xhr.duration}ms</div>
            
            ${xhr.requestHeaders ? this.renderHeaders(xhr.requestHeaders) : ''}
            ${xhr.requestData ? this.renderRequestData(xhr.requestData) : ''}
            ${xhr.responseData ? this.renderResponseData(xhr.responseData) : ''}
          </div>
        </details>
      `;
    }).join('');
  }

  private renderHeaders(headers: Record<string, string>): string {
    return `
      <details class="headers-details">
        <summary>Request Headers</summary>
        <div class="headers-content">
          ${Object.entries(headers).map(([key, value]) => `
            <div class="header-line">
              <strong>${key}:</strong> ${value}
            </div>
          `).join('')}
        </div>
      </details>
    `;
  }

  private renderRequestData(data: string): string {
    return `
      <details class="request-details">
        <summary>POST Data</summary>
        <pre class="request-content">${this.formatData(data)}</pre>
      </details>
    `;
  }

  private renderResponseData(data: string): string {
    return `
      <details class="response-details">
        <summary>Response Data</summary>
        <pre class="response-content">${this.formatData(data)}</pre>
      </details>
    `;
  }

  formatData(data: string): string {
    try {
      if (data.includes('=') && data.includes('&')) {
        const params = new URLSearchParams(data);
        const formatted: Record<string, unknown> = {};
        params.forEach((value, key) => {
          try {
            formatted[key] = JSON.parse(value);
          } catch {
            formatted[key] = value;
          }
        });
        return JSON.stringify(formatted, null, 2);
      }

      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        try {
          const decoded = atob(data);
          try {
            const parsed = JSON.parse(decoded);
            return JSON.stringify(parsed, null, 2);
          } catch {
            return decoded;
          }
        } catch {
          return data;
        }
      }
    } catch {
      return data;
    }
  }

  renderPage(page: Page): string {
    const urlParts = this.parseUrl(page.url);
    const sdkCount = page.metrics.sdks.sdks.length + page.metrics.sdks.tracking.length;
    const xhrCount = page.metrics.xhrRequests.length;
    const scriptCount = page.metrics.resources.scripts.length;
    const imageCount = page.metrics.resources.images.length;

    return `
      <div class="page-entry">
        <div class="page-url">
          <div class="domain"><strong>${urlParts.domain}</strong></div>
          ${urlParts.path ? `<div class="path">${urlParts.path}</div>` : ''}
          ${urlParts.query ? `<div class="query">${urlParts.query}</div>` : ''}
        </div>
        <div class="page-timestamp">Visited: ${new Date(page.visitTime).toLocaleTimeString()}</div>
        
        ${sdkCount > 0 ? `
          <details class="section-details" open>
            <summary>SDKs/APIs (${sdkCount})</summary>
            <div class="section-content">
              ${this.renderSdks(page.metrics.sdks)}
            </div>
          </details>
        ` : ''}

        ${xhrCount > 0 ? `
          <details class="section-details">
            <summary>Requests (${xhrCount})</summary>
            <div class="section-content">
              ${this.renderXhrRequests(page.metrics.xhrRequests)}
            </div>
          </details>
        ` : ''}

        ${scriptCount > 0 ? `
          <details class="section-details">
            <summary>Scripts (${scriptCount})</summary>
            <div class="section-content">
              ${this.renderResources(page.metrics.resources.scripts)}
            </div>
          </details>
        ` : ''}

        ${imageCount > 0 ? `
          <details class="section-details">
            <summary>Images (${imageCount})</summary>
            <div class="section-content">
              ${this.renderResources(page.metrics.resources.images)}
            </div>
          </details>
        ` : ''}
      </div>
    `;
  }

  private renderResources(resources: { url: string }[]): string {
    return resources.map(resource => {
      const urlParts = this.parseUrl(resource.url);
      return `
        <div class="resource-entry">
          <div class="domain">${urlParts.domain}</div>
          ${urlParts.path ? `<div class="path">${urlParts.path}</div>` : ''}
          ${urlParts.query ? `<div class="query">${urlParts.query}</div>` : ''}
        </div>
      `;
    }).join('');
  }
}