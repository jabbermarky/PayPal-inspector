// src/renderer/index.ts
import './styles/main.css';
import { SessionManager } from './services/session-manager';
import { UIStateManager } from './services/ui-state';

class WebSessionBrowser {
  private sessionManager: SessionManager;
  private uiState: UIStateManager;
  private pagesList: HTMLElement | null;
  private modal: HTMLElement | null;
  private startUrl: string = '';

  constructor() {
    console.log('WebSessionBrowser constructor started');
    this.sessionManager = new SessionManager();
    this.uiState = new UIStateManager();
    this.pagesList = document.getElementById('pages-list');
    this.modal = document.getElementById('session-modal');

    this.initializeEventListeners();
    console.log('WebSessionBrowser initialized');
  }

  private initializeEventListeners(): void {
    try {

      document.getElementById('start-url')?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          const url = (event.target as HTMLInputElement).value.trim();
          if (!url) {
            //alert('Please enter a URL');
            return;
          }
          this.startUrl = url;
          if (this.modal) this.modal.style.display = 'block';
          document.getElementById('session-name')?.focus();
        }
      });

      // Session control buttons
      // Show modal when "New Session" is clicked
      document.getElementById('start-session')?.addEventListener('click', () => {
        this.startUrl = (document.getElementById('start-url') as HTMLInputElement).value.trim();
        if (!this.startUrl) {
          alert('Please enter a URL');
          return;
        }
        if (this.modal) this.modal.style.display = 'block';
      });

      // Handle modal save
      document.getElementById('save-session')?.addEventListener('click',
        () => this.handleStartSession());

      // Handle modal cancel
      document.getElementById('cancel-session')?.addEventListener('click', () => {
        if (this.modal) this.modal.style.display = 'none';
      });

      document.getElementById('end-session')?.addEventListener('click',
        () => this.handleEndSession());

      document.getElementById("capture-screen")?.addEventListener('click',
        () => this.handleScreenCap());

      // Close modal if clicking outside
      window.addEventListener('click', (event) => {
        if (event.target === this.modal) {
          if (this.modal) this.modal.style.display = 'none';
        }
      });


      // IPC event listeners
      window.electronAPI.onPageMetrics((data) => {
        console.log('onPageMetrics started');
        try {
          if (this.sessionManager.getCurrentSession()) {
            this.sessionManager.updateMetrics(data);
            this.updateProgress();
          }
        } catch (error) {
          console.error('Error handling page metrics:', error);
        }
      });

      window.electronAPI.onPageNavigated((url) => {
        console.log('onPageNavigated started');
        try {
          if (this.sessionManager.getCurrentSession()) {
            this.sessionManager.addNewPage(url);
            this.updateProgress();
          }
        } catch (error) {
          console.error('Error handling page navigation:', error);
        }
      });

      console.log('Event listeners initialized');
    } catch (error) {
      console.error('Error initializing event listeners:', error);
    }
  }

  private async handleScreenCap(): Promise<void> {
    try {
      console.log('handleScreenCap (click)');
      const width = 0;
      const height = 0;
      const result = await window.electronAPI.captureScreen();
    } catch (error) {
      console.error('Error capturing screen:', error);
      alert(`Failed to capture screen: ${(error as Error).message}`);
    }
  }

  private async handleStartSession(): Promise<void> {
    try {
      console.log('handleStartSession (click)');
      const name = (document.getElementById('session-name') as HTMLInputElement).value.trim() || 'test';
      const description = (document.getElementById('session-description') as HTMLTextAreaElement).value.trim() || 'n/a';

      if (!name || !description) {
        alert('Please fill in all fields');
        return;
      }

      console.log('Starting session with URL:', this.startUrl);
      await this.sessionManager.startSession(name, description, this.startUrl);
      this.uiState.updateControls(true);
      this.updateProgress();

      // Hide modal
      if (this.modal) this.modal.style.display = 'none';

      console.log('Session started successfully');
    } catch (error) {
      console.error('Error starting session:', error);
      alert(`Failed to start session: ${(error as Error).message}`);
    }
  }

  private async handleEndSession(): Promise<void> {
    try {
      console.log('Ending session');
      await this.sessionManager.endSession();
      this.uiState.updateControls(false);
      if (this.pagesList) this.pagesList.innerHTML = '';
      console.log('Session ended successfully');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  private updateProgress(): void {
    try {
      const session = this.sessionManager.getCurrentSession();
      if (!session || !this.pagesList) return;

      this.pagesList.innerHTML = session.pages
        .map(page => this.uiState.renderPage(page))
        .join('');
    } catch (error) {
      console.error('Error updating progress display:', error);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Creating WebSessionBrowser instance');
    new WebSessionBrowser();
  } catch (error) {
    console.error('Error creating WebSessionBrowser:', error);
  }
});



