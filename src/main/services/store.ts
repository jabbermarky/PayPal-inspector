import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

interface ApiKeys {
  OPENAI_API_KEY?: string;
  openaiKey?: string;
  // Add other keys as needed
}

class KeyStore {
  private configPath: string;
  private data: ApiKeys;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'config.json');
    this.data = this.loadKeys();
  }

  private loadKeys(): ApiKeys {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
    return {};
  }

  private saveKeys(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }

  get(key: keyof ApiKeys): string | undefined {
    // In development, prefer .env file
    if (process.env.NODE_ENV === 'development' && process.env[key]) {
      return process.env[key];
    }
    return this.data[key];
  }

  set(key: string, value: string): void {
    if (this.isValidKey(key)) {
      this.data[key as keyof ApiKeys] = value;
      this.saveKeys();
    } else {
      console.warn(`Invalid API key name: ${key}`);
    }  }

  getAll(): ApiKeys {
    return { ...this.data };
  }

  hasRequiredKeys(): boolean {
    return !!this.data['OPENAI_API_KEY'];
  }

  private isValidKey(key: string): key is keyof ApiKeys {
    // Add all valid keys here
    const validKeys: Array<keyof ApiKeys> = ['OPENAI_API_KEY'];
    return validKeys.includes(key as keyof ApiKeys);
  }
}

// Export singleton instance
export const configStore = new KeyStore()