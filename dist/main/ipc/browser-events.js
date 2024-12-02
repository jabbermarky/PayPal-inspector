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
exports.setupBrowserEvents = void 0;
// src/main/ipc/browser-events.ts
const electron_1 = require("electron");
function setupBrowserEvents(browserManager) {
    electron_1.ipcMain.handle('create-web-contents', (_, url) => __awaiter(this, void 0, void 0, function* () {
        return browserManager.createWebContents(url);
    }));
    electron_1.ipcMain.handle('end-session', () => __awaiter(this, void 0, void 0, function* () {
        return browserManager.endSession();
    }));
}
exports.setupBrowserEvents = setupBrowserEvents;
//# sourceMappingURL=browser-events.js.map