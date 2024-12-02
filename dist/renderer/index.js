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
// src/renderer/index.ts
require("./styles/main.css");
const session_manager_1 = require("./services/session-manager");
const ui_state_1 = require("./services/ui-state");
class WebSessionBrowser {
    constructor() {
        this.startUrl = '';
        console.log('WebSessionBrowser constructor started');
        this.sessionManager = new session_manager_1.SessionManager();
        this.uiState = new ui_state_1.UIStateManager();
        this.pagesList = document.getElementById('pages-list');
        this.modal = document.getElementById('session-modal');
        this.initializeEventListeners();
        console.log('WebSessionBrowser initialized');
    }
    initializeEventListeners() {
        var _a, _b, _c, _d, _e;
        try {
            (_a = document.getElementById('start-url')) === null || _a === void 0 ? void 0 : _a.addEventListener('keypress', (event) => {
                var _a;
                if (event.key === 'Enter') {
                    const url = event.target.value.trim();
                    if (!url) {
                        //alert('Please enter a URL');
                        return;
                    }
                    this.startUrl = url;
                    if (this.modal)
                        this.modal.style.display = 'block';
                    (_a = document.getElementById('session-name')) === null || _a === void 0 ? void 0 : _a.focus();
                }
            });
            // Session control buttons
            // Show modal when "New Session" is clicked
            (_b = document.getElementById('start-session')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
                this.startUrl = document.getElementById('start-url').value.trim();
                if (!this.startUrl) {
                    alert('Please enter a URL');
                    return;
                }
                if (this.modal)
                    this.modal.style.display = 'block';
            });
            // Handle modal save
            (_c = document.getElementById('save-session')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.handleStartSession());
            // Handle modal cancel
            (_d = document.getElementById('cancel-session')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
                if (this.modal)
                    this.modal.style.display = 'none';
            });
            (_e = document.getElementById('end-session')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => this.handleEndSession());
            // Close modal if clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === this.modal) {
                    if (this.modal)
                        this.modal.style.display = 'none';
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
                }
                catch (error) {
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
                }
                catch (error) {
                    console.error('Error handling page navigation:', error);
                }
            });
            console.log('Event listeners initialized');
        }
        catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }
    handleStartSession() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('handleStartSession (click)');
                const name = document.getElementById('session-name').value.trim() || 'test';
                const description = document.getElementById('session-description').value.trim() || 'n/a';
                if (!name || !description) {
                    alert('Please fill in all fields');
                    return;
                }
                console.log('Starting session with URL:', this.startUrl);
                yield this.sessionManager.startSession(name, description, this.startUrl);
                this.uiState.updateControls(true);
                this.updateProgress();
                // Hide modal
                if (this.modal)
                    this.modal.style.display = 'none';
                console.log('Session started successfully');
            }
            catch (error) {
                console.error('Error starting session:', error);
                alert(`Failed to start session: ${error.message}`);
            }
        });
    }
    handleEndSession() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Ending session');
                yield this.sessionManager.endSession();
                this.uiState.updateControls(false);
                if (this.pagesList)
                    this.pagesList.innerHTML = '';
                console.log('Session ended successfully');
            }
            catch (error) {
                console.error('Error ending session:', error);
            }
        });
    }
    updateProgress() {
        try {
            const session = this.sessionManager.getCurrentSession();
            if (!session || !this.pagesList)
                return;
            this.pagesList.innerHTML = session.pages
                .map(page => this.uiState.renderPage(page))
                .join('');
        }
        catch (error) {
            console.error('Error updating progress display:', error);
        }
    }
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Creating WebSessionBrowser instance');
        new WebSessionBrowser();
    }
    catch (error) {
        console.error('Error creating WebSessionBrowser:', error);
    }
});
//# sourceMappingURL=index.js.map